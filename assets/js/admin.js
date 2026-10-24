(() => {
  "use strict";
  const byId = (id) => document.getElementById(id);
  const keyNotes = ["D6","B5","G5","E5","C5","A4","F4","D4","C4","E4","G4","B4","D5","F5","A5","C6","E6"];
  const laneByNote = new Map(keyNotes.map((note, lane) => [note, lane]));
  const pitchByLane = [26,23,19,16,12,9,5,2,0,4,7,11,14,17,21,24,28];
  let config, session = null, revision = 0, offset = 0, busy = false;
  const status = (message) => { byId("adminStatus").textContent = message; };
  function clearSession() {
    session = null;
    revision++;
    byId("adminItems").replaceChildren();
    byId("officialSongs").replaceChildren();
    byId("adminPanel").hidden = true;
    byId("adminLogin").hidden = false;
    byId("adminPassword").value = "";
  }
  function setBusy(value) {
    busy = value;
    for (const id of ["adminLoginButton", "adminReload", "adminMore", "adminKind", "officialSongSubmit"]) byId(id).disabled = value;
    byId("adminItems").querySelectorAll("button, select, textarea").forEach((control) => { control.disabled = value; });
    byId("officialSongs").querySelectorAll("button").forEach((control) => { control.disabled = value; });
    byId("officialSongForm").querySelectorAll("input, select, textarea").forEach((control) => { control.disabled = value; });
  }
  async function request(path, options = {}, token = session?.access_token) {
    const response = await fetch(config.url + path, {
      ...options, cache: "no-store", signal: AbortSignal.timeout(15000),
      headers: { apikey: config.publishableKey, "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}), ...options.headers }
    });
    if (!response.ok) {
      if (response.status === 401 && token && session?.access_token === token) { clearSession(); status("ログインの有効期限が切れました。再度ログインしてください。"); throw new Error("ログインの有効期限が切れました。再度ログインしてください。"); }
      if (response.status === 404) throw new Error("管理用データベースの設定が必要です。");
      throw new Error("操作できませんでした。アカウントの権限や接続状態を確認してください。");
    }
    return response;
  }
  function parseNotes(input) {
    const lines = input.split(/
?
/);
    const notes = [];
    const seen = new Set();
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index].trim();
      if (!line || line.startsWith("#")) continue;
      const match = /^(d+(?:.d+)?),([A-G][0-9])$/.exec(line);
      if (!match) throw new Error((index + 1) + "行目の形式を確認してください（例：0,C4）。");
      const beat = Number(match[1]);
      const lane = laneByNote.get(match[2]);
      if (!Number.isFinite(beat) || beat < 0 || beat > 10000 || lane === undefined) throw new Error((index + 1) + "行目の拍または音名が標準17鍵の範囲外です。");
      const key = beat + ":" + lane;
      if (seen.has(key)) throw new Error((index + 1) + "行目が同じ拍・音名と重複しています。");
      seen.add(key);
      notes.push({ beat, lane });
      if (notes.length > 2000) throw new Error("譜面は2000音までです。");
    }
    if (!notes.length) throw new Error("譜面を1音以上入力してください。");
    notes.sort((a, b) => a.beat - b.beat || pitchByLane[a.lane] - pitchByLane[b.lane]);
    return notes;
  }
  async function loadItems(reset = true) {
    if (!session || busy) return;
    const ownRevision = revision;
    const nextOffset = reset ? 0 : offset;
    setBusy(true);
    status("読み込んでいます…");
    try {
      const response = await request("/rest/v1/beta_feedback?select=id,category,message,created_at,is_public,status,admin_reply&order=created_at.desc,id.desc&limit=50&offset=" + nextOffset);
      const rows = await response.json();
      if (ownRevision !== revision) return;
      if (!Array.isArray(rows)) throw new Error("一覧の形式が正しくありません。");
      if (reset) byId("adminItems").replaceChildren();
      for (const row of rows) renderFeedback(row, ownRevision);
      offset = nextOffset + rows.length;
      byId("adminMore").hidden = rows.length < 50;
      status(rows.length ? offset + "件を表示しています。" : nextOffset ? "すべて読み込みました。" : "データはありません。");
    } catch (error) { if (ownRevision === revision) status(error.message); }
    finally { setBusy(false); }
  }
  function renderFeedback(row, ownRevision) {
    const article = document.createElement("article");
    const heading = document.createElement("h2");
    heading.textContent = ({ idea: "アイデア", bug: "不具合", other: "その他" }[row.category] || "意見");
    const body = document.createElement("p"); body.textContent = row.message;
    const date = document.createElement("small"); date.textContent = new Date(row.created_at).toLocaleString("ja-JP");
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "delete"; remove.textContent = "このデータを削除";
    remove.addEventListener("click", async () => {
      if (busy || !session || !/^[0-9a-f-]{36}$/i.test(row.id)) return;
      if (!window.confirm("この意見を完全に削除しますか？この操作は取り消せません。")) return;
      setBusy(true);
      try {
        const result = await request("/rest/v1/beta_feedback?id=eq." + encodeURIComponent(row.id), { method: "DELETE", headers: { Prefer: "return=representation" } });
        const removed = await result.json();
        if (!Array.isArray(removed) || removed.length !== 1) throw new Error("削除対象が見つからないか、削除権限がありません。一覧を更新してください。");
        if (ownRevision === revision) { article.remove(); status("削除しました。"); }
      } catch (error) { if (ownRevision === revision) status(error.message); }
      finally { setBusy(false); }
    });
    article.append(heading, body, date, document.createElement("br"), remove);
    const visibility = document.createElement("p");
    visibility.textContent = row.is_public ? "公開された意見：返信と対応状況も公開されます。" : "非公開の意見：管理画面だけに表示されます。";
    const statusLabel = document.createElement("label"); statusLabel.textContent = "対応状況";
    const stateSelect = document.createElement("select");
    for (const [value, label] of Object.entries({ reviewing: "検討中", planned: "実装予定", implemented: "実装済み" })) {
      const option = document.createElement("option"); option.value = value; option.textContent = label; stateSelect.append(option);
    }
    stateSelect.value = row.status; statusLabel.append(stateSelect);
    const replyLabel = document.createElement("label"); replyLabel.textContent = "管理者からの返信（2000文字まで）";
    const reply = document.createElement("textarea"); reply.maxLength = 2000; reply.value = row.admin_reply || ""; replyLabel.append(reply);
    const save = document.createElement("button"); save.type = "button"; save.textContent = "返信・対応状況を保存";
    save.addEventListener("click", async () => {
      if (busy || !session || !/^[0-9a-f-]{36}$/i.test(row.id)) return;
      const replyText = reply.value.trim();
      if (replyText.length > 2000) { status("返信は2000文字までです。"); return; }
      const selectedStatus = stateSelect.value;
      if (!["reviewing", "planned", "implemented"].includes(selectedStatus)) return;
      if (row.is_public && !window.confirm("返信と対応状況を公開して保存しますか？")) return;
      setBusy(true);
      try {
        const response = await request("/rest/v1/beta_feedback?id=eq." + encodeURIComponent(row.id), {
          method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status: selectedStatus, admin_reply: replyText })
        });
        const updated = await response.json();
        if (!Array.isArray(updated) || updated.length !== 1) throw new Error("保存対象が見つからないか、更新権限がありません。");
        if (ownRevision === revision) { row.status = selectedStatus; row.admin_reply = replyText; status("返信と対応状況を保存しました。"); }
      } catch (error) { if (ownRevision === revision) status(error.message); }
      finally { setBusy(false); }
    });
    article.append(visibility, statusLabel, replyLabel, save);
    byId("adminItems").append(article);
  }
  async function loadOfficialSongs() {
    if (!session || busy) return;
    const ownRevision = revision;
    setBusy(true);
    try {
      const response = await request("/rest/v1/otoiro_official_songs?select=id,title,bpm,key_signature,created_at,notes&order=created_at.desc,id.desc&limit=1000");
      const rows = await response.json();
      if (ownRevision !== revision) return;
      if (!Array.isArray(rows)) throw new Error("公開曲一覧の形式が正しくありません。");
      byId("officialSongs").replaceChildren();
      for (const row of rows) {
        const article = document.createElement("article");
        const heading = document.createElement("h2"); heading.textContent = row.title;
        const detail = document.createElement("p"); detail.textContent = "BPM " + row.bpm + " · " + row.key_signature + " · " + row.notes.length + "音";
        const date = document.createElement("small"); date.textContent = new Date(row.created_at).toLocaleString("ja-JP");
        const remove = document.createElement("button"); remove.type = "button"; remove.className = "delete"; remove.textContent = "公開曲を削除";
        remove.addEventListener("click", async () => {
          if (busy || !session || !/^[0-9a-f-]{36}$/i.test(row.id)) return;
          if (!window.confirm("「" + row.title + "」を全員の曲一覧から削除しますか？")) return;
          setBusy(true);
          try {
            const result = await request("/rest/v1/otoiro_official_songs?id=eq." + encodeURIComponent(row.id), { method: "DELETE", headers: { Prefer: "return=representation" } });
            const removed = await result.json();
            if (!Array.isArray(removed) || removed.length !== 1) throw new Error("公開曲を削除できませんでした。");
            if (ownRevision === revision) { article.remove(); status("公開曲を削除しました。"); }
          } catch (error) { if (ownRevision === revision) status(error.message); }
          finally { setBusy(false); }
        });
        article.append(heading, detail, date, document.createElement("br"), remove);
        byId("officialSongs").append(article);
      }
      if (!rows.length) byId("officialSongs").textContent = "公開済みの曲はありません。";
    } catch (error) { if (ownRevision === revision) status(error.message); }
    finally { setBusy(false); }
  }
  byId("officialSongForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || !session) return;
    const title = byId("officialSongTitle").value.trim();
    const bpm = Number(byId("officialSongBpm").value);
    if (!title || title.length > 40) { status("曲名は1〜40文字で入力してください。"); return; }
    if (!Number.isInteger(bpm) || bpm < 30 || bpm > 240) { status("BPMは30〜240の整数で入力してください。"); return; }
    let notes;
    try { notes = parseNotes(byId("officialSongNotes").value); }
    catch (error) { status(error.message); return; }
    const keySignature = byId("officialSongKeySignature").value;
    if (!["C","G","D","A","E","B","Fs","Cs","F","Bb","Eb","Ab","Db","Gb","Cb"].includes(keySignature)) { status("調の選択が正しくありません。"); return; }
    setBusy(true);
    status("公開曲を登録しています…");
    try {
      const response = await request("/rest/v1/otoiro_official_songs", {
        method: "POST", headers: { Prefer: "return=representation" },
        body: JSON.stringify({ title, bpm, key_signature: keySignature, notes, is_published: true })
      });
      const inserted = await response.json();
      if (!Array.isArray(inserted) || inserted.length !== 1) throw new Error("登録結果を確認できませんでした。一覧を更新してください。");
      byId("officialSongForm").reset(); byId("officialSongBpm").value = "100";
      status("「" + title + "」を登録しました。全員の曲一覧に公開されます。");
    } catch (error) { status(error.message); }
    finally { setBusy(false); }
    if (session) await loadOfficialSongs();
  });
  byId("adminLogin").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); status("ログインしています…");
    try {
      if (!config) {
        const response = await fetch("assets/data/community-config.json", { cache: "no-store" });
        if (!response.ok) throw new Error("接続設定を読み込めませんでした。");
        config = await response.json();
        const endpoint = new URL(config.url);         if (endpoint.protocol !== "https:" || !/^[a-z0-9-]+[.]supabase[.]co$/.test(endpoint.hostname) || !/^sb_publishable_/.test(config.publishableKey)) throw new Error("接続設定が正しくありません。");
      }
      const response = await request("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email: byId("adminEmail").value.trim(), password: byId("adminPassword").value }) });
      session = await response.json();
      byId("adminPassword").value = "";
      const membership = await request("/rest/v1/otoiro_admins?select=user_id&user_id=eq." + encodeURIComponent(session.user.id));
      const admins = await membership.json();
      if (!Array.isArray(admins) || admins.length !== 1) throw new Error("このアカウントは管理者として登録されていません。");
      revision++; byId("adminPanel").hidden = false; byId("adminLogin").hidden = true;
    } catch (error) { clearSession(); status(error.message); }
    finally { setBusy(false); }
    if (session) { await loadItems(true); await loadOfficialSongs(); }
  });
  byId("adminLogout").addEventListener("click", () => {
    const token = session?.access_token; clearSession(); status("ログアウトしました。");
    if (token) request("/auth/v1/logout", { method: "POST" }, token).catch(() => {});
  });
  byId("adminReload").addEventListener("click", async () => { await loadItems(true); await loadOfficialSongs(); });
  byId("adminMore").addEventListener("click", () => loadItems(false));
  byId("adminKind").addEventListener("change", () => loadItems(true));
})();
