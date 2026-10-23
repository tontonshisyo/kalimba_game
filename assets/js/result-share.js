(() => {
  "use strict";
  const shareButton = document.getElementById("shareResultImageButton");
  const saveButton = document.getElementById("saveResultImageButton");
  const retryButton = document.getElementById("retryResultImageButton");
  const preview = document.getElementById("resultImagePreview");
  const status = document.getElementById("resultImageStatus");
  const commentInput = document.getElementById("resultShareComment");
  const openXButton = document.getElementById("openResultXButton");
  let latestResult = null;
 let imageFile = null;
  let previewURL = null;
  let generation = 0;
  const font = '"Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif';

  function defaultComment(result) {
    let url = "https://otoiro.pages.dev/";
    try { url = window.OtoiroSharing.publicBaseURL(); } catch {}
    const mode = result.mode === "練習モード" ? "（練習モード）" : "";
    return `「${result.song}」で${result.score.toLocaleString()}点！${mode}\nあなたもカリンバに挑戦してみませんか？\n${url}\n#おといろ #カリンバ #音ゲー`;
  }
  function getComment() {
    const value = commentInput.value.trim();
    commentInput.setCustomValidity(value ? "" : "投稿コメントを入力してください。");
    if (!value) {
      status.textContent = "コメントを入力するか、「例文に戻す」を押してください。";
      commentInput.focus();
      commentInput.reportValidity();
      return null;
    }
    const tagged = window.OtoiroSharing.withHashtags(value);
    if (tagged.length > Number(commentInput.maxLength)) {
      commentInput.setCustomValidity("ハッシュタグを含めて500文字以内にしてください。");
      status.textContent = "投稿コメントが長すぎます。短くしてください。";
      commentInput.focus();
      commentInput.reportValidity();
      return null;
    }
    commentInput.value = tagged;
    return tagged;
  }
  commentInput.addEventListener("input", () => commentInput.setCustomValidity(""));
  document.getElementById("resetResultCommentButton").addEventListener("click", () => {
    if (!latestResult) return;
    commentInput.value = defaultComment(latestResult);
    commentInput.setCustomValidity("");
    status.textContent = "得点入りの例文に戻しました。";
  });
  document.getElementById("copyResultCommentButton").addEventListener("click", async () => {
    const comment = getComment();
    if (!comment) return;
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(comment);
      else {
        commentInput.focus(); commentInput.select();
        if (!document.execCommand("copy")) throw new Error("copy unavailable");
      }
      status.textContent = "コメントをコピーしました。SNSの投稿画面に貼り付けられます。";
    } catch {
      commentInput.focus(); commentInput.select();
      status.textContent = "コメントを選択しました。長押しなどでコピーしてください。";
    }
  });

  function box(ctx, x, y, width, height, radius, fill) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }
  function text(ctx, value, x, y, size, color, maxWidth, weight = 700) {
    value = String(value);
    while (size > 18) {
      ctx.font = weight + " " + size + "px " + font;
      if (ctx.measureText(value).width <= maxWidth) break;
      size--;
    }
    ctx.fillStyle = color;
    ctx.fillText(value, x, y, maxWidth);
  }
  function instrument(ctx) {
    box(ctx, 966, 86, 122, 145, 28, "#d3a677");
    box(ctx, 974, 94, 106, 129, 22, "#e5c29a");
    ctx.fillStyle = "#9a704b";
    ctx.beginPath(); ctx.arc(1027, 184, 18, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 7; i++) {
      const length = 42 + (3 - Math.abs(i - 3)) * 17;
      box(ctx, 987 + i * 12, 110, 8, length, 4, "#fff8e9");
    }
    box(ctx, 981, 122, 92, 6, 3, "#a17b54");
  }
  async function renderImage(result) {
    if (document.fonts?.ready) await document.fonts.ready;
    const canvas = document.createElement("canvas");
    canvas.width = 1200; canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("画像を作成できませんでした。");
    const gradient = ctx.createLinearGradient(0, 0, 1200, 1200);
    gradient.addColorStop(0, "#f7eddc");
    gradient.addColorStop(1, "#dfbd92");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1200, 1200);
    ctx.strokeStyle = "#9a643414"; ctx.lineWidth = 2;
    for (let y = 16; y < 1200; y += 31) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(350, y - 14, 800, y + 18, 1200, y + 3); ctx.stroke();
    }
    box(ctx, 48, 48, 1104, 1104, 44, "#fffaf0");
    instrument(ctx);
    text(ctx, "おといろ", 104, 139, 48, "#704729", 780);
    text(ctx, "演奏結果", 106, 189, 25, "#97704e", 750, 500);
    // Wrap by Unicode code point so long Japanese titles fit without splitting surrogates.
    const lines = [""];
    ctx.font = "700 43px " + font;
    for (const character of Array.from(result.song)) {
      const last = lines.length - 1;
      if (ctx.measureText(lines[last] + character).width > 976 && last === 0) lines.push(character);
      else lines[lines.length - 1] += character;
    }
    lines.forEach((line, i) => text(ctx, line, 104, 279 + i * 55, 43, "#493426", 976));
    text(ctx, result.mode + " · BPM " + result.bpm, 106, 380, 25, "#80654f", 976, 500);
    text(ctx, "SCORE", 106, 441, 24, "#97704e", 976, 500);
    text(ctx, result.score.toLocaleString() + " pt", 100, 554, 108, "#855431", 980);
    const entries = [
      ["PERFECT", result.perfect, "#8a5b35"],
      ["GOOD", result.good, "#a77b39"],
      ["MISS", result.miss, "#a35b49"]
    ];
    entries.forEach(([label, value, color], i) => {
      const x = 104 + i * 332;
      box(ctx, x, 611, 312, 170, 22, "#f1e3cf");
      text(ctx, label, x + 24, 658, 25, color, 264);
      text(ctx, value.toLocaleString(), x + 22, 745, 66, "#493426", 268);
    });
    [["最高コンボ", result.combo.toLocaleString()], ["正確さ", result.accuracy], ["余計な音", (result.extra ?? 0).toLocaleString()]].forEach(([label, value], i) => {
      const x = 104 + i * 332;
      box(ctx, x, 803, 312, 160, 22, "#f5ead9");
      text(ctx, label, x + 24, 849, 25, "#80654f", 264, 500);
      text(ctx, value, x + 22, 925, 56, "#704729", 268);
    });
    ctx.strokeStyle = "#ddc5a7"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(104, 1006); ctx.lineTo(1096, 1006); ctx.stroke();
    text(ctx, "17鍵カリンバで演奏", 106, 1065, 24, "#80654f", 976, 500);
    let host = "otoiro.pages.dev";
    try { host = new URL(window.OtoiroSharing.publicBaseURL()).host; } catch {}
    text(ctx, host, 106, 1107, 28, "#855431", 976);
    const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("画像を作成できませんでした。")), "image/png"));
    return new File([blob], "otoiro-result.png", { type: "image/png" });
  }
  async function prepare(result, resetComment = true) {
    latestResult = { ...result };
    const snapshot = latestResult;
    if (resetComment) {
      commentInput.value = defaultComment(snapshot);
      commentInput.setCustomValidity("");
    }
    const current = ++generation;
    imageFile = null;
    shareButton.disabled = true;
    saveButton.disabled = true;
    openXButton.disabled = true;
    retryButton.hidden = true;
    preview.hidden = true;
    if (previewURL) { URL.revokeObjectURL(previewURL); previewURL = null; }
    status.textContent = "共有画像を作成しています…";
    try {
      const file = await renderImage(snapshot);
      if (current !== generation) return;
      imageFile = file;
      previewURL = URL.createObjectURL(file);
      preview.src = previewURL;
      preview.hidden = false;
      let canShare = false;
      try { canShare = !!(navigator.share && navigator.canShare?.({ files: [file], text: commentInput.value, title: "おといろの演奏結果" })); } catch {}
      shareButton.hidden = !canShare;
      shareButton.disabled = false;
      saveButton.disabled = false;
      openXButton.disabled = false;
      status.textContent = canShare ? "画像とコメントをセットで共有できます。" : "画像を保存し、コメントをコピーしてSNSに投稿できます。";
    } catch {
      if (current !== generation) return;
      retryButton.hidden = false;
      status.textContent = "画像を作成できませんでした。「画像を再作成」を押してください。";
    }
  }
  shareButton.addEventListener("click", async () => {
    if (!imageFile) return;
    const comment = getComment();
    if (!comment) return;
    try { await navigator.share({ files: [imageFile], title: "おといろの演奏結果", text: comment }); }
    catch (error) { if (error.name !== "AbortError") status.textContent = "共有できませんでした。「画像を保存」からSNSに投稿してください。"; }
  });
  saveButton.addEventListener("click", () => {
    if (!imageFile) return;
    window.OtoiroSharing.download(imageFile);
    status.textContent = "画像を保存したら、コメントをコピーして投稿してください。Xでは「コメント付きでXを開く」から画像を添付できます。";
  });
  openXButton.addEventListener("click", () => {
    if (!imageFile) return;
    const comment = getComment();
    if (!comment) return;
    const intent = new URL("https://twitter.com/intent/tweet");
    intent.searchParams.set("text", comment);
    window.open(intent.href, "_blank", "noopener,noreferrer");
    status.textContent = "Xの投稿画面で、保存したリザルト画像を添付してください。コメントは入力済みです。";
  });
  retryButton.addEventListener("click", () => { if (latestResult) prepare(latestResult, false); });
  document.addEventListener("otoiro:result", event => prepare(event.detail));
  window.OtoiroResultImage = Object.freeze({ render: renderImage });
})();

