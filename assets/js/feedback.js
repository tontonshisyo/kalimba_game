(() => {
  "use strict";
  const form = document.getElementById("betaFeedbackForm");
  const field = document.getElementById("feedbackMessage");
  const button = document.getElementById("feedbackSend");
  const status = document.getElementById("feedbackStatus");
  let busy = false, config;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    const message = field.value.trim();
    if (!message || message.length > 2000) { status.textContent = "内容を1〜2000文字で入力してください。"; return; }
    const category = document.getElementById("feedbackCategory").value;
    if (!["idea", "bug", "other"].includes(category)) return;
    busy = true;
    button.disabled = true;
    status.textContent = "送信しています…";
    try {
      if (!config) {
        const result = await fetch("assets/data/community-config.json", { cache: "no-store", signal: AbortSignal.timeout(15000) });
        if (!result.ok) throw new Error("接続設定を読み込めませんでした。");
        const candidate = await result.json();
        if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(candidate.url) || !/^sb_publishable_/.test(candidate.publishableKey)) throw new Error("意見箱は準備中です。");
        config = candidate;
      }
      const response = await fetch(`${config.url.replace(/\/$/, "")}/rest/v1/beta_feedback`, {
        method: "POST", headers: { apikey: config.publishableKey, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ category, message }), signal: AbortSignal.timeout(15000)
      });
      if (response.status === 404) throw new Error("意見箱は受付の準備中です。しばらくしてからお試しください。");
      if (!response.ok) throw new Error("送信できませんでした。入力内容を残してありますので、しばらくしてから再度お試しください。");
      if (field.value.trim() === message) field.value = "";
      status.textContent = "ご意見を受け付けました。ありがとうございます！";
    } catch (error) {
      status.textContent = error.name === "TimeoutError" || error.name === "TypeError" ? "通信できませんでした。入力内容を残してありますので、接続を確認して再度お試しください。" : error.message;
    } finally { busy = false; button.disabled = false; }
  });
})();

