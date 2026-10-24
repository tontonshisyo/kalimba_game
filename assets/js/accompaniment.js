(() => {
  "use strict";

  const PARTS = [
    { id: "cello", name: "チェロ", low: 36, high: 60, color: "#a66b42" },
    { id: "viola", name: "ヴィオラ", low: 48, high: 76, color: "#73844e" },
    { id: "violin", name: "ヴァイオリン", low: 60, high: 88, color: "#a45c52" }
  ];
  const STYLES = { chamber: "室内楽", pizzicato: "ピチカート", dreamy: "幻想的", simple: "シンプル" };
  const ROOTS = { major: [0,2,4,5,7,9,11], minor: [0,2,3,5,7,8,10] };
  const QUALITY = { major: [[0,4,7],[0,3,7],[0,3,7],[0,4,7],[0,4,7],[0,3,7],[0,3,6]], minor: [[0,3,7],[0,3,6],[0,4,7],[0,3,7],[0,3,7],[0,4,7],[0,4,7]] };
  const PITCH_NAMES = ["C","C♯","D","D♯","E","F","F♯","G","G♯","A","A♯","B"];
  const CHORD_SUFFIX = { major: ["","m","m","","","m","dim"], minor: ["m","dim","","m","m","",""] };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const copy = (value) => JSON.parse(JSON.stringify(value));

  function sanitize(source) {
    if (!source || typeof source !== "object" || !source.parts || typeof source.parts !== "object") return null;
    const model = {
      version: 1,
      meter: [2,3,4,5,6].includes(source.meter) ? source.meter : null,
      style: Object.hasOwn(STYLES, source.style) ? source.style : "chamber",
      key: Number.isInteger(source.key) ? ((source.key % 12) + 12) % 12 : 0,
      mode: source.mode === "minor" ? "minor" : "major",
      progression: Array.isArray(source.progression) ? source.progression.slice(0, 256).map((item) => ({ beat: clamp(Number(item.beat) || 0, 0, 10000), degree: clamp(Math.round(Number(item.degree) || 0), 0, 6) })) : [],
      parts: {}
    };
    for (const part of PARTS) {
      const candidate = source.parts[part.id] || {};
      model.parts[part.id] = {
        instrument: ["strings", "pizzicato", "pad"].includes(candidate.instrument) ? candidate.instrument : "strings",
        volume: clamp(Number(candidate.volume ?? (part.id === "cello" ? 52 : 42)), 0, 100),
        muted: Boolean(candidate.muted),
        events: Array.isArray(candidate.events) ? candidate.events.slice(0, 2400).map((event) => ({
          beat: clamp(Number(event.beat) || 0, 0, 10000),
          midi: clamp(Math.round(Number(event.midi) || 60), 24, 96),
          duration: clamp(Number(event.duration) || 1, .125, 16),
          velocity: clamp(Number(event.velocity) || .5, .08, .9)
        })).sort((a,b) => a.beat - b.beat || a.midi - b.midi) : []
      };
    }
    return model;
  }

  const signatureFifths = { C:0,G:1,D:2,A:3,E:4,B:5,Fs:6,Cs:7,F:-1,Bb:-2,Eb:-3,Ab:-4,Db:-5,Gb:-6,Cb:-7 };
  function parseMelody(source, signature = "C") {
    const pitches = { C4:60,D4:62,E4:64,F4:65,G4:67,A4:69,B4:71,C5:72,D5:74,E5:76,F5:77,G5:79,A5:81,B5:83,C6:84,D6:86,E6:88 };
    const fifths = signatureFifths[signature] || 0;
    const altered = new Set((fifths > 0 ? ["F","C","G","D","A","E","B"] : ["B","E","A","D","G","C","F"]).slice(0,Math.abs(fifths)));
    const accidental = fifths > 0 ? 1 : fifths < 0 ? -1 : 0;
    return String(source || "").split(/\r?\n/).flatMap((line) => {
      const fields = line.split("#", 1)[0].trim().split(",").map((item) => item.trim().toUpperCase());
      if (fields.length !== 2 || !Number.isFinite(Number(fields[0])) || !(fields[1] in pitches)) return [];
      return [{ beat: Number(fields[0]), midi: pitches[fields[1]] + (altered.has(fields[1][0]) ? accidental : 0) }];
    }).sort((a,b) => a.beat-b.beat || a.midi-b.midi);
  }

  function estimateKey(melody, preferredKey = 0) {
    const weights = Array(12).fill(0);
    for (const note of melody) weights[note.midi % 12] += 1 + ((note.beat % 4) < .001 ? .8 : 0) + ((note.beat % 2) < .001 ? .25 : 0);
    let best = { key: 0, mode: "major" }, bestScore = -Infinity;
    const major = [0,2,4,5,7,9,11], minor = [0,2,3,5,7,8,10];
    const finalPitch = melody.at(-1)?.midi % 12;
    for (let tonic = 0; tonic < 12; tonic++) {
      for (const [mode, scale] of [["major",major], ["minor",minor]]) {
        const inScale = new Set(scale.map((x) => (x + tonic) % 12));
        const third = (tonic + (mode === "minor" ? 3 : 4)) % 12;
        const keySignatureHint = mode === "major" && tonic === preferredKey ? .9 : mode === "minor" && tonic === (preferredKey + 9) % 12 ? .35 : 0;
        const score = weights.reduce((sum, value, pitch) => sum + value * (inScale.has(pitch) ? 1 : -.65), 0) + weights[tonic] * .55 + weights[third] * .2 + (finalPitch === tonic ? 1.2 : 0) + keySignatureHint;
        if (score > bestScore) { best = { key: tonic, mode }; bestScore = score; }
      }
    }
    return best;
  }

  function chordAt(degree, key, mode) {
    return ROOTS[mode][degree] + key;
  }
  function estimateProgression(melody, barBeats, key, mode, candidate = 0) {
    const lastBeat = melody.at(-1)?.beat || 0;
    const barCount = Math.max(1, Math.ceil((lastBeat + .01) / barBeats));
    const patterns = [[0,4,5,3],[0,5,3,4],[0,3,4,0],[5,3,0,4],[0,4,0,4]];
    const preferred = patterns[candidate % patterns.length];
    const progression = [];
    let previous = 0;
    for (let bar = 0; bar < barCount; bar++) {
      const segment = melody.filter((note) => note.beat >= bar * barBeats && note.beat < (bar + 1) * barBeats);
      let winner = preferred[bar % preferred.length], best = -Infinity;
      for (let degree = 0; degree < 7; degree++) {
        const root = chordAt(degree, key, mode) % 12;
        const tones = QUALITY[mode][degree].map((x) => (root + x) % 12);
        let score = 0;
        for (const note of segment) {
          const strong = (note.beat - bar * barBeats) % 2 < .001 ? 1.45 : 1;
          score += strong * (tones.includes(note.midi % 12) ? 1.5 : -.9);
        }
        score += degree === preferred[bar % preferred.length] ? 1.4 : 0;
        if (degree === previous) score += .45;
        if (bar === barCount - 1 && degree === 0) score += 1.4;
        if (score > best) { best = score; winner = degree; }
      }
      progression.push({ beat: bar * barBeats, degree: winner });
      previous = winner;
    }
    return progression;
  }

  function buildModel(melody, meter, style, candidate = 0, fixedHarmony = null, signature = "C") {
    const preferredKey = { C:0,G:7,D:2,A:9,E:4,B:11,Fs:6,Cs:1,F:5,Bb:10,Eb:3,Ab:8,Db:1,Gb:6,Cb:11 }[signature] ?? 0;
    const estimated = estimateKey(melody, preferredKey);
    const key = fixedHarmony?.key ?? estimated.key;
    const mode = fixedHarmony?.mode ?? estimated.mode;
    const barBeats = meter === 6 ? 3 : meter || 4;
    const progression = fixedHarmony?.progression ? copy(fixedHarmony.progression) : estimateProgression(melody, barBeats, key, mode, candidate);
    const model = { version: 1, meter: meter || null, style, key, mode, progression, parts: {} };
    const lastBeat = melody.at(-1)?.beat || barBeats;
    for (const part of PARTS) model.parts[part.id] = { instrument: style === "pizzicato" ? "pizzicato" : style === "dreamy" && part.id === "violin" ? "pad" : "strings", volume: part.id === "cello" ? 46 : part.id === "viola" ? 37 : 29, muted: false, events: [] };
    const chordForBeat = (beat) => {
      let current = progression[0] || { beat: 0, degree: 0 };
      for (const item of progression) { if (item.beat <= beat) current = item; else break; }
      const root = (chordAt(current.degree, key, mode) % 12) + 48;
      return { degree: current.degree, root, tones: QUALITY[mode][current.degree].map((x) => (root + x) % 12) };
    };
    for (const bar of progression) {
      const end = Math.min(lastBeat + .5, bar.beat + barBeats);
      const chord = chordForBeat(bar.beat);
      const root = chord.root;
      const push = (part, beat, midi, duration, velocity) => {
        const range = PARTS.find((item) => item.id === part);
        while (midi < range.low) midi += 12;
        while (midi > range.high) midi -= 12;
        model.parts[part].events.push({ beat, midi, duration, velocity });
      };
      if (style === "pizzicato") {
        for (let beat = bar.beat; beat < end; beat += 1) {
          const melodyAt = melody.find((note) => Math.abs(note.beat - beat) < .18);
          const tone = melodyAt && chord.tones.includes(melodyAt.midi % 12) ? melodyAt.midi % 12 : chord.tones[(beat - bar.beat) % chord.tones.length];
          push("cello", beat, 36 + ((chord.root - 48) % 12), .72, .38);
          if ((beat - bar.beat) % 2 === 0) push("viola", beat, tone + 48, .55, .25);
        }
      } else if (style === "dreamy") {
        push("cello", bar.beat, 36 + ((chord.root - 48) % 12), Math.min(4, end - bar.beat), .27);
        chord.tones.forEach((tone, index) => { const offset = index * .25; if (bar.beat + offset < end) push("viola", bar.beat + offset, tone + 48, Math.max(.125, Math.min(3.5, end - bar.beat - offset)), .2); });
        push("violin", bar.beat, 72 + chord.tones[1], Math.min(4, end - bar.beat), .16);
      } else if (style === "simple") {
        push("cello", bar.beat, 36 + ((chord.root - 48) % 12), Math.min(2.2, end - bar.beat), .34);
        if (bar.beat + 2 < end) push("cello", bar.beat + 2, 36 + ((chord.root - 48) % 12), Math.min(1.8, end - bar.beat - 2), .27);
        chord.tones.slice(0,2).forEach((tone) => push("viola", bar.beat, tone + 48, Math.min(3.5, end - bar.beat), .22));
      } else {
        push("cello", bar.beat, 36 + ((chord.root - 48) % 12), Math.min(1.7, end - bar.beat), .32);
        if (bar.beat + barBeats / 2 < end) push("cello", bar.beat + barBeats / 2, 36 + ((chord.root - 48) % 12), Math.min(1.2, end - bar.beat - barBeats / 2), .23);
        chord.tones.forEach((tone) => push("viola", bar.beat, tone + 48, Math.min(barBeats * .78, end - bar.beat), .2));
        const passing = melody.filter((note) => note.beat >= bar.beat && note.beat < end && (note.midi % 12 === chord.tones[0] || note.midi % 12 === chord.tones[2])).slice(0, 2);
        if (passing.length) passing.forEach((note) => push("violin", note.beat, clamp(note.midi + 12, 60, 88), Math.min(.9, Math.max(.35, (end - note.beat) * .42)), .13));
        else push("violin", bar.beat, clamp(72 + chord.tones[1], 60, 88), Math.min(barBeats * .55, end - bar.beat), .12);
      }
    }
    for (const part of PARTS) model.parts[part.id].events.sort((a,b) => a.beat-b.beat || a.midi-b.midi);
    return sanitize(model);
  }

  function makeInstrument(context, master, midi, duration, velocity, instrument, style, bpm) {
    const now = context.currentTime;
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = instrument === "pizzicato" || style === "pizzicato" ? 2800 : instrument === "pad" ? 1250 : 1900;
    filter.Q.value = .55;
    gain.gain.setValueAtTime(.0001, now);
    const peak = velocity * (instrument === "pizzicato" || style === "pizzicato" ? .09 : instrument === "pad" ? .052 : .07);
    const attack = instrument === "pad" ? .3 : instrument === "pizzicato" || style === "pizzicato" ? .006 : .045;
    const hold = Math.max(.12, duration * 60 / bpm);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), now + attack);
    if (instrument === "pad") gain.gain.setTargetAtTime(peak * .78, now + attack, .3);
    gain.gain.setTargetAtTime(.0001, now + Math.max(attack + .04, hold * (instrument === "pizzicato" || style === "pizzicato" ? .26 : .84)), instrument === "pad" ? .48 : .18);
    gain.connect(filter).connect(master);
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    const oscillator = context.createOscillator();
    const harmonic = context.createOscillator();
    oscillator.type = "sawtooth";
    harmonic.type = "triangle";
    oscillator.frequency.value = frequency;
    harmonic.frequency.value = frequency * 2.003;
    const secondGain = context.createGain(); secondGain.gain.value = .2;
    oscillator.connect(gain); harmonic.connect(secondGain).connect(gain);
    oscillator.start(now); harmonic.start(now);
    const stop = now + Math.max(.7, hold + (instrument === "pad" ? 1.2 : .5));
    oscillator.stop(stop); harmonic.stop(stop);
    oscillator.onended = () => { oscillator.disconnect(); harmonic.disconnect(); secondGain.disconnect(); gain.disconnect(); filter.disconnect(); };
  }

  function createScheduler() {
    let model = null, bpm = 100, next = { cello: 0, viola: 0, violin: 0 }, lastControl = 0;
    const gains = {};
    let context = null, limiter = null;
    function reset(newModel, tempo, audio) {
      for (const gain of Object.values(gains)) { try { gain.disconnect(); } catch {} }
      try { limiter?.disconnect(); } catch {}
      model = sanitize(newModel); bpm = tempo; context = audio;
      next = { cello: 0, viola: 0, violin: 0 }; lastControl = 0;
      if (!context || !model) return;
      limiter=context.createDynamicsCompressor();limiter.threshold.value=-14;limiter.ratio.value=3;limiter.attack.value=.012;limiter.release.value=.24;limiter.connect(context.destination);
      for (const part of PARTS) { gains[part.id] = context.createGain(); gains[part.id].connect(limiter); }
    }
    function seek(elapsed) { if (!model) return; for (const part of PARTS) { const index = model.parts[part.id].events.findIndex((event) => event.beat * 60 / bpm >= elapsed - .01); next[part.id] = index < 0 ? model.parts[part.id].events.length : index; } }
    function setPart(id, patch) { if (!model || !model.parts[id]) return; Object.assign(model.parts[id], patch); }
    function dispose() { for (const gain of Object.values(gains)) { try { gain.disconnect(); } catch {} } try { limiter?.disconnect(); } catch {} limiter=null; context = null; model = null; }
    function update(elapsed, comboRatio, enabled = true) {
      if (!context || context.state !== "running" || !model) return;
      if (!enabled) { for (const part of PARTS) if (gains[part.id]) { gains[part.id].gain.cancelScheduledValues(context.currentTime); gains[part.id].gain.setTargetAtTime(.0001, context.currentTime, .025); } return; }
      const lookAhead = elapsed + .095;
      const ratio = clamp(comboRatio, 0, 1);
      if (context.currentTime - lastControl > .08) {
        lastControl = context.currentTime;
        const levels = { cello: .22 + .38 * Math.min(1, ratio * 2.2), viola: ratio < .12 ? .015 : .15 + .25 * Math.min(1, (ratio - .12) * 2.5), violin: ratio < .42 ? .008 : .1 + .2 * Math.min(1, (ratio - .42) * 2) };
        for (const part of PARTS) {
          const settings = model.parts[part.id];
          const target = settings.muted ? .0001 : levels[part.id] * settings.volume / 100;
          gains[part.id].gain.cancelScheduledValues(context.currentTime);
          gains[part.id].gain.setTargetAtTime(target, context.currentTime, .12);
        }
      }
      for (const part of PARTS) {
        const settings = model.parts[part.id];
        const events = settings.events;
        while (next[part.id] < events.length && events[next[part.id]].beat * 60 / bpm <= lookAhead) {
          const event = events[next[part.id]++];
          const eventSeconds = event.beat * 60 / bpm;
          if (eventSeconds < elapsed - .09) continue;
          const delay = Math.max(0, eventSeconds - elapsed);
          const wait = context.currentTime + delay;
          const proxy = { currentTime: wait, createGain: () => context.createGain(), createBiquadFilter: () => context.createBiquadFilter(), createOscillator: () => context.createOscillator() };
          makeInstrument(proxy, gains[part.id], event.midi, event.duration, event.velocity, settings.instrument, model.style, bpm);
        }
      }
    }
    return { reset, seek, setPart, update, dispose };
  }

  function mount(options) {
    const dialog = document.getElementById("accompanimentDialog");
    const status = document.getElementById("accompanimentStatus");
    if (!dialog) return { getModel: () => null, setModel: () => {}, scheduler: createScheduler() };
    let model = null, melody = [], bpm = 100, meter = 4, selectedPart = "cello", selectedIndex = -1, clipboard = null;
    let undoStack = [], redoStack = [], audition = null, auditionInterval = 0, auditionStarted = 0, auditionElapsed = 0, stopMelody = null;
    const refs = Object.fromEntries(["style","candidate","part","partVolume","instrument","mute","solo","roll","noteBeat","notePitch","noteDuration","add","delete","copy","paste","undo","redo","preview","pausePreview","stopPreview","seek","seekValue","generate","regenerate","save","chords","barLength","status"].map((id) => [id, document.getElementById(`accomp${id[0].toUpperCase()}${id.slice(1)}`)]));
    refs.meter = document.getElementById("creatorMeter");
    refs.status = document.getElementById("accompanimentStatus");
    const pitchSelect = refs.notePitch;
    if (pitchSelect) for (let midi = 36; midi <= 88; midi++) { const option = document.createElement("option"); option.value = String(midi); option.textContent = `${PITCH_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`; pitchSelect.append(option); }
    const saveHistory = () => { if (model) { undoStack.push(copy(model)); if (undoStack.length > 80) undoStack.shift(); redoStack = []; } };
    const setStatus = (message, error = false) => { status.textContent = message; status.classList.toggle("is-error", error); };
    const partData = () => model?.parts[selectedPart];
    function drawChords() {
      refs.chords.replaceChildren();
      for (let i = 0; i < model.progression.length; i++) {
        const item = model.progression[i];
        const label = document.createElement("label"); label.className = "accomp-chord";
        const barBeats = model.meter === 6 ? 3 : model.meter || 4;
        const barNumber = Math.floor(item.beat / barBeats) + 1;
        const caption = document.createElement("span"); caption.textContent = `小節 ${barNumber}`;
        const select = document.createElement("select"); select.setAttribute("aria-label", `${barNumber}小節目のコード`);
        const roots = ROOTS[model.mode], suffixes = CHORD_SUFFIX[model.mode];
        for (let degree = 0; degree < 7; degree++) { const option = document.createElement("option"); option.value = String(degree); option.textContent = `${PITCH_NAMES[(model.key + roots[degree]) % 12]}${suffixes[degree]}`; option.selected = degree === item.degree; select.append(option); }
        select.addEventListener("change", () => { saveHistory(); item.degree = Number(select.value); drawChords(); setStatus("コードを変更しました。音符への反映は、必要なパートの再生成ボタンを押してください。"); });
        label.append(caption, select); refs.chords.append(label);
      }
    }
    function drawRoll() {
      const svg = refs.roll, ns = "http://www.w3.org/2000/svg";
      svg.replaceChildren();
      if (!model) return;
      const events = partData().events;
      const lastBeat = Math.max(8, Math.ceil((melody.at(-1)?.beat || 0) + 2));
      const width = Math.max(680, 72 + lastBeat * 30), height = 286, top = 20, rowHeight = 4.5;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`); svg.style.width = `${width}px`; svg.style.height = `${height}px`;
      const low = 36, high = 89, px = (beat) => 56 + beat * 30, py = (midi) => top + (high - midi) * rowHeight;
      for (let midi = low; midi <= high; midi++) {
        const line = document.createElementNS(ns, "line"); line.setAttribute("x1", "50"); line.setAttribute("x2", String(width)); line.setAttribute("y1", String(py(midi))); line.setAttribute("y2", String(py(midi))); line.setAttribute("class", midi % 12 === 0 ? "accomp-roll-octave" : midi % 12 === 5 ? "accomp-roll-c" : "accomp-roll-line"); svg.append(line);
      }
      const barBeats = model.meter === 6 ? 3 : model.meter || 4;
      for (let beat = 0; beat <= lastBeat; beat++) { const line = document.createElementNS(ns,"line"); line.setAttribute("x1", String(px(beat))); line.setAttribute("x2", String(px(beat))); line.setAttribute("y1", "18"); line.setAttribute("y2", String(height-18)); line.setAttribute("class", beat % barBeats === 0 ? "accomp-roll-bar" : "accomp-roll-beat"); svg.append(line); }
      for (const note of melody) { const rect = document.createElementNS(ns,"rect"); rect.setAttribute("x", String(px(note.beat)-4)); rect.setAttribute("y", String(py(note.midi)-3)); rect.setAttribute("width", "8"); rect.setAttribute("height", "6"); rect.setAttribute("rx", "3"); rect.setAttribute("class", "accomp-melody-mark"); svg.append(rect); }
      events.forEach((event, index) => { const rect = document.createElementNS(ns,"rect"); rect.setAttribute("x", String(px(event.beat))); rect.setAttribute("y", String(py(event.midi)-5)); rect.setAttribute("width", String(Math.max(12,event.duration*30))); rect.setAttribute("height", "10"); rect.setAttribute("rx", "5"); rect.setAttribute("class", `accomp-note ${index === selectedIndex ? "is-selected" : ""}`); rect.dataset.index = String(index); rect.style.touchAction = "none"; svg.append(rect); });
      svg.onpointerdown = (event) => {
        const bounds = svg.getBoundingClientRect(); const x = (event.clientX-bounds.left) * width / bounds.width, y = (event.clientY-bounds.top) * height / bounds.height;
        const target = event.target.closest(".accomp-note");
        if (target) { selectedIndex = Number(target.dataset.index); const originX=event.clientX,originY=event.clientY,original=copy(events[selectedIndex]); fillNoteFields(); saveHistory(); drawRoll(); svg.setPointerCapture(event.pointerId); svg.onpointermove=(move)=>{ const dx=Math.round((move.clientX-originX)*width/bounds.width/30*4)/4, dy=Math.round((move.clientY-originY)*height/bounds.height/rowHeight); events[selectedIndex].beat=clamp(original.beat+dx,0,lastBeat); events[selectedIndex].midi=clamp(original.midi-dy,low,high); drawRoll(); }; svg.onpointerup=()=>{ svg.onpointermove=null; svg.onpointerup=null; const moved=events[selectedIndex];events.sort((a,b)=>a.beat-b.beat||a.midi-b.midi);selectedIndex=events.indexOf(moved);fillNoteFields();drawRoll(); }; return; }
        const originX=event.clientX,originY=event.clientY,beat=clamp(Math.round((x-56)/30*4)/4,0,lastBeat),midi=clamp(Math.round(high-(y-top)/rowHeight),low,high);
        svg.onpointerup=(up)=>{svg.onpointerup=null;svg.onpointercancel=null;if(Math.hypot(up.clientX-originX,up.clientY-originY)>9)return;saveHistory();events.push({beat,midi,duration:.75,velocity:.3});events.sort((a,b)=>a.beat-b.beat||a.midi-b.midi);selectedIndex=events.findIndex((note)=>note.beat===beat&&note.midi===midi);fillNoteFields();drawRoll();};
        svg.onpointercancel=()=>{svg.onpointerup=null;svg.onpointercancel=null;};
      };
    }
    function fillNoteFields() { const event=partData()?.events[selectedIndex]; refs.noteBeat.value=event?.beat??0; refs.notePitch.value=event?.midi??60; refs.noteDuration.value=event?.duration??1; refs.delete.disabled=!event; }
    function draw() { if (!model) return; refs.style.value=model.style; refs.meter.value=model.meter||"none"; refs.part.value=selectedPart; const part=partData(); refs.partVolume.value=String(part.volume); refs.instrument.value=part.instrument; refs.mute.checked=part.muted; refs.barLength.textContent=`${model.meter===6?"6/8拍子":model.meter?`${model.meter}/4拍子`:`拍子なし（4拍単位で推定）`} · ${PITCH_NAMES[model.key]}${model.mode==="minor"?"短調":"長調"}`; refs.seek.max=String(auditionDuration()); drawChords(); drawRoll(); fillNoteFields(); refs.undo.disabled=!undoStack.length; refs.redo.disabled=!redoStack.length; }
    function install(next) { model=sanitize(next); if (model) { meter=model.meter; draw(); } }
    function regeneratePart() { if (!model) return; saveHistory(); const fresh=buildModel(melody,meter,model.style,Number(refs.candidate.value),model); model.parts[selectedPart]=fresh.parts[selectedPart]; draw(); setStatus(`${PARTS.find(p=>p.id===selectedPart).name}だけ再生成しました。ほかのパートと確定済みコード進行は維持しています。`); }
    function open() { melody=parseMelody(options.getMelody(),options.getKeySignature()); bpm=options.getBpm(); meter=refs.meter.value==="none"?null:Number(refs.meter.value); model=sanitize(options.getModel())||buildModel(melody,meter,refs.style.value||"chamber",0,null,options.getKeySignature()); model.meter=meter; undoStack=[];redoStack=[];selectedPart="cello";dialog.showModal();draw(); }
    document.getElementById("openAccompanimentButton")?.addEventListener("click",open);
    refs.generate.addEventListener("click",()=>{ melody=parseMelody(options.getMelody(),options.getKeySignature());meter=refs.meter.value==="none"?null:Number(refs.meter.value); saveHistory(); model=buildModel(melody,meter,refs.style.value,Number(refs.candidate.value),null,options.getKeySignature()); draw(); setStatus("伴奏を生成しました。小節のコードを選び、音符をタップして編集できます。"); });
    refs.part.addEventListener("change",()=>{selectedPart=refs.part.value;selectedIndex=-1;draw();});
    refs.style.addEventListener("change",()=>{if(model){saveHistory();model.style=refs.style.value;draw();}});
    refs.meter.addEventListener("change",()=>{meter=refs.meter.value==="none"?null:Number(refs.meter.value);});
    refs.partVolume.addEventListener("pointerdown",()=>saveHistory());
    refs.partVolume.addEventListener("input",()=>{if(model){partData().volume=Number(refs.partVolume.value);audition?.setPart(selectedPart,{volume:partData().volume});}});
    refs.instrument.addEventListener("change",()=>{if(model){saveHistory();partData().instrument=refs.instrument.value;audition?.setPart(selectedPart,{instrument:partData().instrument});}});
    refs.mute.addEventListener("change",()=>{if(model){saveHistory();partData().muted=refs.mute.checked;audition?.setPart(selectedPart,{muted:partData().muted});}});
    let soloSnapshot=null;
    refs.solo.addEventListener("click",()=>{if(!model)return;saveHistory();if(soloSnapshot){for(const part of PARTS)model.parts[part.id].muted=soloSnapshot[part.id];soloSnapshot=null;setStatus("各パートのミュート設定を戻しました。");}else{soloSnapshot=Object.fromEntries(PARTS.map((part)=>[part.id,model.parts[part.id].muted]));for(const part of PARTS)model.parts[part.id].muted=part.id!==selectedPart;setStatus("選択中のパートだけを有効にしました。もう一度押すと元に戻ります。");}if(audition)for(const part of PARTS)audition.setPart(part.id,{muted:model.parts[part.id].muted});draw();});
    refs.regenerate.addEventListener("click",regeneratePart);
    refs.noteBeat.addEventListener("change",()=>{const e=partData()?.events[selectedIndex];if(e){saveHistory();e.beat=clamp(Number(refs.noteBeat.value)||0,0,10000);e.beat=Number(e.beat.toFixed(3));partData().events.sort((a,b)=>a.beat-b.beat||a.midi-b.midi);selectedIndex=partData().events.indexOf(e);draw();}});
    refs.notePitch.addEventListener("change",()=>{const e=partData()?.events[selectedIndex];if(e){saveHistory();e.midi=Number(refs.notePitch.value);draw();}});
    refs.noteDuration.addEventListener("change",()=>{const e=partData()?.events[selectedIndex];if(e){saveHistory();e.duration=clamp(Number(refs.noteDuration.value)||1,.125,16);draw();}});
    refs.add.addEventListener("click",()=>{saveHistory();partData().events.push({beat:Number(refs.noteBeat.value)||0,midi:Number(refs.notePitch.value)||60,duration:Number(refs.noteDuration.value)||1,velocity:.3});partData().events.sort((a,b)=>a.beat-b.beat);selectedIndex=partData().events.length-1;draw();});
    refs.delete.addEventListener("click",()=>{if(selectedIndex<0)return;saveHistory();partData().events.splice(selectedIndex,1);selectedIndex=-1;draw();});
    refs.copy.addEventListener("click",()=>{const e=partData()?.events[selectedIndex];if(e){clipboard=copy(e);setStatus("選択した音符をコピーしました。");}});
    refs.paste.addEventListener("click",()=>{if(!clipboard)return;saveHistory();const event=copy(clipboard);event.beat=Number(refs.noteBeat.value)||event.beat;partData().events.push(event);partData().events.sort((a,b)=>a.beat-b.beat);selectedIndex=partData().events.indexOf(event);draw();});
    refs.undo.addEventListener("click",()=>{if(!undoStack.length)return;redoStack.push(copy(model));model=undoStack.pop();draw();});
    refs.redo.addEventListener("click",()=>{if(!redoStack.length)return;undoStack.push(copy(model));model=redoStack.pop();draw();});
    refs.save.addEventListener("click",()=>{if(!model)return;model.meter=meter;options.saveModel(copy(model));setStatus("伴奏と拍子を曲データに保存しました。");});
    function auditionDuration(){return Math.max(1,...Object.values(model?.parts||{}).flatMap((part)=>part.events.map((event)=>event.beat*60/bpm)),(melody.at(-1)?.beat||0)*60/bpm)+2;}
    function formatTime(value){const seconds=Math.max(0,Math.floor(value));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,"0")}`;}
    function scheduleMelody(from){return options.previewMelody?options.previewMelody(from):null;}
    function startAudition(){
      if(!model){setStatus("先に伴奏を生成してください。",true);return;}
      const context=options.getAudioContext();context.resume();
      if(!audition){audition=createScheduler();audition.reset(model,bpm,context);}
      audition.seek(auditionElapsed);
      auditionStarted=performance.now();stopMelody=scheduleMelody(auditionElapsed);
      auditionInterval=window.setInterval(()=>{auditionElapsed+=(performance.now()-auditionStarted)/1000;auditionStarted=performance.now();audition.update(auditionElapsed,1,true);refs.seek.value=String(Math.min(auditionDuration(),auditionElapsed));refs.seekValue.value=formatTime(auditionElapsed);if(auditionElapsed>=auditionDuration())stopAudition();},35);
      refs.pausePreview.disabled=false;setStatus("メロディーと伴奏を試聴中です。");
    }
    function pauseAudition(){if(!auditionInterval)return;clearInterval(auditionInterval);auditionInterval=0;auditionElapsed+=(performance.now()-auditionStarted)/1000;if(stopMelody)stopMelody();stopMelody=null;audition?.update(0,0,false);refs.pausePreview.disabled=true;setStatus("試聴を一時停止しました。");}
    function stopAudition(){if(auditionInterval)clearInterval(auditionInterval);auditionInterval=0;if(stopMelody)stopMelody();stopMelody=null;audition?.update(0,0,false);audition?.dispose();audition=null;auditionElapsed=0;refs.seek.value="0";refs.seekValue.value="0:00";refs.pausePreview.disabled=true;}
    refs.preview.addEventListener("click",startAudition);
    refs.pausePreview.addEventListener("click",pauseAudition);
    refs.seek.max=String(auditionDuration());
    refs.seek.addEventListener("input",()=>{const wasPlaying=Boolean(auditionInterval);if(wasPlaying)pauseAudition();auditionElapsed=Number(refs.seek.value);refs.seekValue.value=formatTime(auditionElapsed);if(audition){audition.seek(auditionElapsed);if(wasPlaying)startAudition();}});
    refs.stopPreview.addEventListener("click",stopAudition);
    dialog.addEventListener("close",stopAudition);
    return { getModel:()=>model?copy(model):null, setModel:install, getPreviewModel:()=>model?copy(model):null, scheduler:createScheduler(), stopAudition };
  }

  window.OtoiroAccompaniment = Object.freeze({ mount, buildModel, sanitize, parseMelody, estimateKey, PARTS, STYLES });
})();

