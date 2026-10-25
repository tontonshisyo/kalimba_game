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
  function withHashtags(text) {
    const hashtags = ["#おといろ", "#カリンバ", "#音ゲー"];
    const missing = hashtags.filter(tag => !text.includes(tag));
    return missing.length ? `${text.trim()}\n${missing.join(" ")}` : text.trim();
  }
  async function createLink(song) {
    if (!song.steps.length || song.steps.length > 2000) throw new Error("共有できる音符は1〜2000個です。");
    const hasExtensions = song.meter !== undefined;
    let raw = hasExtensions ? encoder.encode(JSON.stringify([song.name, song.bpm, song.keySignature, song.steps, song.meter ?? null])) : packSong(song);
    let type = hasExtensions ? "j" : "b";
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
    if (/^#s=[a-f0-9]{24}$/.test(hash)) {
      const result = await shortRequest('?id=' + hash.slice(3));
      toCatalogSong(result.song);
      return result.song;
    }
    const match = /^#song=1([bgjz])\.([A-Za-z0-9_-]+)$/.exec(hash);
    if (!match || hash.length > 8000) throw new Error("共有リンクが正しくありません。末尾までコピーされているか確認してください。");
    let bytes = Uint8Array.from(atob(match[2].replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    if (match[1] === "g" || match[1] === "z") {
      if (typeof DecompressionStream !== "function") throw new Error("この共有リンクには最新版のブラウザーが必要です。");
      bytes = new Uint8Array(await boundedBytes(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))));
    }
    if (match[1] === "b" || match[1] === "g") return unpackSong(bytes);
    const [name, bpm, keySignature, steps, meter = 4] = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    return { name, bpm, keySignature, steps, meter };
  }
  function toCatalogSong(song) {
    const lanes = ['D6','B5','G5','E5','C5','A4','F4','D4','C4','E4','G4','B4','D5','F5','A5','C6','E6'];
    const pitches = [26,23,19,16,12,9,5,2,0,4,7,11,14,17,21,24,28];
    const title = typeof song?.name === 'string' ? song.name.trim() : '';
    if (!title || title.length > 40) throw new Error('曲名は1〜40文字にしてください。');
    if (!Number.isInteger(song.bpm) || song.bpm < 30 || song.bpm > 240) throw new Error('BPMは30〜240の整数にしてください。');
    const key = song.keySignature ?? 'C';
    if (!['C','G','D','A','E','B','Fs','Cs','F','Bb','Eb','Ab','Db','Gb','Cb'].includes(key)) throw new Error('対応していない調号です。');
    const meter = song.meter === undefined ? 4 : song.meter;
    if (meter !== null && ![2,3,4,5,6].includes(meter)) throw new Error('拍子が正しくありません。');
    if (!Array.isArray(song.steps) || song.steps.length < 1 || song.steps.length > 2000) throw new Error('音符は1〜2000個にしてください。');
    const seen = new Set();
    for (const note of song.steps) {
      if (!Array.isArray(note) || note.length !== 2 || !Number.isFinite(note[0]) || note[0] < 0 || note[0] > 20000 || !Number.isInteger(note[1]) || note[1] < 0 || note[1] >= lanes.length) throw new Error('音符の位置または音高が正しくありません。');
      const identity = `${note[0]}:${note[1]}`;
      if (seen.has(identity)) throw new Error('同じ拍に同じ音が重複しています。');
      seen.add(identity);
    }
    const steps = song.steps.map(note=>[...note]).sort((a,b)=>a[0]-b[0] || pitches[a[1]]-pitches[b[1]]);
    const source = steps.map(([step,lane])=>`${step / 2},${lanes[lane]}`).join('\n');
    return {title,bpm:song.bpm,key_signature:key,meter,source};
  }
  async function shortRequest(query = '', song) {
    const base = publicBaseURL();
    const configResponse = await fetch(new URL('assets/data/community-config.json', base), {cache:'no-store'});
    if (!configResponse.ok) throw Error('接続設定を読み込めません。長いURLをご利用ください。');
    const config = await configResponse.json();
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(config.url)) throw Error('接続設定が正しくありません。');
    const response = await fetch(config.url + '/functions/v1/short-links' + query, {
      method: song ? 'POST' : 'GET', headers:{apikey:config.publishableKey,'Content-Type':'application/json'},
      ...(song ? {body:JSON.stringify(song)} : {}), signal:AbortSignal.timeout(20000), cache:'no-store'
    });
    if (!response.ok) throw Error(response.status===429 ? '短縮は3分に1回です。少し待つか長いURLをご利用ください。' : response.status===404 ? 'この短縮リンクは整理・削除されたか、存在しません。共有した方に長いURLを確認してください。' : '短縮リンクを処理できません。曲の容量・密度や接続をご確認ください。長いURLは引き続き使えます。');
    return response.json();
  }
  async function shorten(song) {
    toCatalogSong(song);
    const {id} = await shortRequest('', song);
    if (!/^[a-f0-9]{24}$/.test(id)) throw Error('短縮結果を確認できません。');
    return publicBaseURL() + '#s=' + id;
  }
  window.OtoiroSharing = Object.freeze({ encode, decode, download, createLink, readLink, shorten, toCatalogSong, publicBaseURL, withHashtags });
})();
