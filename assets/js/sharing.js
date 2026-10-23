(() => {
  "use strict";
  const limit = 2 * 1024 * 1024;
  const encoder = new TextEncoder();
  async function boundedBytes(stream) {
    const reader = stream.getReader();
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > limit) throw new Error("展開後の譜面が大きすぎます（上限2MB）。");
        chunks.push(value);
      }
    } catch (error) {
      await reader.cancel().catch(() => {});
      throw error;
    } finally { reader.releaseLock(); }
    return new Blob(chunks).arrayBuffer();
  }
  async function encode(pack, title) {
    const raw = encoder.encode(JSON.stringify(pack));
    if (raw.byteLength > limit) throw new Error("譜面が大きすぎます（上限2MB）。");
    let data = raw;
    let header = "OTOIRO1J\n";
    if (typeof CompressionStream === "function" && typeof DecompressionStream === "function") {
      data = await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
      header = "OTOIRO1G\n";
    }
    const filename = (title || "otoiro-song").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").slice(0, 60);
    return new File([header, data], filename + ".otoiro", { type: "application/octet-stream" });
  }
  async function decode(file) {
    if (!file.size || file.size > limit) throw new Error("ファイルは2MB以下の譜面を選んでください。");
    const header = await file.slice(0, 9).text();
    let bytes;
    if (header === "OTOIRO1G\n") {
      if (typeof DecompressionStream !== "function") throw new Error("このブラウザーでは圧縮譜面を開けません。最新版のブラウザーをお使いください。");
      try { bytes = await boundedBytes(file.slice(9).stream().pipeThrough(new DecompressionStream("gzip"))); }
      catch (error) {
        if (error.message.includes("上限2MB")) throw error;
        throw new Error("圧縮譜面を展開できません。ファイルを確認してください。");
      }
    } else {
      bytes = await (header === "OTOIRO1J\n" ? file.slice(9) : file).arrayBuffer();
    }
    try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
    catch { throw new Error("譜面ファイルを読み取れません。対応する共有ファイルまたはJSONファイルを選んでください。"); }
  }
  function download(file) {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  // Pack beat differences and lane numbers instead of sharing the editor text.
  function putNumber(bytes, value) {
    do {
      const digit = value % 128;
      value = Math.floor(value / 128);
      bytes.push(digit + (value ? 128 : 0));
    } while (value);
  }
  function packSong(song) {
    const meta = encoder.encode(JSON.stringify([song.name, song.bpm, song.keySignature]));
    const bytes = [];
    putNumber(bytes, meta.length);
    bytes.push(...meta);
    putNumber(bytes, song.steps.length);
    let previous = 0;
    for (const [step, lane] of song.steps) {
      const tick = Math.round(step * 1000000);
      if (tick / 1000000 !== step || tick < previous) return null;
      putNumber(bytes, (tick - previous) * 17 + lane);
      previous = tick;
    }
    return new Uint8Array(bytes);
  }
  function unpackSong(bytes) {
    let cursor = 0;
    function number() {
      let value = 0, factor = 1;
      for (let i = 0; i < 8; i++) {
        if (cursor >= bytes.length) throw new Error("共有リンクが途中で切れています。");
        const digit = bytes[cursor++];
        value += (digit % 128) * factor;
        if (!Number.isSafeInteger(value)) throw new Error("共有データが正しくありません。");
        if (digit < 128) return value;
        factor *= 128;
      }
      throw new Error("共有データが正しくありません。");
    }
    const length = number();
    if (length > 1024 || cursor + length > bytes.length) throw new Error("曲情報が正しくありません。");
    const [name, bpm, keySignature] = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.slice(cursor, cursor + length)));
    cursor += length;
    const count = number();
    if (count < 1 || count > 2000) throw new Error("共有できる音符は1〜2000個です。");
    const steps = [];
    let tick = 0;
    for (let i = 0; i < count; i++) {
      const value = number();
      tick += Math.floor(value / 17);
      if (tick > 20000000000) throw new Error("音符の位置が範囲外です。");
      steps.push([tick / 1000000, value % 17]);
    }
    if (cursor !== bytes.length) throw new Error("共有データが正しくありません。");
    return { name, bpm, keySignature, steps };
  }
  function base64(bytes) {
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function publicBaseURL(pageURL = location.href) {
    const configured = window.OTOIRO_PUBLIC_URL || document.querySelector('meta[name="otoiro-public-url"]')?.content;
    const url = configured ? new URL(configured) : new URL("./", pageURL);
    if (!/^https?:$/.test(url.protocol) || (!configured && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname))) {
      throw new Error("共有リンクは公開サイトから作成してください。");
    }
    if (url.username || url.password) throw new Error("公開URLの設定が正しくありません。");
    url.search = "";
    url.hash = "";
    return url.href;
  }
  async function createLink(song) {
    if (!song.steps.length || song.steps.length > 2000) throw new Error("共有できる音符は1〜2000個です。");
    let raw = packSong(song);
    let type = "b";
    if (!raw) { raw = encoder.encode(JSON.stringify([song.name, song.bpm, song.keySignature, song.steps])); type = "j"; }
    if (typeof CompressionStream === "function" && typeof DecompressionStream === "function") {
      const compressed = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());
      if (compressed.length < raw.length) { raw = compressed; type = type === "b" ? "g" : "z"; }
    }
    const link = publicBaseURL() + "#song=1" + type + "." + base64(raw);
    if (link.length > 8000) throw new Error("この曲は共有リンクが長すぎます。音符を減らすか、曲を分けてください。");
    return link;
  }
  async function readLink(hash) {
    const match = /^#song=1([bgjz])\.([A-Za-z0-9_-]+)$/.exec(hash);
    if (!match || hash.length > 8000) throw new Error("共有リンクが正しくありません。末尾までコピーされているか確認してください。");
    let bytes = Uint8Array.from(atob(match[2].replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    if (match[1] === "g" || match[1] === "z") {
      if (typeof DecompressionStream !== "function") throw new Error("この共有リンクには最新版のブラウザーが必要です。");
      bytes = new Uint8Array(await boundedBytes(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))));
    }
    if (match[1] === "b" || match[1] === "g") return unpackSong(bytes);
    const [name, bpm, keySignature, steps] = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    return { name, bpm, keySignature, steps };
  }
  function withHashtags(text) {
    const hashtags = ["#おといろ", "#カリンバ", "#音ゲー"];
    const message = text.trim();
    if (!message) return "";
    const missing = hashtags.filter(tag => !message.includes(tag));
    return missing.length ? `${text.trim()}\n${missing.join(" ")}` : text.trim();
  }
  window.OtoiroSharing = Object.freeze({ encode, decode, download, createLink, readLink, publicBaseURL, withHashtags });
})();

