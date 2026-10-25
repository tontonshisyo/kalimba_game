(() => {
  "use strict";
  const byId = (id) => document.getElementById(id);
  let config, session = null, revision = 0, offset = 0, busy = false;
  let preparedSong = null;
  function invalidatePreparedSong() {
    preparedSong = null;
    byId('adminSongRegister').disabled = true;
    byId('adminSongSummary').textContent = '';
  }
  const status = (message) => { byId("adminStatus").textContent = message; };
  function clearSession() {
    session = null;
    revision++;
    byId("adminItems").replaceChildren();
    byId("adminPanel").hidden = true;
    byId("adminLogin").hidden = false;
    byId("adminPassword").value = "";
    invalidatePreparedSong();
    byId('adminSongLink').value = '';
  }
  function setBusy(value) {
    busy = value;
    for (const id of ["adminLoginButton", "adminReload", "adminMore", "adminKind"]) byId(id).disabled = value;
    byId("adminItems").querySelectorAll("button, select, textarea").forEach((control) => { control.disabled = value; });
    byId('adminSongImport').querySelectorAll('button,select,textarea').forEach(control=>{control.disabled=value;});
    byId('adminSongRegister').disabled = value || !preparedSong;
  }
  async function request(path, options = {}, token = session?.access_token) {
    const response = await fetch(`${config.url}${path}`, {
      ...options, cache: "no-store", signal: AbortSignal.timeout(15000),
      headers: { apikey: config.publishableKey, "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
    });
    if (!response.ok) {
      if (response.status === 401 && token && session?.access_token === token) { clearSession(); status("ログインの有効期限が切れました。再度ログインしてください。"); throw new Error("ログインの有効期限が切れました。再度ログインしてください。"); }
      if (response.status === 404) throw new Error("管理用データベースの設定が必要です。");
      if (response.status === 409) throw new Error('同じ曲がすでに登録されています。収録曲の一覧を確認してください。');
      throw new Error("操作できませんでした。アカウントの権限や接続状態を確認してください。");
    }
    return response;
  }
  async function loadItems(reset = true) {
    if (!session || busy) return;
    const ownRevision = revision;
    const kind = byId("adminKind").value;
    const nextOffset = reset ? 0 : offset;
    const columns = kind === 'shared_charts' ? 'id,song,bytes,created_at,last_used_at,uses' : kind !== "beta_feedback" ? "id,title,bpm,created_at,is_visible" : "id,category,message,created_at,is_public,status,admin_reply";
    setBusy(true);
    status("読み込んでいます…");
    try {
      const response = await request(`/rest/v1/${kind}?select=${columns}&order=created_at.desc,id.desc&limit=50&offset=${nextOffset}`);
      const rows = await response.json();
      if (ownRevision !== revision) return;
      if (!Array.isArray(rows)) throw new Error("一覧の形式が正しくありません。");
      if (reset) byId("adminItems").replaceChildren();
      for (const row of rows) {
        const article = document.createElement("article");
        if (kind === 'shared_charts') {
          const song = row.song;
          const normalized = window.OtoiroSharing.toCatalogSong(song);
          const heading = document.createElement('h2'); heading.textContent = normalized.title;
          const meta = document.createElement('p');
          meta.textContent = `BPM ${normalized.bpm} · 調号 ${normalized.key_signature} · ${normalized.meter === null ? '拍子なし' : normalized.meter === 6 ? '6/8' : normalized.meter + '/4'} · ${song.steps.length}音 · ${row.bytes} bytes\n登録：${new Date(row.created_at).toLocaleString('ja-JP')}\n最終利用：${new Date(row.last_used_at).toLocaleString('ja-JP')} · ${row.uses}回`;
          const link = document.createElement('a'); link.href = window.OtoiroSharing.publicBaseURL() + '#s=' + row.id; link.textContent = '短縮リンクで開く'; link.target = '_blank'; link.rel = 'noopener';
          const details = document.createElement('details');
          const summary = document.createElement('summary'); summary.textContent = '譜面の内容（拍・音名）';
          const source = document.createElement('textarea'); source.readOnly = true; source.value = normalized.source; source.setAttribute('aria-label', normalized.title + 'の譜面');
          details.append(summary, source); article.append(heading, meta, link, details); byId('adminItems').append(article);
          continue;
        }
        const heading = document.createElement("h2");
        heading.textContent = kind !== "beta_feedback" ? row.title : (row.is_public ? '公開の意見' : '非公開のお問い合わせ');
        const body = document.createElement("p");
        body.textContent = kind !== "beta_feedback" ? `BPM ${row.bpm} · ${row.is_visible ? "公開中" : "非公開"}` : row.message;
        const date = document.createElement("small");
        date.textContent = new Date(row.created_at).toLocaleString("ja-JP");
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "delete";
        remove.textContent = "このデータを削除";
        remove.addEventListener("click", async () => {
          const validId = kind === "catalog_songs" ? /^[A-Za-z0-9_-]{1,100}$/.test(row.id) : /^[0-9a-f-]{36}$/.test(row.id);
          if (busy || !session || !validId) return;
          if (!window.confirm(`「${heading.textContent}」を完全に削除しますか？この操作は取り消せません。`)) return;
          const deleteRevision = revision;
          setBusy(true);
          let deleted = false;
          try {
            const result = await request(`/rest/v1/${kind}?id=eq.${encodeURIComponent(row.id)}`, { method: "DELETE", headers: { Prefer: "return=representation" } });
            const removed = await result.json();
            if (!Array.isArray(removed) || removed.length !== 1) throw new Error("削除対象が見つからないか、削除権限がありません。一覧を更新してください。");
            deleted = true;
          } catch (error) { if (deleteRevision === revision) status(error.message); }
          finally { setBusy(false); }
          if (deleted && deleteRevision === revision) { await loadItems(true); status("削除しました。"); }
        });
        article.append(heading, body, date, document.createElement("br"), remove);
        if (kind === 'catalog_songs') {
          remove.textContent = 'この曲を削除';
          const toggle = document.createElement('button'); toggle.textContent = row.is_visible ? '非公開にする' : '公開する';
          toggle.onclick = async () => { if(busy)return; if(!confirm(`${row.title}を${row.is_visible?'非公開':'公開'}にしますか？`))return; setBusy(true); try { const result=await request(`/rest/v1/catalog_songs?id=eq.${encodeURIComponent(row.id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({is_visible:!row.is_visible})});const updated=await result.json();if(updated.length!==1)throw Error('更新できませんでした');setBusy(false);await loadItems(true); }catch(e){status(e.message)}finally{setBusy(false)} };
          article.append(toggle, remove);
        }
        if (kind === "beta_feedback") {
          const visibility = document.createElement("p");
          visibility.textContent = row.is_public ? "公開された意見：返信と対応状況も公開されます。" : "非公開の意見：管理画面だけに表示されます。";
          const statusLabel = document.createElement("label");
          statusLabel.textContent = "対応状況";
          const stateSelect = document.createElement("select");
          for (const [value, label] of Object.entries({ reviewing: "検討中", planned: "実装予定", implemented: "実装済み" })) {
            const option = document.createElement("option"); option.value = value; option.textContent = label; stateSelect.append(option);
          }
          stateSelect.value = row.status;
          statusLabel.append(stateSelect);
          const replyLabel = document.createElement("label");
          replyLabel.textContent = "管理者からの返信（2000文字まで）";
          const reply = document.createElement("textarea");
          reply.maxLength = 2000;
          reply.value = row.admin_reply || "";
          replyLabel.append(reply);
          const save = document.createElement("button");
          save.type = "button"; save.textContent = "返信・対応状況を保存";
          save.addEventListener("click", async () => {
            if (busy || !session || !/^[0-9a-f-]{36}$/.test(row.id)) return;
            const replyText = reply.value.trim();
            if (replyText.length > 2000) { status("返信は2000文字までです。"); return; }
            const selectedStatus = stateSelect.value;
            if (!["reviewing", "planned", "implemented"].includes(selectedStatus)) return;
            if (row.is_public && !window.confirm("返信と対応状況を公開して保存しますか？")) return;
            const saveRevision = revision;
            setBusy(true);
            try {
              const response = await request(`/rest/v1/beta_feedback?id=eq.${encodeURIComponent(row.id)}`, {
                method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status: selectedStatus, admin_reply: replyText })
              });
              const updated = await response.json();
              if (!Array.isArray(updated) || updated.length !== 1) throw new Error("保存対象が見つからないか、更新権限がありません。");
              if (saveRevision === revision) {
                row.status = selectedStatus; row.admin_reply = replyText;
                status("返信と対応状況を保存しました。");
              }
            } catch (error) { if (saveRevision === revision) status(error.message); }
            finally { setBusy(false); }
          });
          article.append(visibility, statusLabel, replyLabel, save);
        }
        byId("adminItems").append(article);
      }
      offset = nextOffset + rows.length;
      byId("adminMore").hidden = rows.length < 50;
      status(rows.length ? `${offset}件を表示しています。` : nextOffset ? "すべて読み込みました。" : "データはありません。");
    } catch (error) { if (ownRevision === revision) status(error.message); }
    finally { setBusy(false); }
  }
  byId("adminLogin").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    status("ログインしています…");
    try {
      if (!config) {
        const response = await fetch("assets/data/community-config.json", { cache: "no-store" });
        if (!response.ok) throw new Error("接続設定を読み込めませんでした。");
        config = await response.json();
        if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(config.url) || !/^sb_publishable_/.test(config.publishableKey)) throw new Error("接続設定が正しくありません。");
      }
      const response = await request("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email: byId("adminEmail").value.trim(), password: byId("adminPassword").value }) });
      session = await response.json();
      byId("adminPassword").value = "";
      const membership = await request(`/rest/v1/otoiro_admins?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}`);
      const admins = await membership.json();
      if (!Array.isArray(admins) || admins.length !== 1) throw new Error("このアカウントは管理者として登録されていません。");
      revision++;
      byId("adminPanel").hidden = false;
      byId("adminLogin").hidden = true;
    } catch (error) { clearSession(); status(error.message); }
    finally { setBusy(false); }
    if (session) await loadItems(true);
  });
  byId("adminLogout").addEventListener("click", () => {
    const token = session?.access_token;
    clearSession();
    status("ログアウトしました。");
    if (token) request("/auth/v1/logout", { method: "POST" }, token).catch(() => {});
  });
  byId('adminSongLink').addEventListener('input',invalidatePreparedSong);
  byId('adminSongPreview').addEventListener('click',async()=>{
    if(busy || !session)return;
    invalidatePreparedSong();
    const snapshot=byId('adminSongLink').value, ownRevision=revision;
    setBusy(true);
    try {
      const match=/#song=1[bgjz]\.[A-Za-z0-9_-]+/.exec(snapshot);
      if(!match)throw new Error('おといろの共有リンクを貼り付けてください。');
      const song=window.OtoiroSharing.toCatalogSong(await window.OtoiroSharing.readLink(match[0]));
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(song)));
      const id='user-catalog-'+[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('').slice(0,32);
      if(ownRevision!==revision || !session || snapshot!==byId('adminSongLink').value)return;
      preparedSong={id,...song};
      const count=song.source.split('\n').length;
      byId('adminSongSummary').textContent=`${song.title} · BPM ${song.bpm} · 調号 ${song.key_signature} · ${song.meter===null?'拍子なし':song.meter===6?'6/8':song.meter+'/4'} · ${count}音`;
    }catch(error){if(ownRevision===revision)byId('adminSongSummary').textContent=error.message;}
    finally{setBusy(false);}
  });
  byId('adminSongImport').addEventListener('submit',async event=>{
    event.preventDefault();if(busy || !session || !preparedSong)return;
    const song={...preparedSong,is_visible:byId('adminSongVisibility').value==='public'}, ownRevision=revision;
    if(!confirm(`「${song.title}」を${song.is_visible?'公開':'非公開'}で登録しますか？`))return;
    setBusy(true);let saved=false;
    try {
      const rows=await(await request('/rest/v1/catalog_songs',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(song)})).json();
      if(!Array.isArray(rows)||rows.length!==1)throw new Error('登録結果を確認できませんでした。');
      if(ownRevision===revision && session){invalidatePreparedSong();byId('adminSongLink').value='';byId('adminKind').value='catalog_songs';saved=true;}
    }catch(error){if(ownRevision===revision)status(error.message);}
    finally{setBusy(false);}
    if(saved){await loadItems(true);status(`「${song.title}」を${song.is_visible?'公開':'非公開'}で登録しました。ゲームを再読み込みすると反映されます。`);}
  });
  byId("adminReload").addEventListener("click", () => loadItems(true));
  byId('adminBackup').addEventListener('click',async()=>{
    if(!session || busy)return;setBusy(true);byId('adminBackup').disabled=true;
    try{const backup={exportedAt:new Date().toISOString()};for(const table of ['catalog_songs','beta_feedback']){const all=[];let start=0;while(true){const rows=await(await request(`/rest/v1/${table}?select=*&order=id.asc&limit=500&offset=${start}`)).json();if(!Array.isArray(rows))throw Error('取得できませんでした');all.push(...rows);if(rows.length<500)break;start+=rows.length;}backup[table]=all;}const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='otoiro-admin-backup-'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);status('バックアップを書き出しました。非公開のお問い合わせを含むため、安全に保管してください。');}catch(e){status(e.message)}finally{setBusy(false);byId('adminBackup').disabled=false;}
  });
  byId("adminMore").addEventListener("click", () => loadItems(false));
  byId("adminKind").addEventListener("change", () => loadItems(true));
})();
