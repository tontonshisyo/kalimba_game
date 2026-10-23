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
  window.OtoiroSharing = Object.freeze({ encode, decode, download });
})();

