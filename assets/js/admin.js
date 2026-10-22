(() => {
  "use strict";
  const byId = (id) => document.getElementById(id);
  let config, session = null, revision = 0, offset = 0, busy = false;
  const status = (message) => { byId("adminStatus").textContent = message; };
  function clearSession() {
    session = null;
    revision++;
    byId("adminItems").replaceChildren();
    byId("adminPanel").hidden = true;
    byId("adminLogin").hidden = false;
    byId("adminPassword").value = "";
  }
  function setBusy(value) {
    busy = value;
    for (const id of ["adminLoginButton", "adminReload", "adminMore", "adminKind"]) byId(id).disabled = value;
    byId("adminItems").querySelectorAll("button").forEach((button) => { button.disabled = value; });
  }
  async function request(path, options = {}, token = session?.access_token) {
    const response = await fetch(`${config.url}${path}`, {
      ...options, cache: "no-store", signal: AbortSignal.timeout(15000),
      headers: { apikey: config.publishableKey, "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
    });
    if (!response.ok) {
      if (response.status === 401 && token && session?.access_token === token) { clearSession(); status("ログインの有効期限が切れました。再度ログインしてください。"); throw new Error("ログインの有効期限が切れました。再度ログインしてください。"); }
      if (response.status === 404) throw new Error("管理用データベースの設定が必要です。");
      throw new Error("操作できませんでした。アカウントの権限や接続状態を確認してください。");
    }
    return response;
  }
  async function loadItems(reset = true) {
    if (!session || busy) return;
    const ownRevision = revision;
    const kind = byId("adminKind").value;
    const nextOffset = reset ? 0 : offset;
    const columns = kind === "community_songs" ? "id,title,bpm,created_at,is_visible" : "id,category,message,created_at";
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
        const heading = document.createElement("h2");
        heading.textContent = kind === "community_songs" ? row.title : ({ idea: "アイデア", bug: "不具合", other: "その他" }[row.category] || "意見");
        const body = document.createElement("p");
        body.textContent = kind === "community_songs" ? `BPM ${row.bpm} · ${row.is_visible ? "公開中" : "非表示"}` : row.message;
        const date = document.createElement("small");
        date.textContent = new Date(row.created_at).toLocaleString("ja-JP");
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "delete";
        remove.textContent = "このデータを削除";
        remove.addEventListener("click", async () => {
          if (busy || !session || !/^[0-9a-f-]{36}$/.test(row.id)) return;
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
  byId("adminReload").addEventListener("click", () => loadItems(true));
  byId("adminMore").addEventListener("click", () => loadItems(false));
  byId("adminKind").addEventListener("change", () => loadItems(true));
})();

