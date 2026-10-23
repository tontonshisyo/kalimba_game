(() => {
  "use strict";
  const dialog = document.getElementById("freeVideoDialog");
  const canvas = document.getElementById("freeVideoCanvas");
  const preview = document.getElementById("freeVideoPreview");
  const status = document.getElementById("freeVideoStatus");
  const make = document.getElementById("makeFreeVideoButton");
  const share = document.getElementById("shareFreeVideoButton");
  const save = document.getElementById("saveFreeVideoButton");
  const cancel = document.getElementById("cancelFreeVideoButton");
  const startInput = document.getElementById("freeVideoStart");
  const endInput = document.getElementById("freeVideoEnd");
  const comment = document.getElementById("freeVideoComment");
  let recording = null, file = null, objectURL = null, job = null;
  const mimeTypes = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  function supported() {
    return !!(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream && (window.AudioContext || window.webkitAudioContext) && (window.OfflineAudioContext || window.webkitOfflineAudioContext));
  }
  function clearFile() {
    preview.pause(); preview.removeAttribute("src"); preview.load(); preview.hidden = true;
    if (objectURL) URL.revokeObjectURL(objectURL);
    objectURL = null; file = null; share.hidden = true; save.hidden = true;
  }
  function setBusy(busy) {
    make.disabled = busy; startInput.disabled = busy; endInput.disabled = busy;
    cancel.hidden = !busy;
  }
  function cleanup(task) {
    cancelAnimationFrame(task.frame);
    try { task.source?.stop(); } catch {}
    try { if (task.recorder?.state !== "inactive") task.recorder?.stop(); } catch {}
    task.stream?.getTracks().forEach(track => track.stop());
    if (task.audio && task.audio.state !== "closed") task.audio.close().catch(() => {});
  }
  function abort(message) {
    if (!job) return;
    const task = job; job = null; task.cancelled = true;
    cleanup(task); setBusy(false); canvas.hidden = true;
    status.textContent = message;
  }
  function draw(events, notes, elapsed, duration) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height, left = 30, keyY = 695, keyW = (w - 60) / 17;
    ctx.fillStyle = "#f3e7d5"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#a8774514"; ctx.lineWidth = 2;
    for (let y = 10; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(220, y - 10, 500, y + 10, w, y); ctx.stroke(); }
    ctx.fillStyle = "#704729"; ctx.font = 'bold 36px "Yu Gothic", sans-serif'; ctx.fillText("おといろ", 36, 65);
    ctx.font = '20px "Yu Gothic", sans-serif'; ctx.fillText("フリー演奏", 38, 102);
    ctx.fillStyle = "#493426"; ctx.fillRect(20, 136, w - 40, 545);
    for (let i = 0; i < 17; i++) {
      const x = left + keyW * (i + .5);
      ctx.strokeStyle = "#e5c29a20"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, 146); ctx.lineTo(x, keyY); ctx.stroke();
      const active = events.some(event => event.lane === i && elapsed >= event.time && elapsed - event.time < .18);
      ctx.fillStyle = active ? "#dba15e" : "#fff8e9";
      const keyH = 68 + (8 - Math.abs(i - 8)) * 6;
      ctx.fillRect(left + keyW * i + 2, keyY, keyW - 4, keyH);
      ctx.fillStyle = "#704729"; ctx.textAlign = "center"; ctx.font = '14px "Yu Gothic", sans-serif';
      ctx.fillText(notes[i].displayName, x, keyY + keyH - 13, keyW - 5);
    }
    ctx.save(); ctx.beginPath(); ctx.rect(20, 137, w - 40, 545); ctx.clip();
    for (const event of events) {
      const age = elapsed - event.time;
      if (age < 0 || age > 3) continue;
      const x = left + keyW * (event.lane + .5), y = keyY - age * 185;
      ctx.fillStyle = "#ecc484"; ctx.beginPath(); ctx.ellipse(x, y, Math.max(9, keyW * .34), 10, -.25, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#ecc484"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 10, y); ctx.lineTo(x + 10, y - 25); ctx.stroke();
    }
    ctx.restore(); ctx.textAlign = "left";
    ctx.fillStyle = "#704729"; ctx.font = '20px "Yu Gothic", sans-serif'; ctx.fillText("otoiro.pages.dev", 36, 862);
    ctx.fillStyle = "#d9bd99"; ctx.fillRect(36, 880, w - 72, 4);
    ctx.fillStyle = "#95673d"; ctx.fillRect(36, 880, (w - 72) * Math.max(0, Math.min(1, elapsed / duration)), 4);
  }
  async function renderAudio(events, duration, volume) {
    const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const audio = new Offline(2, Math.ceil(duration * 44100), 44100);
    const input = audio.createGain(), limiter = audio.createDynamicsCompressor();
    limiter.threshold.value = -14; limiter.knee.value = 18; limiter.ratio.value = 4;
    const reverb = audio.createConvolver(), wet = audio.createGain(); wet.gain.value = .18;
    const impulse = audio.createBuffer(2, 44100 * 1.6, 44100);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch); let smooth = 0;
      for (let i = 0; i < data.length; i++) { smooth = smooth * .6 + (Math.random() * 2 - 1) * .4; data[i] = smooth * Math.exp(-i / 44100 * 4.5) * Math.min(1, i / 44100 / .012); }
    }
    reverb.buffer = impulse; input.connect(limiter); input.connect(reverb).connect(wet).connect(limiter); limiter.connect(audio.destination);
    for (const event of events) {
      const decay = Math.max(1.4, Math.min(4, 3.1 - event.note.semitones / 28 * .9));
      for (const [ratio, peak, length] of [[1,.22,decay],[2.76,.055,.65],[5.4,.022,.24],[8.93,.009,.10]]) {
        if (event.note.frequency * ratio >= 44100 * .45) continue;
        const oscillator = audio.createOscillator(), gain = audio.createGain();
        oscillator.frequency.value = event.note.frequency * ratio;
        gain.gain.setValueAtTime(.0001, event.time);
        gain.gain.exponentialRampToValueAtTime(peak * .32 * volume / 100 + .0001, event.time + .003);
        gain.gain.exponentialRampToValueAtTime(peak * .16 * volume / 100 + .0001, event.time + length * .12);
        gain.gain.exponentialRampToValueAtTime(.0001, event.time + length);
        oscillator.connect(gain).connect(input); oscillator.start(event.time); oscillator.stop(event.time + length + .02);
      }
    }
    return audio.startRendering();
  }
  async function generate() {
    if (job || !recording || !supported()) return;
    const start = Number(startInput.value), end = Number(endInput.value);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || end - start > 60 || end > Number(endInput.max) + .001) {
      status.textContent = "録音の範囲内で、開始・終了を指定してください（最長60秒）。"; return;
    }
    const events = recording.events.filter(e => e.time / 1000 >= start && e.time / 1000 <= end).map(e => ({ ...e, time: e.time / 1000 - start + .25 }));
    if (!events.length) { status.textContent = "選んだ範囲に音がありません。範囲を変更してください。"; return; }
    clearFile(); setBusy(true); canvas.hidden = false;
    const task = { cancelled: false }; job = task;
    const duration = events[events.length - 1].time + 2.8;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      task.audio = new Audio(); await task.audio.resume();
      status.textContent = "音声を準備しています…";
      const buffer = await renderAudio(events, duration, recording.volume);
      if (task.cancelled) return;
      draw(events, recording.notes, 0, duration);
      task.stream = canvas.captureStream(30);
      const destination = task.audio.createMediaStreamDestination();
      destination.stream.getAudioTracks().forEach(track => task.stream.addTrack(track));
      const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
      task.recorder = new MediaRecorder(task.stream, { ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: 2200000, audioBitsPerSecond: 128000 });
      const chunks = []; let bytes = 0;
      const finished = new Promise((resolve, reject) => {
        task.recorder.ondataavailable = event => {
          if (event.data.size) { chunks.push(event.data); bytes += event.data.size; }
          if (bytes > 64 * 1024 * 1024) { abort("動画が大きすぎます。範囲を短くして再作成してください。"); reject(new Error("size")); }
        };
        task.recorder.onerror = () => reject(new Error("recording"));
        task.recorder.onstop = resolve;
      });
      task.source = task.audio.createBufferSource(); task.source.buffer = buffer;
      task.source.connect(destination); task.source.connect(task.audio.destination);
      task.recorder.start(500);
      const startedAt = task.audio.currentTime + .08;
      task.source.start(startedAt);
      task.source.onended = () => { if (!task.cancelled && task.recorder.state === "recording") task.recorder.stop(); };
      const animate = () => {
        if (task.cancelled) return;
        const elapsed = Math.max(0, task.audio.currentTime - startedAt);
        draw(events, recording.notes, elapsed, duration);
        status.textContent = `動画を作成中… ${Math.min(99, Math.floor(elapsed / duration * 100))}%（画面を開いたままお待ちください）`;
        task.frame = requestAnimationFrame(animate);
      };
      animate(); await finished;
      if (task.cancelled) return;
      if (!bytes) throw new Error("empty");
      const type = task.recorder.mimeType || chunks[0].type || "video/webm";
      const extension = type.includes("mp4") ? "mp4" : "webm";
      file = new File(chunks, `otoiro-free-play.${extension}`, { type: type.split(";")[0] });
      objectURL = URL.createObjectURL(file); preview.src = objectURL; preview.hidden = false; canvas.hidden = true;
      save.hidden = false;
      try { share.hidden = !(navigator.share && navigator.canShare?.({ files: [file], text: comment.value, title: "おといろのフリー演奏" })); } catch { share.hidden = true; }
      status.textContent = `動画ができました（${extension.toUpperCase()}）。プレビューで音と動きを確認して、共有または保存できます。`;
    } catch (error) {
      if (!task.cancelled) status.textContent = "動画を作成できませんでした。範囲を短くして再度お試しください。";
    } finally {
      cleanup(task);
      if (job === task) { job = null; setBusy(false); }
    }
  }
  function validComment() {
    comment.setCustomValidity(comment.value.trim() ? "" : "共有コメントを入力してください。");
    return comment.reportValidity();
  }
  make.addEventListener("click", generate);
  cancel.addEventListener("click", () => abort("動画の作成を中止しました。録音は残っています。"));
  document.getElementById("closeFreeVideoButton").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { abort("動画の作成を中止しました。録音は残っています。"); preview.pause(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) abort("画面を離れたため作成を中止しました。もう一度「動画を作成」を押してください。"); });
  comment.addEventListener("input", () => comment.setCustomValidity(""));
  share.addEventListener("click", async () => {
    if (!file || !validComment()) return;
    try { await navigator.share({ files: [file], text: comment.value.trim(), title: "おといろのフリー演奏" }); }
    catch (error) { if (error.name !== "AbortError") status.textContent = "共有できませんでした。動画を保存してSNSに添付してください。"; }
  });
  save.addEventListener("click", () => { if (file) window.OtoiroSharing.download(file); });
  document.getElementById("copyFreeVideoComment").addEventListener("click", async () => {
    if (!validComment()) return;
    try { await navigator.clipboard.writeText(comment.value.trim()); status.textContent = "コメントをコピーしました。"; }
    catch { comment.focus(); comment.select(); status.textContent = "文章を選択しました。長押しなどでコピーしてください。"; }
  });
  window.OtoiroFreeVideo = Object.freeze({ open(snapshot) {
    if (!snapshot.events.length || job) return;
    recording = { ...snapshot, events: snapshot.events.map(e => ({ ...e, note: { ...e.note } })), notes: snapshot.notes.map(n => ({ ...n })) };
    for (const event of recording.events) recording.notes[event.lane] = { ...event.note };
    const last = Math.ceil(recording.events[recording.events.length - 1].time / 1000 * 10) / 10;
    const first = Math.floor(recording.events[0].time / 1000 * 10) / 10;
    startInput.max = endInput.max = String(Math.max(first + .1, last)); startInput.value = String(first); endInput.value = String(Math.min(first + 60, Math.max(first + .1, last)));
    comment.value = "カリンバで演奏してみました！ あなたも弾いてみませんか？\nhttps://otoiro.pages.dev/\n#おといろ #カリンバ";
    comment.setCustomValidity(""); clearFile(); setBusy(false); make.disabled = !supported(); canvas.hidden = true;
    status.textContent = supported() ? "動画にする範囲を選んでください。作成中は演奏が流れ、動画と同じ長さの時間がかかります。" : "このブラウザーでは動画を作成できません。別のブラウザーでお試しください。";
    dialog.showModal();
  } });
})();

