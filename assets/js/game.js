(() => {
      "use strict";

      const keyboardShortcuts = ["1","2","3","4","5","6","7","8","9","0","q","w","e","r","t","y","u"];
      const removedBundledSongIds = new Set([
        "user-classic-ode-to-joy", "user-classic-london-bridge", "user-classic-jingle-bells",
        "user-classic-silent-night", "user-classic-oh-susanna"
      ]);
      const cMajorKalimba = [
        { name: "D", octave: 6, semitones: 26, side: "left", color: "#9bc8ff" },
        { name: "B", octave: 5, semitones: 23, side: "left", color: "#b3bcfa" },
        { name: "G", octave: 5, semitones: 19, side: "left", color: "#d1b4f2" },
        { name: "E", octave: 5, semitones: 16, side: "left", color: "#f0b2d1" },
        { name: "C", octave: 5, semitones: 12, side: "left", color: "#ffb0ba" },
        { name: "A", octave: 4, semitones: 9, side: "left", color: "#ffc3a1" },
        { name: "F", octave: 4, semitones: 5, side: "left", color: "#f4cf89" },
        { name: "D", octave: 4, semitones: 2, side: "left", color: "#e0e89b" },
        { name: "C", octave: 4, semitones: 0, side: "center", color: "#a5f1d2" },
        { name: "E", octave: 4, semitones: 4, side: "right", color: "#b7e8b3" },
        { name: "G", octave: 4, semitones: 7, side: "right", color: "#9fe6a7" },
        { name: "B", octave: 4, semitones: 11, side: "right", color: "#8ce4c4" },
        { name: "D", octave: 5, semitones: 14, side: "right", color: "#85dedc" },
        { name: "F", octave: 5, semitones: 17, side: "right", color: "#85d4ee" },
        { name: "A", octave: 5, semitones: 21, side: "right", color: "#8cc9f6" },
        { name: "C", octave: 6, semitones: 24, side: "right", color: "#9bc8ff" },
        { name: "E", octave: 6, semitones: 28, side: "right", color: "#b3bcfa" }
      ];
      const notes = [
        ...cMajorKalimba.map((note, index) => ({
          ...note,
          frequency: 261.625565 * 2 ** (note.semitones / 12),
          key: keyboardShortcuts[index]
        }))
      ];
      const scaleToLane = [8, 7, 9, 6, 10, 5, 11, 4];
      const charts = {
        twinkle: {
          bpm: 80,
          meter: 4,
          steps: [
            [0,0],[1,0],[2,4],[3,4],[4,5],[5,5],[6,4],[8,3],[9,3],[10,2],[11,2],[12,1],[13,1],[14,0],
            [16,4],[17,4],[18,3],[19,3],[20,2],[21,2],[22,1],[24,4],[25,4],[26,3],[27,3],[28,2],[29,2],[30,1],
            [32,0],[33,0],[34,4],[35,4],[36,5],[37,5],[38,4],[40,3],[41,3],[42,2],[43,2],[44,1],[45,1],[46,0],
            [48,4],[49,4],[50,3],[51,3],[52,2],[53,2],[54,1],[56,4],[57,4],[58,3],[59,3],[60,2],[61,2],[62,1],[64,0]
          ]
        },
        maryHadALittleLamb: {
          bpm: 76,
          meter: 4,
          steps: [
            [0,8],[0,3],[1,10],[1.5,12],[2,4],[3,12],[4,8],[4,3],
            [5,10],[5,3],[6,3],[7,10],[8,7],[8,12],[9,12],[10,12],
            [11,7],[12,8],[12,3],[13,10],[13,2],[14,2],[15,10],[16,8],
            [16,3],[17,10],[17.5,12],[18,4],[19,12],[20,8],[20,3],[21,10],
            [21,3],[22,3],[23,10],[24,6],[24,12],[25,12],[26,10],[26,3],
            [27.5,12],[28,8],[28,4],[29,10],[30,5],[31,11],[32,8],[32,3],
            [33,10],[33.5,12],[34,4],[35,10],[35,11],[35,12],[36,8],[36,4],
            [36,3],[37,10],[37,3],[38,3],[39,10],[40,7],[40,12],[41,12],
            [42,12],[43,10],[44,8],[44,3],[45,10],[45,2],[46,2],[47,10],
            [48,8],[48,3],[49,10],[49.5,12],[50,4],[51,10],[51,11],[51,12],
            [52,8],[52,4],[52,3],[53,10],[53,3],[54,3],[55,10],[56,6],
            [56,12],[57,6],[57,12],[58,10],[58,3],[59.5,12],[60,8],[60,4],
            [61,10],[62,8],[64,6],[64,14],[65,4],[65.5,2],[66,13],[67,4],
            [67,14],[68,9],[68,2],[69,4],[69,15],[70,2],[71,8],[71,3],
            [72,6],[72,13],[73.5,3],[74,10],[74,11],[74,12],[75,13],[76,8],
            [76,3],[77,8],[77,3],[78,9],[78,3],[79,10],[80,6],[80,14],
            [81,4],[81.5,2],[82,13],[83,4],[83,14],[84,9],[84,2],[85,4],
            [85,15],[86,3],[86,2],[87,3],[88,5],[88,12],[89,12],[90,1],
            [91,14],[92,10],[92,2],[93,6],[94,9],[95,7],[96,8],[96,3],
            [97,10],[97.5,12],[98,4],[99,10],[99,11],[99,12],[100,8],[100,4],
            [100,3],[101,10],[101,3],[102,3],[103,10],[104,7],[104,10],[104,11],
            [104,12],[105,12],[106,12],[107,7],[108,8],[108,4],[108,3],[109,10],
            [109,2],[110,2],[111,10],[112,8],[112,4],[112,3],[113,10],[113.5,12],
            [114,4],[115,10],[115,11],[115,12],[116,8],[116,4],[116,3],[117,10],
            [117,3],[118,3],[119,10],[120,6],[120,5],[120,12],[121,12],[122,10],
            [122,11],[122,3],[123.5,12],[124,8],[124,9],[124,10],[124,4],[126,4],
            [126,3],[126,2],[126,15]
          ]
        }
      };
      const builtInChartDefaults = { ...charts };
      const builtInSongNames = {
        twinkle: "きらきら星",
        maryHadALittleLamb: "メリーさんの羊"
      };
      const makerStorageKey = "otoiro-maker-songs-v1";
      const songSelect = document.getElementById("songSelect");
      let songLibrary = null;
      const practiceStartControl = document.getElementById("practiceStartControl");
      const practiceStartBeatInput = document.getElementById("practiceStartBeat");
      const creatorNameInput = document.getElementById("creatorSongName");
      const creatorBpmInput = document.getElementById("creatorBpm");
      const creatorKeySignatureInput = document.getElementById("creatorKeySignature");
      const creatorMeterInput = document.getElementById("creatorMeter");
      const creatorChartInput = document.getElementById("creatorChart");
      const testStartBeatInput = document.getElementById("testStartBeat");
      const sheetPreview = document.getElementById("sheetPreview");
      const sheetTempo = document.getElementById("sheetTempo");
      const sheetPreviewMessage = document.getElementById("sheetPreviewMessage");
      const creatorStatus = document.getElementById("creatorStatus");
      const creatorDetails = document.querySelector(".creator-mode");
      const deleteChartButton = document.getElementById("deleteChartButton");
      const previewChartButton = document.getElementById("previewChartButton");
      const stopPreviewButton = document.getElementById("stopPreviewButton");
      const testPlayButton = document.getElementById("testPlayButton");
      const exportChartsButton = document.getElementById("exportChartsButton");
      const exportMobileAppButton = document.getElementById("exportMobileAppButton");
      const importChartsButton = document.getElementById("importChartsButton");
      const connectProjectButton = document.getElementById("connectProjectButton");
      const importChartsFile = document.getElementById("importChartsFile");
      const quantizeSetting = document.getElementById("quantizeSetting");
      const startRecordingButton = document.getElementById("startRecordingButton");
      const stopRecordingButton = document.getElementById("stopRecordingButton");
      const recordingIndicator = document.getElementById("recordingIndicator");
      const songNames = { ...builtInSongNames };
      let makerSongs = [];
      let catalogVisibleIds = null;
      let projectDirectoryHandle = null;
      let projectSaveQueue = Promise.resolve();
      const canvas = document.getElementById("gameCanvas");
      const ctx = canvas.getContext("2d");
      const playfield = document.getElementById("playfield");
      const keyRow = document.getElementById("keyRow");
      const overlay = document.getElementById("overlay");
      const toast = document.getElementById("toast");
      const laneCount = notes.length;
      const travelTime = 1.8;
      const goodWindow = .2;
      const arpeggioNoteInterval = .06;
      const maxArpeggioDuration = .3;
      const app = document.querySelector(".app");
      const freeDisplayToggle = document.getElementById('freeDisplayToggle');
      let freeDisplayVisible = true;
      try { freeDisplayVisible = localStorage.getItem('otoiro-free-display') !== 'off'; } catch {}
      function updateFreeDisplay() {
        app.classList.toggle('is-free-display-hidden', !freeDisplayVisible);
        freeDisplayToggle.textContent = `中央の表示：${freeDisplayVisible ? 'ON' : 'OFF'}`;
        freeDisplayToggle.setAttribute('aria-pressed', String(freeDisplayVisible));
        document.getElementById('freePlayDisplay').inert = !freeDisplayVisible;
      }
      freeDisplayToggle.addEventListener('click', () => {
        freeDisplayVisible = !freeDisplayVisible;
        updateFreeDisplay();
        try { localStorage.setItem('otoiro-free-display',freeDisplayVisible ? 'on' : 'off'); } catch {}
      });
      updateFreeDisplay();
      const practiceModeInput = document.getElementById("practiceMode");
      const settingInputs = {
        volume: document.getElementById("volumeSetting"),
        noteSpeed: document.getElementById("noteSpeedSetting"),
        practiceTempo: document.getElementById("practiceTempoSetting")
      };
      const settingOutputs = {
        volume: document.getElementById("volumeValue"),
        noteSpeed: document.getElementById("noteSpeedValue"),
        practiceTempo: document.getElementById("practiceTempoValue")
      };
      const practiceTempoSetting = document.querySelector(".practice-tempo-setting");
      const selectionControls = [...document.querySelectorAll(".selection-controls input, .selection-controls select, .song-library input, .song-library select, #tutorialButton, #practiceStartBeat, .game-settings input, .game-settings select, .creator-mode input, .creator-mode select, .creator-mode textarea, .creator-mode button")];
      const settingsStorageKey = "otoiro-settings-v1";
      const keyColorPresetHints = {
        none: "色マークを付けません。見本は左端D6から右端E6の並びです。",
        alternating: "左端から赤・青を交互に付けます。隣の鍵盤を見分ける目印になります。",
        everyOther: "左端から1本おきに赤い目印を付けます。",
        cOnly: "すべてのド（C4・C5・C6）に赤い目印を付けます。",
        cAndF: "すべてのドに赤、ファに青の目印を付けます。音の位置を覚える基準にできます。",
        hands: "左手側は青、右手側は橙、中央のドは緑にします。",
        noteNames: "ドからシまで音名ごとに7色で分けます。同じ音名はオクターブが違っても同じ色です。"
      };
      const settingsDefaults = { volume: 100, noteSpeed: 100, practiceTempo: 100, practiceMode: false, keyColorPreset: "none" };
      const settings = loadSettings();
      const freeTuningStorageKey = "otoiro-free-tuning-v1";
      const freeSignatures = [
        { id: "C", label: "ハ長調 C（調号なし）", fifths: 0 },
        { id: "G", label: "ト長調 G（♯1個）", fifths: 1 },
        { id: "D", label: "ニ長調 D（♯2個）", fifths: 2 },
        { id: "A", label: "イ長調 A（♯3個）", fifths: 3 },
        { id: "E", label: "ホ長調 E（♯4個）", fifths: 4 },
        { id: "B", label: "ロ長調 B（♯5個）", fifths: 5 },
        { id: "Fs", label: "嬰ヘ長調 F♯（♯6個）", fifths: 6 },
        { id: "Cs", label: "嬰ハ長調 C♯（♯7個）", fifths: 7 },
        { id: "F", label: "ヘ長調 F（♭1個）", fifths: -1 },
        { id: "Bb", label: "変ロ長調 B♭（♭2個）", fifths: -2 },
        { id: "Eb", label: "変ホ長調 E♭（♭3個）", fifths: -3 },
        { id: "Ab", label: "変イ長調 A♭（♭4個）", fifths: -4 },
        { id: "Db", label: "変ニ長調 D♭（♭5個）", fifths: -5 },
        { id: "Gb", label: "変ト長調 G♭（♭6個）", fifths: -6 },
        { id: "Cb", label: "変ハ長調 C♭（♭7個）", fifths: -7 }
      ];
      const freeTuning = loadFreeTuning();
      freeSignatures.forEach((entry) => {
        const option = document.createElement("option");
        option.value = entry.id;
        option.textContent = entry.label;
        creatorKeySignatureInput.append(option);
      });
      let audioContext = null;
      let kalimbaAudio = null;
      let chart = charts.twinkle;
      let practiceMode = false;
      let practiceHoldAt = null;
      let practiceNote = null;
      let runTravelTime = travelTime;
      let runTempoScale = 1;
      let runStartDelay = travelTime;
      let preparationClicks = [];
      let preparationClickIndex = 0;
      function preparePlayCountIn(selectedChart) {
        const meter = Number(selectedChart.meter);
        const quarter = 60 / selectedChart.bpm * runTempoScale;
        const beats = meter === 6 ? 3 : [2,3,4,5].includes(meter) ? meter : 0;
        const positions = meter === 6 ? [0,1.5] : meter === 2 ? [0,1] : Array.from({length:Math.max(0,beats-1)},(_,i)=>i);
        runStartDelay = Math.max(runTravelTime, beats * quarter + .08);
        preparationClicks = positions.map(beat => runStartDelay - beats * quarter + beat * quarter);
        preparationClickIndex = 0;
        if (positions.length) {
          if (!audioContext || audioContext.state === 'closed') audioContext = new (window.AudioContext || window.webkitAudioContext)();
          if (audioContext.state === 'suspended') audioContext.resume().catch(()=>{});
        }
      }
      let activeNotes = [];
      let activeTimingLines = [];
      const trackUsage = (event, props) => window.OtoiroAnalytics?.track(event, props);
      let usageRun = null;
      function beginUsageRun(mode) {
        usageRun = {mode, song: mode === 'test' || mode === 'tutorial' ? 'custom' : songSelect.value, notes: activeNotes.length, bpm: chart?.bpm || 0};
        trackUsage('game_start', usageRun);
      }
      function endUsageRun(event) {
        if (!usageRun) return;
        trackUsage(event, {...usageRun, seconds: Math.max(0, ((practiceHoldAt ?? (state === 'paused' ? pausedAt : performance.now())) - startedAt) / 1000), score: calculateScore(), perfect: perfectCount, good: goodCount, miss: missCount, extra: extraCount, combo: bestCombo, accuracy: judged + extraCount ? Math.round(accuracyPoints / (judged + extraCount)) : 0});
        usageRun = null;
      }
      let freeNotes = [];
      let freeRecording = [];
      let freeRecordStartedAt = null;
      let freeReplayStartedAt = null;
      let freeReplayCursor = 0;
      let freeCountIn = false;
      let freeCountInTimer = 0;
      let freeMetronomeOn = false;
      let freeMetronomeTimer = 0;
      const freeMetronomeBpm = document.getElementById("freeMetronomeBpm");
      const freeMetronomeButton = document.getElementById("freeMetronomeButton");

      function stopFreeMetronome() {
        window.clearTimeout(freeMetronomeTimer);
        freeMetronomeOn = false;
        freeMetronomeButton.textContent = "メトロノーム：OFF";
        freeMetronomeButton.setAttribute("aria-pressed", "false");
      }
      function scheduleFreeMetronome(deadline = performance.now()) {
        window.clearTimeout(freeMetronomeTimer);
        if (!freeMetronomeOn || state !== "free" || freeCountIn) return;
        if (!freeMetronomeBpm.checkValidity()) { stopFreeMetronome(); return; }
        freeMetronomeTimer = window.setTimeout(() => {
          if (!freeMetronomeOn || state !== "free" || freeCountIn) return;
          playMetronome(false);
          const next = deadline + 60000 / Number(freeMetronomeBpm.value);
          scheduleFreeMetronome(Math.max(performance.now() + 20, next));
        }, Math.max(0, deadline - performance.now()));
      }
      function prepareRecordingAudio() {
        try {
          if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
          audioContext.resume().catch(() => {});
        } catch {}
      }

      function refreshFreeRecordingControls(message) {
        document.getElementById("freeRecordButton").textContent = freeCountIn ? "カウントダウンを中止" : freeRecordStartedAt === null ? "録音を開始" : "録音を停止";
        document.getElementById("freeRecordButton").disabled = freeReplayStartedAt !== null;
        document.getElementById("freeReplayButton").disabled = freeCountIn || !freeRecording.length || freeRecordStartedAt !== null || freeReplayStartedAt !== null;
        document.getElementById("freeVideoButton").disabled = freeCountIn || !freeRecording.length || freeRecordStartedAt !== null || freeReplayStartedAt !== null;
        freeMetronomeButton.disabled = freeMetronomeBpm.disabled = freeCountIn || freeReplayStartedAt !== null;
        document.getElementById("freeReplayStopButton").hidden = freeReplayStartedAt === null;
        if (message) document.getElementById("freeRecordStatus").textContent = message;
      }

      function stopFreeTransport() {
        const wasCountIn = freeCountIn;
        freeCountIn = false;
        window.clearTimeout(freeCountInTimer);
        if (wasCountIn) {
          document.getElementById("recordingCountdown").hidden = true;
          app.classList.remove("is-counting");
        }
        const wasRecording = freeRecordStartedAt !== null;
        const wasPlaying = freeReplayStartedAt !== null;
        freeRecordStartedAt = null;
        freeReplayStartedAt = null;
        freeNotes = [];
        clearPointerInteraction();
        refreshFreeRecordingControls(wasCountIn ? "カウントダウンを中止しました" : wasRecording ? `録音しました（${freeRecording.length}音）` : wasPlaying ? "再生を停止しました" : undefined);
        if (wasCountIn && freeMetronomeOn) scheduleFreeMetronome();
      }

      function updateFreeReplay(now) {
        if (freeReplayStartedAt === null) return;
        const elapsed = now - freeReplayStartedAt;
        while (freeReplayCursor < freeRecording.length && elapsed >= freeRecording[freeReplayCursor].time) {
          const event = freeRecording[freeReplayCursor++];
          playTone(event.lane, undefined, event.note);
          effects.push({ lane: event.lane, createdAt: now });
          document.getElementById("freePlayNote").textContent = event.note.displayName;
          keyButtons[event.lane].classList.add("pressed");
          window.setTimeout(() => keyButtons[event.lane].classList.remove("pressed"), 105);
        }
        if (freeReplayCursor === freeRecording.length) {
          freeReplayStartedAt = null;
          refreshFreeRecordingControls("再生が終わりました");
        }
      }
      let effects = [];
      let state = "ready";
      let isTestPlay = false;
      let isTutorial = false;
      let previewTimers = [];
      let isRecording = false;
      let recordingStartedAt = Number.POSITIVE_INFINITY;
      let recordingBeatDuration = 0;
      let recordingSubdivision = 2;
      let recordingEvents = [];
      let recordingGuide = [];
      let recordingBase = [];
      let recordingGuideCursor = 0;
      let recordingTickTimer = 0;
      let startedAt = 0;
      let pausedAt = 0;
      let preparedShareLink = null;
      let score = 0;
      let combo = 0;
      let bestCombo = 0;
      let judged = 0;
      let accuracyPoints = 0;
      let perfectCount = 0;
      let goodCount = 0;
      let missCount = 0;
      let extraCount = 0;

      function calculateScore() {
        // Keep every penalty, even when the displayed score has reached zero.
        return Math.max(0, perfectCount * 1000 + goodCount * 600 - extraCount * 500);
      }

      function performanceAccuracy() {
        const total = judged + extraCount;
        return total ? `${Math.round(accuracyPoints / total)}%` : "—%";
      }
      let toastAnimation = null;
      let hitLine = 0;

      function parseCreatorEvents(source, allowInvalid = false) {
        const noteLane = new Map(notes.map((note, lane) => [`${note.name}${note.octave}`.toUpperCase(), lane]));
        const events = [];
        const errors = [];
        const seen = new Set();
        const lines = source.split(/\r?\n/);
        if (lines.length > 2000) {
          if (!allowInvalid) throw new Error("譜面は2000行以内にしてください。");
          errors.push("譜面は2000行以内にしてください。");
          lines.length = 2000;
        }
        const reportError = (message) => {
          if (!allowInvalid) throw new Error(message);
          errors.push(message);
        };
        for (let index = 0; index < lines.length; index++) {
          const line = lines[index].split("#", 1)[0].trim();
          if (!line) continue;
          const fields = line.split(/[,\s]+/);
          if (fields.length !== 2) {
            reportError(`${index + 1}行目: 「拍,音名」の形式で入力してください。`);
            continue;
          }
          const beat = Number(fields[0]);
          if (!Number.isFinite(beat) || beat < 0 || beat > 10000) {
            reportError(`${index + 1}行目: 拍は0〜10000の数値で入力してください。`);
            continue;
          }
          const lane = noteLane.get(fields[1].toUpperCase());
          if (lane === undefined) {
            reportError(`${index + 1}行目: ${fields[1]} は17鍵カリンバの音名ではありません。`);
            continue;
          }
          const step = beat * 2;
          const duplicateKey = `${step}:${lane}`;
          if (seen.has(duplicateKey)) {
            reportError(`${index + 1}行目: 同じ拍に同じ音が重複しています。`);
            continue;
          }
          seen.add(duplicateKey);
          events.push([step, lane]);
        }
        events.sort((a, b) => a[0] - b[0] || notes[a[1]].semitones - notes[b[1]].semitones);
        return { events, errors };
      }

      function parseCreatorChart(name, bpmValue, source, keySignature = "C", meter = 4) {
        const title = name.trim();
        const bpm = Number(bpmValue);
        if (!title || title.length > 40) throw new Error("曲名を1〜40文字で入力してください。");
        if (!Number.isInteger(bpm) || bpm < 30 || bpm > 240) throw new Error("BPMは30〜240の整数で入力してください。");
        const { events } = parseCreatorEvents(source);
        if (!events.length) throw new Error("譜面に音を1つ以上入力してください。");
        if (!freeSignatures.some((entry) => entry.id === keySignature)) throw new Error("対応していない調号です。");
        return { name: title, bpm, steps: events, directLanes: true, keySignature, meter: [2,3,4,5,6].includes(Number(meter)) ? Number(meter) : null };
      }

      function findAwkwardChords(events) {
        const groups = new Map();
        for (const [step, lane] of events) {
          if (!groups.has(step)) groups.set(step, []);
          groups.get(step).push(lane);
        }
        const warnings = [];
        for (const [step, lanes] of groups) {
          const left = lanes.filter(lane => notes[lane].side === "left");
          const right = lanes.filter(lane => notes[lane].side === "right");
          const center = lanes.find(lane => notes[lane].side === "center");
          const gaps = hand => {
            const sorted = [...hand].sort((a,b) => a-b);
            return sorted.some((lane,i) => i > 0 && lane - sorted[i-1] > 1);
          };
          const assignments = center === undefined ? [[left,right]] : [[[...left,center],right],[left,[...right,center]]];
          const best = assignments.sort((a,b) => a.filter(gaps).length - b.filter(gaps).length)[0];
          for (let side = 0; side < 2; side++) {
            if (gaps(best[side])) warnings.push({step, lanes: best[side], hand: side === 0 ? "左手" : "右手"});
          }
        }
        return warnings;
      }

      function renderSheetPreview() {
        invalidateShareFile();
        const svgNamespace = "http://www.w3.org/2000/svg";
        const createSvgElement = (tag, attributes = {}, text = "") => {
          const element = document.createElementNS(svgNamespace, tag);
          for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
          if (text) element.textContent = text;
          return element;
        };
        const { events, errors } = parseCreatorEvents(creatorChartInput.value, true);
        const awkward = new Set(findAwkwardChords(events).flatMap(item => item.lanes.map(lane => `${item.step}:${lane}`)));
        const eventsByBeat = new Map();
        let lastBeat = 0;
        for (const [step, lane] of events) {
          const beat = step / 2;
          if (!eventsByBeat.has(beat)) eventsByBeat.set(beat, []);
          eventsByBeat.get(beat).push(lane);
          lastBeat = Math.max(lastBeat, beat);
        }

        const left = 64;
        const staffTop = 48;
        const staffGap = 14;
        const staffBottom = staffTop + staffGap * 4;
        const beatWidth = 48;
        const width = Math.max(640, left + (lastBeat + 4) * beatWidth + 24);
        const height = 176;
        const fragment = document.createDocumentFragment();
        const pitchLetters = ["C", "D", "E", "F", "G", "A", "B"];
        const pitchIndex = (note) => note.octave * 7 + pitchLetters.indexOf(note.name);
        const basePitch = 4 * 7 + pitchLetters.indexOf("E");

        const barBeats = Number(creatorMeterInput.value) === 6 ? 3 : Number(creatorMeterInput.value) || 4;
        for (let beat = 0; beat <= Math.floor((width - left - 24) / beatWidth); beat++) {
          const x = left + beat * beatWidth;
          const isBar = beat % barBeats === 0;
          fragment.append(createSvgElement("line", {
            x1: x, y1: staffTop, x2: x, y2: 154,
            class: isBar ? "sheet-bar-line" : "sheet-beat-line"
          }));
          fragment.append(createSvgElement("text", {
            x, y: 169, class: "sheet-beat-label"
          }, `${beat}拍`));
        }

        for (let line = 0; line < 5; line++) {
          const y = staffTop + line * staffGap;
          fragment.append(createSvgElement("line", {
            x1: left, y1: y, x2: width - 12, y2: y, class: "sheet-staff-line"
          }));
        }
        fragment.append(createSvgElement("text", {
          x: 3, y: staffBottom + 10, class: "sheet-clef"
        }, "\u{1D11E}"));

        for (const [beat, lanes] of eventsByBeat) {
          const x = left + beat * beatWidth;
          const ledgerSteps = new Set();
          for (const lane of lanes) {
            const stepFromBottom = pitchIndex(notes[lane]) - basePitch;
            if (stepFromBottom <= -2) {
              for (let ledgerStep = -2; ledgerStep >= stepFromBottom; ledgerStep -= 2) ledgerSteps.add(ledgerStep);
            } else if (stepFromBottom >= 10) {
              for (let ledgerStep = 10; ledgerStep <= stepFromBottom; ledgerStep += 2) ledgerSteps.add(ledgerStep);
            }
          }
          for (const ledgerStep of ledgerSteps) {
            const ledgerY = staffBottom - ledgerStep * (staffGap / 2);
            fragment.append(createSvgElement("line", {
              x1: x - 9, y1: ledgerY, x2: x + 9, y2: ledgerY, class: "sheet-ledger-line"
            }));
          }
          lanes.forEach((lane) => {
            const note = notes[lane];
            const soundingNote = getSignatureNote(lane, creatorKeySignatureInput.value);
            const stepFromBottom = pitchIndex(note) - basePitch;
            const y = staffBottom - stepFromBottom * (staffGap / 2);
            const noteCircle = createSvgElement("circle", {
              cx: x, cy: y, r: 4.5, class: awkward.has(`${beat * 2}:${lane}`) ? "sheet-notehead sheet-note-awkward" : "sheet-notehead"
            });
            noteCircle.append(createSvgElement("title", {}, `${beat}拍 ${soundingNote.displayName}`));
            fragment.append(noteCircle);
            if (soundingNote.accidental) {
              fragment.append(createSvgElement("text", { x: x - 14, y: y + 4, class: "sheet-accidental" }, soundingNote.accidental));
            }
            fragment.append(createSvgElement("circle", {
              cx: x, cy: y, r: 10, class: "sheet-hit-target",
              "data-step": beat * 2, "data-lane": lane, tabindex: 0, role: "button",
              "aria-label": `${beat}拍 ${soundingNote.displayName}。タップまたはDeleteで削除、ドラッグで移動`
            }));
          });
        }

        if (!events.length) {
          fragment.append(createSvgElement("text", {
            x: left + 16, y: 83, class: "sheet-empty"
          }, "五線譜をタップすると音符を追加できます"));
        }

        sheetPreview.replaceChildren(fragment);
        sheetPreview.setAttribute("viewBox", `0 0 ${width} ${height}`);
        sheetPreview.setAttribute("width", String(width));
        sheetPreview.setAttribute("height", String(height));
        sheetPreview.setAttribute("aria-label", `${events.length}音の五線譜。横軸は1拍ごとに48ピクセル、縦軸はト音記号の音高です。同じ拍の音は同じ位置に表示します。`);
        sheetTempo.value = `BPM ${creatorBpmInput.value || "—"} · ${freeSignatures.find((entry) => entry.id === creatorKeySignatureInput.value).label}`;
        sheetTempo.textContent = sheetTempo.value;
        sheetPreviewMessage.classList.toggle("is-error", errors.length > 0);
        if (errors.length) {
          const remaining = errors.length > 1 ? `（ほか${errors.length - 1}件）` : "";
          sheetPreviewMessage.textContent = `入力を確認してください。有効な音のみ表示しています: ${errors[0]}${remaining}`;
        } else {
          sheetPreviewMessage.textContent = "横軸は1拍ごとに等間隔で、0拍から表示します。小数の拍は拍の間に比例して配置し、同時刻の音は縦に並べます。";
        }
      }

      // Keep editor coordinates identical to the staff used by renderSheetPreview.
      function sheetNotePosition(step, lane) {
        const letters = ["C", "D", "E", "F", "G", "A", "B"];
        const note = notes[lane];
        return { x: 64 + step / 2 * 48, y: 104 - (note.octave * 7 + letters.indexOf(note.name) - 30) * 7 };
      }

      function sheetPoint(event) {
        const matrix = sheetPreview.getScreenCTM();
        if (!matrix) return null;
        const point = sheetPreview.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        return point.matrixTransform(matrix.inverse());
      }

      function sheetNoteAtPoint(point) {
        if (!point || point.x < 64 || point.x > sheetPreview.viewBox.baseVal.width) return null;
        const snap = Number(document.getElementById("sheetSnap").value);
        const beat = Math.round((point.x - 64) / 48 / snap) * snap;
        if (beat < 0 || beat > 10000) return null;
        let lane = 0;
        notes.forEach((_, index) => {
          if (Math.abs(sheetNotePosition(0, index).y - point.y) < Math.abs(sheetNotePosition(0, lane).y - point.y)) lane = index;
        });
        if (Math.abs(sheetNotePosition(0, lane).y - point.y) > 3.5) return null;
        return [beat * 2, lane];
      }

      function editSheetNote(original, replacement) {
        if (creatorChartInput.disabled || isRecording) return;
        try {
          // Do not silently discard unfinished text or comments when editing visually.
          const { events } = parseCreatorEvents(creatorChartInput.value);
          if (replacement && events.some(([step, lane]) => step === replacement[0] && lane === replacement[1] &&
              (!original || step !== original[0] || lane !== original[1]))) {
            throw new Error("移動先には同じ音があります。");
          }
          const noteText = ([step, lane]) => `${step / 2},${notes[lane].name}${notes[lane].octave}`;
          const lines = creatorChartInput.value.split(/\r?\n/);
          if (original) {
            const originalName = `${notes[original[1]].name}${notes[original[1]].octave}`.toUpperCase();
            const lineIndex = lines.findIndex((line) => {
              const fields = line.split("#", 1)[0].trim().split(/[,\s]+/);
              return fields.length === 2 && Number(fields[0]) * 2 === original[0] && fields[1].toUpperCase() === originalName;
            });
            if (lineIndex < 0) return;
            const commentAt = lines[lineIndex].indexOf("#");
            const comment = commentAt >= 0 ? lines[lineIndex].slice(commentAt) : "";
            if (replacement) lines[lineIndex] = `${noteText(replacement)}${comment ? ` ${comment}` : ""}`;
            else if (comment) lines[lineIndex] = comment;
            else lines.splice(lineIndex, 1);
          } else if (replacement) {
            if (lines.length === 1 && !lines[0].trim()) lines[0] = noteText(replacement);
            else lines.push(noteText(replacement));
          }
          const source = lines.join("\n");
          parseCreatorEvents(source);
          stopPreview();
          creatorChartInput.value = source;
          renderSheetPreview();
          showCreatorStatus("五線譜の編集を反映しました。保存ボタンで保存してください。");
        } catch (error) {
          showCreatorStatus(error.message, true);
        }
      }

      let sheetGesture = null;
      function cancelSheetGesture() {
        if (!sheetGesture) return;
        const gesture = sheetGesture;
        sheetGesture = null;
        gesture.preview?.remove();
        if (sheetPreview.hasPointerCapture(gesture.id)) sheetPreview.releasePointerCapture(gesture.id);
      }

      sheetPreview.addEventListener("pointerdown", (event) => {
        if (creatorChartInput.disabled || isRecording || sheetGesture || !event.isPrimary || event.button !== 0) return;
        const point = sheetPoint(event);
        if (!point) return;
        const { events } = parseCreatorEvents(creatorChartInput.value, true);
        const nearest = events.map((note) => {
          const position = sheetNotePosition(...note);
          return { note, distance: Math.hypot(point.x - position.x, point.y - position.y) };
        }).sort((a, b) => a.distance - b.distance)[0];
        const original = nearest && nearest.distance <= 10 ? nearest.note : null;
        sheetGesture = { id: event.pointerId, x: event.clientX, y: event.clientY, original, source: creatorChartInput.value, moved: false };
        if (original) event.preventDefault();
        sheetPreview.setPointerCapture(event.pointerId);
      });
      sheetPreview.addEventListener("pointermove", (event) => {
        const gesture = sheetGesture;
        if (!gesture || gesture.id !== event.pointerId) return;
        if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 6) gesture.moved = true;
        if (!gesture.original || !gesture.moved) return;
        const target = sheetNoteAtPoint(sheetPoint(event));
        gesture.preview?.remove();
        gesture.preview = null;
        if (!target) return;
        const position = sheetNotePosition(...target);
        const preview = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        for (const [name, value] of Object.entries({ cx: position.x, cy: position.y, r: 6, class: "sheet-drag-preview" })) preview.setAttribute(name, String(value));
        sheetPreview.append(preview);
        gesture.preview = preview;
      });
      sheetPreview.addEventListener("pointerup", (event) => {
        const gesture = sheetGesture;
        if (!gesture || gesture.id !== event.pointerId) return;
        if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 6) gesture.moved = true;
        const target = sheetNoteAtPoint(sheetPoint(event));
        cancelSheetGesture();
        if (gesture.source !== creatorChartInput.value) return;
        if (gesture.moved) {
          if (gesture.original && target) editSheetNote(gesture.original, target);
        } else if (gesture.original) {
          editSheetNote(gesture.original, null);
        } else if (target) {
          const { events } = parseCreatorEvents(creatorChartInput.value, true);
          const existing = events.find(([step, lane]) => step === target[0] && lane === target[1]);
          editSheetNote(existing || null, existing ? null : target);
        }
      });
      sheetPreview.addEventListener("pointercancel", cancelSheetGesture);
      sheetPreview.addEventListener("lostpointercapture", cancelSheetGesture);
      sheetPreview.addEventListener("keydown", (event) => {
        const target = event.target.closest(".sheet-hit-target");
        if (!target || !["Delete", "Backspace", "Enter", " "].includes(event.key)) return;
        event.preventDefault();
        editSheetNote([Number(target.dataset.step), Number(target.dataset.lane)], null);
      });

      function sortCreatorChartSource(source) {
        parseCreatorEvents(source);
        const lines = source.split(/\r?\n/);
        const isNoteLine = (line) => Boolean(line.split("#", 1)[0].trim());
        const pitches = new Map(notes.map((note) => [`${note.name}${note.octave}`.toUpperCase(), note.semitones]));
        const fields = (line) => line.split("#", 1)[0].trim().split(/[,\s]+/);
        const sorted = lines.filter(isNoteLine).sort((a, b) => {
          const first = fields(a);
          const second = fields(b);
          return Number(first[0]) - Number(second[0]) || pitches.get(first[1].toUpperCase()) - pitches.get(second[1].toUpperCase());
        });
        let index = 0;
        // Move inline comments with their notes; retain standalone comments and blank lines.
        return lines.map((line) => isNoteLine(line) ? sorted[index++] : line).join("\n");
      }

      function sortCreatorChart() {
        if (creatorChartInput.disabled || isRecording) return;
        try {
          const source = sortCreatorChartSource(creatorChartInput.value);
          cancelSheetGesture();
          stopPreview();
          creatorChartInput.value = source;
          renderSheetPreview();
          showCreatorStatus("拍順・同じ拍は低い音順に並べ替えました。保存ボタンで保存してください。");
        } catch (error) {
          showCreatorStatus(error.message, true);
        }
      }

      function chartToSource(songChart) {
        const laneFor = (noteIndex) => songChart.directLanes ? noteIndex : scaleToLane[noteIndex];
        return [...songChart.steps]
          .sort((a, b) => a[0] - b[0] || notes[laneFor(a[1])].semitones - notes[laneFor(b[1])].semitones)
          .map(([step, noteIndex]) => {
            const lane = songChart.directLanes ? noteIndex : scaleToLane[noteIndex];
            return `${Number((step / 2).toFixed(3))},${notes[lane].name}${notes[lane].octave}`;
          })
          .join("\n");
      }

      function showCreatorStatus(message, isError = false) {
        creatorStatus.textContent = message;
        creatorStatus.classList.toggle("is-error", isError);
      }

      function stopPreview(showMessage = false) {
        previewTimers.forEach((timer) => window.clearTimeout(timer));
        previewTimers = [];
        keyButtons.forEach((button) => button.classList.remove("pressed"));
        previewChartButton.disabled = false;
        stopPreviewButton.hidden = true;
        if (showMessage) showCreatorStatus("試聴を停止しました。");
      }

      function getArpeggiatedEvents(steps, directLanes, bpm) {
        const grouped = new Map();
        for (const [step, noteIndex] of steps) {
          const lane = directLanes ? noteIndex : scaleToLane[noteIndex];
          if (!grouped.has(step)) grouped.set(step, []);
          grouped.get(step).push(lane);
        }
        const events = [];
        let leadIn = 0;
        let previousStep = null;
        for (const [step, lanes] of [...grouped].sort((a,b)=>a[0]-b[0])) {
          const hands = {
            left: lanes.filter((lane) => notes[lane].side === "left"),
            right: lanes.filter((lane) => notes[lane].side === "right")
          };
          // Either thumb can play the center C4; use the less busy hand.
          for (const lane of lanes.filter((lane) => notes[lane].side === "center")) {
            const hand = hands.left.length <= hands.right.length ? hands.left : hands.right;
            hand.push(lane);
          }
          const orderedLanes = [...hands.left, ...hands.right]
            .sort((a, b) => notes[a].semitones - notes[b].semitones);
          // Keep the lead-in inside the latter half of the preceding gap.
          // Otherwise a dense chord can cover or overtake the previous note.
          const availableDuration = previousStep === null ? maxArpeggioDuration
            : Math.min(maxArpeggioDuration, (step - previousStep) * 30 / bpm / 2);
          // Two notes split between the thumbs are played together. The center
          // C4 has already been assigned to the less busy, opposite hand above.
          const isTwoHandPair = orderedLanes.length === 2
            && hands.left.length === 1 && hands.right.length === 1;
          const interval = isTwoHandPair ? 0 : orderedLanes.length > 1
            ? Math.min(arpeggioNoteInterval, availableDuration / (orderedLanes.length - 1))
            : 0;
          leadIn = Math.max(leadIn, interval * Math.max(0, orderedLanes.length - 1));
          const handIndexes = { left: 0, right: 0 };
          for (let index = 0; index < orderedLanes.length; index++) {
            const lane = orderedLanes[index];
            const handSide = hands.left.includes(lane) ? "left" : "right";
            events.push({
              step,
              lane,
              offset: (index - orderedLanes.length + 1) * interval,
              handSide,
              handIndex: handIndexes[handSide]++
            });
          }
          previousStep = step;
        }
        events.sort((a, b) => a.step - b.step || a.offset - b.offset);
        return { events, leadIn };
      }

      function playMetronome(accent) {
        try {
          if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
          if (audioContext.state === "suspended") audioContext.resume();
          const now = audioContext.currentTime;
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();
          oscillator.type = "sine";
          oscillator.frequency.value = accent ? 1320 : 880;
          gain.gain.setValueAtTime(.0001, now);
          gain.gain.exponentialRampToValueAtTime(Math.max(.0002, .16 * settings.volume / 100), now + .004);
          gain.gain.exponentialRampToValueAtTime(.0001, now + .045);
          oscillator.connect(gain).connect(audioContext.destination);
          oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
          oscillator.start(now);
          oscillator.stop(now + .05);
        } catch (error) {
          console.warn("メトロノームを再生できませんでした。ブラウザーの音声設定をご確認ください。", error);
        }
      }

      function scheduleRecordingBeat(beatIndex, deadline) {
        if (!isRecording) return;
        recordingTickTimer = window.setTimeout(() => {
          if (!isRecording) return;
          if (beatIndex < 4) {
            playMetronome(false);
            recordingIndicator.textContent = `録音開始まで ${4 - beatIndex}`;
            document.getElementById("recordingCountdown").textContent = String(4 - beatIndex);
            scheduleRecordingBeat(beatIndex + 1, deadline + recordingBeatDuration);
          } else {
            if (!Number.isFinite(recordingStartedAt)) recordingStartedAt = performance.now();
            playMetronome(false);
            scheduleRecordingBeat(beatIndex + 1, Math.max(performance.now() + 20, deadline + recordingBeatDuration));
            document.getElementById("recordingCountdown").hidden = true;
            recordingIndicator.textContent = "録音中 · 終わったら「録音を止める」を押してください";
          }
        }, Math.max(0, deadline - performance.now()));
      }

      function startRecording(prepared = false, overdub = false) {
        if (isRecording || state === "playing" || state === "paused" || state === "free") return;
        const title = creatorNameInput.value.trim();
        const bpm = Number(creatorBpmInput.value);
        if (!title || title.length > 40) {
          showCreatorStatus("曲名を1〜40文字で入力してください。", true);
          return;
        }
        if (!Number.isInteger(bpm) || bpm < 30 || bpm > 240) {
          showCreatorStatus("BPMは30〜240の整数で入力してください。", true);
          return;
        }
        let base = [];
        if (overdub) {
          try {
            base = parseCreatorChart(title, bpm, creatorChartInput.value, creatorKeySignatureInput.value, creatorMeterInput.value).steps;
          } catch (error) { showCreatorStatus(error.message, true); return; }
        }
        if (prepared !== true) { showRecordingReady(() => startRecording(true, overdub), bpm); return; }
        stopPreview();
        prepareRecordingAudio();
        isRecording = true;
        trackUsage('recording_start', {mode: overdub ? 'overdub' : 'new', bpm});
        updateKeyLabels();
        recordingStartedAt = Number.POSITIVE_INFINITY;
        recordingBeatDuration = 60000 / bpm;
        recordingSubdivision = Number(quantizeSetting.value);
        recordingEvents = [];
        recordingBase = base.map(([step, lane]) => ({ beat: step / 2, lane }));
        recordingGuide = getArpeggiatedEvents(base, true, bpm).events.map(event => ({ ...event, time: event.step * 30 / bpm + event.offset }));
        recordingGuideCursor = 0;
        activeNotes = [];
        activeTimingLines = [];
        startRecordingButton.hidden = true;
        stopRecordingButton.hidden = false;
        document.getElementById("discardRecordingButton").hidden = false;
        selectionControls.forEach((control) => { control.disabled = true; });
        app.classList.add("is-playing", "is-recording");
        recordingIndicator.hidden = false;
        recordingIndicator.textContent = "録音の準備中";
        document.getElementById("recordingCountdown").hidden = false;
        document.getElementById("recordingCountdown").textContent = "4";
        document.getElementById("gameStatus").textContent = "RECORDING";
        overlay.classList.add("hidden");
        resizeCanvas();
        const countInStart = performance.now() + 60;
        recordingStartedAt = countInStart + recordingBeatDuration * 4;
        scheduleRecordingBeat(0, countInStart);
      }

      function recordKeyPress(lane) {
        if (!isRecording || performance.now() < recordingStartedAt) return;
        playTone(lane);
        keyButtons[lane].classList.add("pressed");
        window.setTimeout(() => keyButtons[lane].classList.remove("pressed"), 105);
        const elapsedBeats = Math.max(0, (performance.now() - recordingStartedAt) / recordingBeatDuration);
        const beat = Math.round(elapsedBeats * recordingSubdivision) / recordingSubdivision;
        if (!recordingEvents.some((event) => event.beat === beat && event.lane === lane)) {
          recordingEvents.push({ beat, lane });
        }
      }

      function stopRecording(discard = false) {
        if (!isRecording) return;
        trackUsage('recording_end', {reason: discard === true ? 'discard' : 'save', notes: recordingEvents.length, seconds: Number.isFinite(recordingStartedAt) ? Math.max(0, (performance.now()-recordingStartedAt)/1000) : 0});
        isRecording = false;
        updateKeyLabels();
        window.clearTimeout(recordingTickTimer);
        app.classList.remove("is-playing", "is-recording");
        recordingIndicator.hidden = true;
        document.getElementById("recordingCountdown").hidden = true;
        startRecordingButton.hidden = false;
        stopRecordingButton.hidden = true;
        document.getElementById("discardRecordingButton").hidden = true;
        document.getElementById("gameStatus").textContent = "待機中";
        document.getElementById("overlayTitle").textContent = "録音を終了しました";
        document.getElementById("overlayCopy").textContent = "譜面を確認して、保存またはもう一度録音してください。";
        document.getElementById("startButton").textContent = "曲を演奏";
        overlay.classList.remove("hidden");
        selectionControls.forEach((control) => { control.disabled = false; });
        resizeCanvas();
        if (discard === true) {
          recordingEvents = [];
          recordingGuide = [];
          recordingBase = [];
          document.getElementById("overlayTitle").textContent = "録音を取り消しました";
          showCreatorStatus("今回の録音は反映していません。元の譜面を保持しています。");
          return;
        }
        if (!recordingEvents.length) {
          showCreatorStatus("録音した音がありません。譜面欄は変更していません。");
          return;
        }
        const combined = new Map();
        for (const event of [...recordingBase, ...recordingEvents]) combined.set(`${event.beat}:${event.lane}`, event);
        recordingEvents = [...combined.values()];
        recordingEvents.sort((a, b) => a.beat - b.beat || a.lane - b.lane);
        creatorChartInput.value = recordingEvents
          .map(({ beat, lane }) => `${Number(beat.toFixed(4))},${notes[lane].name}${notes[lane].octave}`)
          .join("\n");
        renderSheetPreview();
        showCreatorStatus(`${recordingEvents.length}音をクオンタイズして譜面欄に反映しました。保存する場合は保存ボタンを押してください。`);
      }

      function previewCreatorChart() {
        let previewChart;
        try {
          previewChart = parseCreatorChart(creatorNameInput.value, creatorBpmInput.value, creatorChartInput.value, creatorKeySignatureInput.value, creatorMeterInput.value);
        } catch (error) {
          showCreatorStatus(error.message, true);
          return;
        }
        stopPreview();
        const { events, leadIn } = getArpeggiatedEvents(previewChart.steps, true, previewChart.bpm);
        const beatDuration = 60000 / previewChart.bpm;
        const startAt = performance.now() + leadIn;
        previewChartButton.disabled = true;
        stopPreviewButton.hidden = false;
        showCreatorStatus(`「${previewChart.name}」を試聴中です。`);
        for (const { step, lane, offset } of events) {
          const timer = window.setTimeout(() => {
            playTone(lane, previewChart.keySignature);
            keyButtons[lane].classList.add("pressed");
            window.setTimeout(() => keyButtons[lane].classList.remove("pressed"), 120);
          }, Math.max(0, startAt + (step * beatDuration / 2 + offset) - performance.now()));
          previewTimers.push(timer);
        }
        const finalTime = Math.max(...events.map(({ step, offset }) => step * beatDuration / 2 + offset));
        previewTimers.push(window.setTimeout(() => {
          previewTimers = [];
          previewChartButton.disabled = false;
          stopPreviewButton.hidden = true;
          showCreatorStatus(`「${previewChart.name}」の試聴が終わりました。`);
        }, Math.max(0, startAt + finalTime + 650 - performance.now())));
      }

      function persistMakerSongs(songs) {
        try {
          localStorage.setItem(makerStorageKey, JSON.stringify(songs.map(normalizeMakerSong)));
          return true;
        } catch (error) {
          console.error("譜面を保存できませんでした。ブラウザーの保存容量を確認してください。", error);
          showCreatorStatus("保存できませんでした。ブラウザーの保存容量を確認してください。", true);
          return false;
        }
      }

      function validateChartPack(pack, allowEmpty = false) {
        if (!pack || pack.format !== "otoiro-chart-pack" || pack.version !== 1 || !Array.isArray(pack.songs)) {
          throw new Error("譜面ファイルの形式が対応していません。");
        }
        if ((!allowEmpty && !pack.songs.length) || pack.songs.length > 200) {
          throw new Error("譜面ファイルには1〜200曲を含めてください。");
        }
        const imported = [];
        const seenIds = new Set();
        for (let index = 0; index < pack.songs.length; index++) {
          const entry = pack.songs[index];
          const validId = entry && (
            Object.prototype.hasOwnProperty.call(builtInSongNames, entry.id) ||
            (typeof entry.id === "string" && /^user-[a-zA-Z0-9-]{1,100}$/.test(entry.id))
          );
          if (!validId) throw new Error(`${index + 1}曲目: 曲IDが正しくありません。`);
          if (removedBundledSongIds.has(entry.id)) continue;
          if (seenIds.has(entry.id)) throw new Error(`${index + 1}曲目: 曲IDが重複しています。`);
          seenIds.add(entry.id);
          const validated = parseCreatorChart(entry.name, entry.bpm, entry.source, entry.keySignature, entry.meter);
          imported.push({
            id: entry.id,
            name: validated.name,
            bpm: validated.bpm,
            keySignature: validated.keySignature,
            source: chartToSource(validated),
            meter: validated.meter
          });
        }
        return imported;
      }

      function mergeMakerSongs(songs, authoritative = false) {
        const merged = new Map(authoritative ? [] : makerSongs.map((song) => [song.id, song]));
        for (const song of songs) merged.set(song.id, song);
        return [...merged.values()];
      }

      function applyMakerSongs(songs) {
        const songIds = new Set(songs.map((song) => song.id));
        for (const previousSong of makerSongs) {
          if (songIds.has(previousSong.id)) continue;
          if (previousSong.id in builtInSongNames) {
            charts[previousSong.id] = builtInChartDefaults[previousSong.id];
            songNames[previousSong.id] = builtInSongNames[previousSong.id];
          } else {
            delete charts[previousSong.id];
            delete songNames[previousSong.id];
          }
        }
        makerSongs = songs;
        for (const song of songs) {
          const validated = parseCreatorChart(song.name, song.bpm, song.source, song.keySignature, song.meter);
          charts[song.id] = { bpm: validated.bpm, steps: validated.steps, directLanes: true, keySignature: validated.keySignature, meter: validated.meter };
          songNames[song.id] = validated.name;
        }
        refreshSongOptions(songSelect.value);
        if (catalogVisibleIds) {
          for (const id of Object.keys(builtInSongNames)) if (!catalogVisibleIds.has(id)) { delete charts[id]; delete songNames[id]; }
          refreshSongOptions(songSelect.value);
        }
        deleteChartButton.hidden = !songSelect.value.startsWith("user-");
      }

      function openProjectHandleDatabase() {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open("otoiro-project-folder", 1);
          request.onupgradeneeded = () => request.result.createObjectStore("handles");
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }

      async function getSavedProjectDirectory() {
        const database = await openProjectHandleDatabase();
        return new Promise((resolve, reject) => {
          const request = database.transaction("handles", "readonly").objectStore("handles").get("project");
          request.onsuccess = () => {
            database.close();
            resolve(request.result || null);
          };
          request.onerror = () => {
            database.close();
            reject(request.error);
          };
        });
      }

      async function saveProjectDirectory(directoryHandle) {
        const database = await openProjectHandleDatabase();
        return new Promise((resolve, reject) => {
          const transaction = database.transaction("handles", "readwrite");
          transaction.objectStore("handles").put(directoryHandle, "project");
          transaction.oncomplete = () => {
            database.close();
            resolve();
          };
          transaction.onerror = () => {
            database.close();
            reject(transaction.error);
          };
        });
      }

      async function getProjectChartsFile(directoryHandle, create = false) {
        const assets = await directoryHandle.getDirectoryHandle("assets", { create });
        const data = await assets.getDirectoryHandle("data", { create });
        return data.getFileHandle("custom-charts.json", { create });
      }

      function normalizeMakerSong(song) {
        const validated = parseCreatorChart(song.name, song.bpm, song.source, song.keySignature, song.meter);
        return { id: song.id, name: validated.name, bpm: validated.bpm, keySignature: validated.keySignature, source: chartToSource(validated), meter: validated.meter };
      }

      function createChartPack(songs) {
        return {
          format: "otoiro-chart-pack",
          version: 1,
          updatedAt: new Date().toISOString(),
          songs: songs.map(normalizeMakerSong)
        };
      }

      async function readProjectSongs(directoryHandle) {
        const fileHandle = await getProjectChartsFile(directoryHandle);
        const file = await fileHandle.getFile();
        if (file.size > 2 * 1024 * 1024) throw new Error("プロジェクトの譜面ファイルが2MBを超えています。");
        const pack = await window.OtoiroSharing.decode(file);
        return {
          songs: validateChartPack(pack, true),
          authoritative: typeof pack.updatedAt === "string"
        };
      }

      async function writeProjectSongs(directoryHandle, songs) {
        const permission = await directoryHandle.queryPermission({ mode: "readwrite" });
        if (permission !== "granted") throw new Error("書き込み許可がありません。プロジェクトフォルダーと再連携してください。");
        const fileHandle = await getProjectChartsFile(directoryHandle, true);
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(createChartPack(songs), null, 2));
        await writable.close();
        if (window.location.protocol !== "file:") await verifyServedProjectSongs(songs);
      }

      async function verifyServedProjectSongs(expectedSongs) {
        const url = new URL("./assets/data/custom-charts.json", window.location.href);
        url.searchParams.set("verify", String(Date.now()));
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error("スマホ配信側の譜面ファイルを読み込めません。Live Serverの公開フォルダーを確認してください。");
        const actualSongs = validateChartPack(await response.json(), true);
        const actualById = new Map(actualSongs.map((song) => [song.id, song]));
        const matches = actualSongs.length === expectedSongs.length && expectedSongs.every((song) => {
          const actual = actualById.get(song.id);
          return actual && actual.name === song.name && actual.bpm === song.bpm && actual.keySignature === (song.keySignature || "C") && actual.source === song.source;
        });
        if (!matches) {
          throw new Error("選んだ保存先とスマホ配信中のフォルダーが一致しません。Live Serverで開いているこのゲームと同じフォルダーを選び直してください。");
        }
      }

      function syncProjectSongs(songs) {
        if (!projectDirectoryHandle) return Promise.resolve(false);
        const snapshot = songs.map(normalizeMakerSong);
        projectSaveQueue = projectSaveQueue
          .then(() => writeProjectSongs(projectDirectoryHandle, snapshot))
          .then(() => true)
          .catch((error) => {
            console.error("プロジェクトの譜面ファイルを更新できませんでした。", error);
            showCreatorStatus(`ブラウザー内には保存しましたが、プロジェクトへの保存に失敗しました。${error.message}`, true);
            return false;
          });
        return projectSaveQueue;
      }

      async function connectProjectFolder() {
        if (window.location.protocol === "file:") {
          showCreatorStatus("この画面はファイルを直接開いているため、スマホ配信先と連携できません。PCで http://127.0.0.1:5500/ を開き、そちらの製作者モードから保存してください。", true);
          return false;
        }
        if (!("showDirectoryPicker" in window)) {
          showCreatorStatus("プロジェクトへの直接保存は、File System Access API対応のPC版ChromeまたはEdgeで利用できます。", true);
          return;
        }
        let connectionStage = "フォルダー選択";
        try {
          let directoryHandle;
          try {
            directoryHandle = await window.showDirectoryPicker({ mode: "readwrite", startIn: "desktop" });
          } catch (error) {
            if (error.name === "AbortError") {
              showCreatorStatus("フォルダー選択が閉じられました。連携する場合は program_1022 フォルダーを選び、「フォルダーの選択」を押してください。");
              return false;
            }
            throw error;
          }

          connectionStage = "フォルダー確認";
          try {
            await directoryHandle.getFileHandle("index.html");
          } catch (error) {
            if (error.name === "NotFoundError") {
              throw new Error("選んだフォルダーに index.html がありません。「OneDrive → デスクトップ → program_1022」を選び直してください。");
            }
            throw error;
          }
          connectionStage = "書き込み許可";
          let permission = await directoryHandle.queryPermission({ mode: "readwrite" });
          if (permission !== "granted") permission = await directoryHandle.requestPermission({ mode: "readwrite" });
          if (permission !== "granted") throw new Error("フォルダーへの書き込みが許可されませんでした。");

          connectionStage = "既存の譜面読み込み";
          let projectSongs = [];
          try {
            projectSongs = (await readProjectSongs(directoryHandle)).songs;
          } catch (error) {
            if (error.name !== "NotFoundError") throw error;
          }
          connectionStage = "譜面ファイル保存・配信確認";
          const mergedSongs = mergeMakerSongs(projectSongs);
          await writeProjectSongs(directoryHandle, mergedSongs);
          connectionStage = "連携情報保存";
          await saveProjectDirectory(directoryHandle);
          projectDirectoryHandle = directoryHandle;
          if (!persistMakerSongs(mergedSongs)) {
            showCreatorStatus("プロジェクトへ譜面を保存しましたが、ブラウザー内保存はできませんでした。", true);
          }
          applyMakerSongs(mergedSongs);
          showCreatorStatus("保存先を確認しました。スマホ配信中の譜面ファイルと一致しています。今後の保存も同期されます。");
          return true;
        } catch (error) {
          if (error.name === "AbortError") {
            showCreatorStatus(`${connectionStage}が中断されました。フォルダーを選んだ後に許可確認が表示された場合は、「許可」を選んでください。`, true);
            return false;
          }
          console.error(`プロジェクトフォルダーとの連携に失敗しました（${connectionStage}）。`, error);
          showCreatorStatus(`${connectionStage}に失敗しました。${error.message || "ブラウザーの許可設定を確認してください。"}`, true);
          return false;
        }
      }

      async function restoreProjectSongs() {
        let restoredSongs = null;
        let authoritative = false;
        try {
          if (window.location.protocol === "file:") throw new Error("ファイルから直接開いています。");
          const response = await fetch("./assets/data/custom-charts.json", { cache: "no-store" });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          let pack = await response.json();
          try {
            const config = await (await fetch('./assets/data/community-config.json', {cache:'no-store'})).json();
            const catalog = await fetch(`${config.url}/rest/v1/catalog_songs?select=id,title,bpm,source,key_signature,meter&order=created_at.asc`, {headers:{apikey:config.publishableKey},cache:'no-store',signal:AbortSignal.timeout(8000)});
            if (!catalog.ok) throw new Error('catalog unavailable');
            const rows = await catalog.json();
            catalogVisibleIds = new Set(rows.map(s=>s.id));
            pack = {format:'otoiro-chart-pack',version:1,updatedAt:new Date().toISOString(),songs:rows.map(s=>({id:s.id,name:s.title,bpm:s.bpm,source:s.source,keySignature:s.key_signature,meter:s.meter}))};
          } catch (error) { console.warn('収録曲は保存済みの一覧を使用します。',error); }
          restoredSongs = validateChartPack(pack, true);
          authoritative = typeof pack.updatedAt === "string";
        } catch (fetchError) {
          try {
            if (!projectDirectoryHandle) return;
            const projectFile = await readProjectSongs(projectDirectoryHandle);
            restoredSongs = projectFile.songs;
            authoritative = projectFile.authoritative;
          } catch (error) {
            console.warn("プロジェクトの譜面ファイルを読み込めませんでした。", error);
            return;
          }
        }
        if (!restoredSongs || (!authoritative && !restoredSongs.length)) return;
        const localSongs = makerSongs.filter(s => !s.id.startsWith('user-catalog-') && !['twinkle','maryHadALittleLamb','user-20261024-edelweiss-share','user-20261024-canon-share','user-1792657188767-06mqg','user-1792658715575-ygkqm'].includes(s.id));
        const mergedSongs = [...new Map([...restoredSongs, ...localSongs].map((song) => [song.id, song])).values()];
        if (!persistMakerSongs(mergedSongs)) return;
        applyMakerSongs(mergedSongs);
      }

      function exportCreatorSongs() {
        try {
          const songs = Object.entries(songNames).map(([id, name]) => ({
            id: id.startsWith("community-") ? `user-${id}` : id,
            name,
            bpm: charts[id].bpm,
            keySignature: charts[id].keySignature || "C",
            source: chartToSource(charts[id]),
            meter: charts[id].meter ?? null
          }));
          const pack = { ...createChartPack(songs), exportedAt: new Date().toISOString() };
          const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `otoiro-songs-${new Date().toISOString().slice(0, 10)}.json`;
          link.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          showCreatorStatus(`${songs.length}曲をJSONファイルに書き出しました。`);
        } catch (error) {
          console.error("譜面データを書き出せませんでした。", error);
          showCreatorStatus("書き出しに失敗しました。ブラウザーのダウンロード設定をご確認ください。", true);
        }
      }

      async function exportPortableApp() {
        if (window.location.protocol === "file:") {
          showCreatorStatus("スマホ用アプリの書き出しは、PCでLive Serverを開いて実行してください。書き出した後はPCのサーバーなしで遊べます。", true);
          return;
        }
        exportMobileAppButton.disabled = true;
        try {
          const [styleResponse, scriptResponse, sharingResponse, resultShareResponse, songLibraryResponse, freeVideoResponse] = await Promise.all([
            fetch("./assets/css/style.css", { cache: "no-store" }),
            fetch("./assets/js/game.js", { cache: "no-store" }),
            fetch("./assets/js/sharing.js", { cache: "no-store" }),
            fetch("./assets/js/result-share.js", { cache: "no-store" }),
            fetch("./assets/js/song-library.js", { cache: "no-store" }),
            fetch("./assets/js/free-video.js", { cache: "no-store" })
          ]);
          if (!styleResponse.ok || !scriptResponse.ok || !sharingResponse.ok || !resultShareResponse.ok || !songLibraryResponse.ok || !freeVideoResponse.ok) throw new Error("アプリのファイルを読み込めませんでした。");
          const [styleText, scriptText, sharingText, resultShareText, songLibraryText, freeVideoText] = await Promise.all([styleResponse.text(), scriptResponse.text(), sharingResponse.text(), resultShareResponse.text(), songLibraryResponse.text(), freeVideoResponse.text()]);
          const songs = Object.entries(songNames).map(([id, name]) => ({
            id: id.startsWith("community-") ? `user-${id}` : id,
            name,
            bpm: charts[id].bpm,
            keySignature: charts[id].keySignature || "C",
            source: chartToSource(charts[id]),
            meter: charts[id].meter ?? null
          }));
          const pack = createChartPack(songs);
          const portableDocument = document.documentElement.cloneNode(true);
          portableDocument.querySelectorAll('link[rel="manifest"], link[rel="icon"], link[rel="apple-touch-icon"], link[rel="stylesheet"]').forEach((link) => link.remove());
          portableDocument.querySelector("#connectProjectButton")?.remove();
          portableDocument.querySelector("#exportMobileAppButton")?.remove();
          portableDocument.querySelector(".project-folder-help")?.remove();
          portableDocument.querySelectorAll(".beta-feedback").forEach(node=>node.remove());
          portableDocument.querySelector('script[src="assets/js/feedback.js"]')?.remove();
          portableDocument.querySelector('script[src="assets/js/diagnostics.js"]')?.remove();
          portableDocument.querySelector('script[src="assets/js/analytics.js"]')?.remove();
          const portableStyle = document.createElement("style");
          portableStyle.textContent = styleText.replace(/<\/style/gi, "<\\/style");
          portableDocument.querySelector("head").append(portableStyle);
          const oldScript = portableDocument.querySelector('script[src="assets/js/game.js"]');
          const portableScript = document.createElement("script");
          portableDocument.querySelector('script[src="assets/js/sharing.js"]')?.remove();
          portableDocument.querySelector('script[src="assets/js/result-share.js"]')?.remove();
          portableDocument.querySelector('script[src="assets/js/song-library.js"]')?.remove();
          portableDocument.querySelector('script[src="assets/js/free-video.js"]')?.remove();
          portableDocument.querySelector("#resultPanel").hidden = true;
          const embeddedPack = JSON.stringify(pack).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
          portableScript.textContent = `window.OTOIRO_PORTABLE_APP=true;window.OTOIRO_EMBEDDED_CHARTS=${embeddedPack};\n${sharingText.replace(/<\/script/gi, "<\\/script")}\n${resultShareText.replace(/<\/script/gi, "<\\/script")}\n${songLibraryText.replace(/<\/script/gi, "<\\/script")}\n${freeVideoText.replace(/<\/script/gi, "<\\/script")}\n${scriptText.replace(/<\/script/gi, "<\\/script")}`;
          oldScript.replaceWith(portableScript);
          const blob = new Blob(["<!doctype html>\n", portableDocument.outerHTML], { type: "text/html;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "otoiro-mobile.html";
          link.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 5000);
          showCreatorStatus(`${songs.length}曲を含むスマホ用アプリを書き出しました。HTMLファイルをスマホへ送り、ブラウザーで開いてください。`);
        } catch (error) {
          console.error("スマホ用アプリを書き出せませんでした。", error);
          showCreatorStatus(`スマホ用アプリを書き出せませんでした。${error.message}`, true);
        } finally {
          exportMobileAppButton.disabled = false;
        }
      }

      async function importCreatorSongs(file) {
        showCreatorStatus("譜面ファイルを読み込んでいます…");
        if (file.size > 2 * 1024 * 1024) {
          showCreatorStatus("ファイルサイズが大きすぎます（上限2MB）。", true);
          return;
        }
        let pack;
        try {
          pack = await window.OtoiroSharing.decode(file);
        } catch (error) {
          console.error("譜面ファイルを読み取れませんでした。", error);
          showCreatorStatus(error.message || "譜面ファイルを読み取れません。", true);
          return;
        }
        let imported;
        try {
          imported = validateChartPack(pack);
        } catch (error) {
          showCreatorStatus(`読み込みを中止しました。${error.message}`, true);
          return;
        }

        const existingIds = new Set(makerSongs.map((song) => song.id));
        const conflicts = imported.filter((song) => existingIds.has(song.id)).length;
        const prompt = `${imported.length}曲を読み込みます。${conflicts ? `\n同じIDの${conflicts}曲はファイルの内容で上書きします。` : ""}\n現在の譜面と統合しますか？`;
        if (!window.confirm(prompt)) {
          showCreatorStatus("読み込みをキャンセルしました。");
          return;
        }

        const importedIds = new Set(imported.map((song) => song.id));
        const mergedSongs = [...makerSongs.filter((song) => !importedIds.has(song.id)), ...imported];
        if (!persistMakerSongs(mergedSongs)) return;
        applyMakerSongs(mergedSongs);

        refreshSongOptions(imported[0].id);
        loadSelectedSongIntoEditor();
        showCreatorStatus(`${imported.length}曲をこのブラウザーに保存しました。曲を選んで演奏できます。`);
      }

      function refreshSongOptions(selectedId = songSelect.value) {
        songSelect.replaceChildren();
        for (const [id, name] of Object.entries(songNames)) {
          const option = document.createElement("option");
          option.value = id;
          option.textContent = name;
          songSelect.append(option);
        }
        songSelect.value = songNames[selectedId] ? selectedId : Object.keys(songNames)[0] || '';
        document.getElementById('startButton').disabled = !songSelect.value;
        chart = charts[songSelect.value];
        updateReadyBpm();
        songLibrary?.refresh();
      }

      function restoreMakerSongs() {
        let stored;
        try {
          const raw = localStorage.getItem(makerStorageKey) || (window.OTOIRO_EMBEDDED_CHARTS ? JSON.stringify(window.OTOIRO_EMBEDDED_CHARTS.songs) : null);
          if (!raw) return;
          stored = JSON.parse(raw);
        } catch (error) {
          console.error("保存された譜面を読み込めませんでした。", error);
          showCreatorStatus("保存された譜面を読み込めませんでした。製作者モードで再保存してください。", true);
          return;
        }
        if (!Array.isArray(stored)) {
          showCreatorStatus("保存された譜面データの形式が正しくありません。", true);
          return;
        }
        const restored = [];
        for (const song of stored) {
          if (!song || typeof song.id !== "string" || typeof song.name !== "string" || typeof song.source !== "string") continue;
          if (removedBundledSongIds.has(song.id)) continue;
          if ((song.id.startsWith('user-catalog-') || ['user-20261024-edelweiss-share','user-20261024-canon-share','user-1792657188767-06mqg','user-1792658715575-ygkqm'].includes(song.id)) && !window.OTOIRO_PORTABLE_APP) continue;
          if (!(song.id in builtInSongNames) && !song.id.startsWith("user-")) continue;
          try {
            const restoredChart = parseCreatorChart(song.name, song.bpm, song.source, song.keySignature, song.meter);
            restored.push({ id: song.id, name: restoredChart.name, bpm: restoredChart.bpm, keySignature: restoredChart.keySignature, source: chartToSource(restoredChart), meter: restoredChart.meter });
            charts[song.id] = { bpm: restoredChart.bpm, steps: restoredChart.steps, directLanes: true, keySignature: restoredChart.keySignature, meter: restoredChart.meter };
            songNames[song.id] = restoredChart.name;
          } catch (error) {
            console.warn(`譜面「${song.name}」を読み込めませんでした。`, error);
          }
        }
        makerSongs = restored;
        if (JSON.stringify(stored) !== JSON.stringify(restored)) persistMakerSongs(restored);
        refreshSongOptions();
      }

      function loadSelectedSongIntoEditor() {
        const id = songSelect.value;
        const selectedChart = charts[id];
        if (!selectedChart) {
          showCreatorStatus("選択中の曲を読み込めませんでした。", true);
          return;
        }
        creatorNameInput.value = id in builtInSongNames
          ? songNames[id].replace(/ — やさしい$/, "")
          : songNames[id];
        creatorBpmInput.value = String(selectedChart.bpm);
        creatorKeySignatureInput.value = selectedChart.keySignature || "C";
        creatorMeterInput.value = selectedChart.meter === null ? "none" : String(selectedChart.meter || 4);
        creatorChartInput.value = chartToSource(selectedChart);
        renderSheetPreview();
        deleteChartButton.hidden = !id.startsWith("user-");
        showCreatorStatus(`「${songNames[id]}」を読み込みました。`);
      }

      async function saveCreatorSong(isNew) {
        const selectedId = songSelect.value;
        const id = isNew || !selectedId.startsWith("user-")
          ? `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          : selectedId;
        let validated;
        try {
          validated = parseCreatorChart(creatorNameInput.value, creatorBpmInput.value, creatorChartInput.value, creatorKeySignatureInput.value, creatorMeterInput.value);
        } catch (error) {
          showCreatorStatus(error.message, true);
          return;
        }
        const awkward = findAwkwardChords(validated.steps);
        if (awkward.length) {
          const places = awkward.map(item => `${item.step / 2}拍：${item.hand} ${item.lanes.map(lane => notes[lane].name + notes[lane].octave).join("・")}`).join("\n");
          if (!window.confirm(`実際のカリンバでは弾きにくい箇所があります。\n同じ手の音が隣り合っていません。\n\n${places}\n\nこのまま保存しますか？（拍は0から表示）`)) return;
        }
        const song = { id, name: validated.name, bpm: validated.bpm, keySignature: validated.keySignature, source: chartToSource(validated), meter: validated.meter };
        const updatedSongs = makerSongs.filter((item) => item.id !== id);
        updatedSongs.push(song);
        if (!persistMakerSongs(updatedSongs)) return;
        trackUsage('song_saved', {notes: validated.steps.length, bpm: validated.bpm});
        makerSongs = updatedSongs;
        charts[id] = { bpm: validated.bpm, steps: validated.steps, directLanes: true, keySignature: validated.keySignature, meter: validated.meter };
        songNames[id] = validated.name;
        refreshSongOptions(id);
        loadSelectedSongIntoEditor();
        showCreatorStatus(`「${validated.name}」をこのブラウザーに保存しました。共有リンクでほかの端末にも渡せます。`);
      }

      async function removeSelectedCreatorSong() {
        const id = songSelect.value;
        if (!id.startsWith("user-")) return;
        if (!window.confirm(`「${songNames[id]}」を削除しますか？`)) return;
        const updatedSongs = makerSongs.filter((song) => song.id !== id);
        if (!persistMakerSongs(updatedSongs)) return;
        makerSongs = updatedSongs;
        delete charts[id];
        delete songNames[id];
        refreshSongOptions("twinkle");
        loadSelectedSongIntoEditor();
        showCreatorStatus("このブラウザーから曲を削除しました。");
      }

      songLibrary = window.OtoiroSongLibrary?.mount({
        select: songSelect,
        getSongs: () => Object.entries(songNames).map(([id, name]) => ({ id, name: name.replace(/ — やさしい$/, ""), chart: charts[id] }))
      });
      restoreMakerSongs();
      loadSelectedSongIntoEditor();
      const initialProjectRestore = restoreProjectSongs();
      function loadSettings() {
        try {
          const stored = JSON.parse(localStorage.getItem(settingsStorageKey) || "{}");
          const validNumber = (value, min, max, fallback) => Number.isFinite(value) && value >= min && value <= max ? value : fallback;
          return {
            volume: validNumber(stored.volume, 0, 100, settingsDefaults.volume),
            noteSpeed: validNumber(stored.noteSpeed, 50, 150, settingsDefaults.noteSpeed),
            practiceTempo: validNumber(stored.practiceTempo, 50, 150, settingsDefaults.practiceTempo),
            practiceMode: typeof stored.practiceMode === "boolean" ? stored.practiceMode : settingsDefaults.practiceMode,
            keyColorPreset: Object.prototype.hasOwnProperty.call(keyColorPresetHints, stored.keyColorPreset) ? stored.keyColorPreset : settingsDefaults.keyColorPreset
          };
        } catch (error) {
          console.warn("設定を読み込めませんでした。初期設定を使用します。", error);
          return { ...settingsDefaults };
        }
      }

      function saveSettings() {
        try {
          localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
        } catch (error) {
          console.warn("設定を保存できませんでした。", error);
        }
      }

      function syncSettingsUI() {
        for (const name of Object.keys(settingInputs)) {
          settingInputs[name].value = String(settings[name]);
          settingOutputs[name].value = `${settings[name]}%`;
          settingOutputs[name].textContent = `${settings[name]}%`;
        }
        practiceModeInput.checked = settings.practiceMode;
        practiceTempoSetting.hidden = !settings.practiceMode;
        practiceStartControl.hidden = !settings.practiceMode;
      }

      syncSettingsUI();
      updateReadyBpm();
      for (const [name, input] of Object.entries(settingInputs)) {
        input.addEventListener("input", () => {
          settings[name] = Number(input.value);
          settingOutputs[name].value = `${settings[name]}%`;
          settingOutputs[name].textContent = `${settings[name]}%`;
          saveSettings();
          if (name === "practiceTempo") updateReadyBpm();
        });
      }
      practiceModeInput.addEventListener("change", () => {
        settings.practiceMode = practiceModeInput.checked;
        practiceTempoSetting.hidden = !settings.practiceMode;
        practiceStartControl.hidden = !settings.practiceMode;
        saveSettings();
        updateReadyBpm();
      });

      function updateReadyBpm() {
        const tempoScale = practiceModeInput.checked ? 100 / settings.practiceTempo : 1;
        document.getElementById("bpmValue").textContent = chart ? `BPM ${Math.round(chart.bpm / tempoScale)}` : '公開中の曲がありません';
      }

      notes.forEach((note, index) => {
        const label = document.createElement("div");
        label.className = "track-label";
        label.innerHTML = `<span>${note.name}<sub>${note.octave}</sub></span><em>${note.side === "center" ? "C" : note.side === "left" ? "L" : "R"}</em>`;
        document.getElementById("trackLabels").append(label);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "key";
        button.dataset.note = `${note.name}${note.octave}`;
        button.dataset.side = note.side;
        button.style.setProperty("--key-shortening", `${note.semitones * 0.38}px`);
        button.setAttribute("aria-label", `${note.name}${note.octave}を鳴らす${note.side === "left" ? "、左手側" : note.side === "right" ? "、右手側" : "、中央"} (${note.key.toUpperCase()}キー)`);
        button.innerHTML = `<span class="key-note">${note.name}${note.octave}</span><span class="key-shortcut">${note.key.toUpperCase()}</span>`;
        keyRow.append(button);
      });
      const keyButtons = [...keyRow.children];

      function getKeyMarkerColor(note, index, preset) {
        const red = "#cb4747", blue = "#3978c6";
        switch (preset) {
          case "alternating": return index % 2 === 0 ? red : blue;
          case "everyOther": return index % 2 === 0 ? red : null;
          case "cOnly": return note.name === "C" ? red : null;
          case "cAndF": return note.name === "C" ? red : note.name === "F" ? blue : null;
          case "hands": return note.side === "left" ? blue : note.side === "right" ? "#d58025" : "#318663";
          case "noteNames": return { C: red, D: "#d58025", E: "#b18b15", F: "#318663", G: blue, A: "#8057b3", B: "#bd5689" }[note.name];
          default: return null;
        }
      }

      function applyKeyColorPreset() {
        const preset = settings.keyColorPreset;
        document.getElementById("keyColorPreset").value = preset;
        document.getElementById("keyColorHelp").textContent = keyColorPresetHints[preset];
        const preview = document.getElementById("keyColorPreview");
        preview.replaceChildren();
        keyButtons.forEach((button, index) => {
          const note = notes[index];
          const color = getKeyMarkerColor(note, index, preset);
          button.classList.toggle("has-color-marker", Boolean(color));
          if (color) button.style.setProperty("--marker-color", color);
          else button.style.removeProperty("--marker-color");
          const sample = document.createElement("span");
          sample.innerHTML = `${note.name}<small>${note.octave}</small>`;
          sample.title = `${note.name}${note.octave}${color ? "：色マークあり" : "：色マークなし"}`;
          if (color) sample.style.setProperty("--marker-color", color);
          preview.append(sample);
        });
      }

      applyKeyColorPreset();
      document.getElementById("keyColorPreset").addEventListener("change", (event) => {
        if (!Object.prototype.hasOwnProperty.call(keyColorPresetHints, event.target.value)) return;
        settings.keyColorPreset = event.target.value;
        applyKeyColorPreset();
        saveSettings();
      });
      function loadFreeTuning() {
        const defaults = { mode: "signature", signature: "C", tonic: 0, offsets: Array(notes.length).fill(0) };
        try {
          const stored = JSON.parse(localStorage.getItem(freeTuningStorageKey) || "{}");
          return {
            mode: ["signature", "tonic", "custom"].includes(stored.mode) ? stored.mode : defaults.mode,
            signature: freeSignatures.some((entry) => entry.id === stored.signature) ? stored.signature : "C",
            tonic: Number.isInteger(stored.tonic) && stored.tonic >= -12 && stored.tonic <= 11 ? stored.tonic : 0,
            offsets: notes.map((_, index) => {
              const value = Array.isArray(stored.offsets) ? stored.offsets[index] : 0;
              return Number.isInteger(value) && value >= -12 && value <= 12 ? value : 0;
            })
          };
        } catch (error) {
          return defaults;
        }
      }

      function getSignatureNote(lane, signature = "C") {
        const base = notes[lane];
        const fifths = (freeSignatures.find((entry) => entry.id === signature) || freeSignatures[0]).fifths;
        const order = fifths >= 0 ? ["F", "C", "G", "D", "A", "E", "B"] : ["B", "E", "A", "D", "G", "C", "F"];
        const offset = order.slice(0, Math.abs(fifths)).includes(base.name) ? Math.sign(fifths) : 0;
        const accidental = offset > 0 ? "♯" : offset < 0 ? "♭" : "";
        const semitones = base.semitones + offset;
        return { ...base, accidental, semitones, displayName: `${base.name}${accidental}${base.octave}`, frequency: 261.625565 * 2 ** (semitones / 12) };
      }

      function getFreeNote(lane) {
        if (freeTuning.mode === "signature") return getSignatureNote(lane, freeTuning.signature);
        const base = notes[lane];
        const offset = freeTuning.mode === "tonic" ? freeTuning.tonic : freeTuning.offsets[lane];
        const midi = 60 + base.semitones + offset;
        const pitchName = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"][((midi % 12) + 12) % 12];
        const name = pitchName[0];
        const accidental = pitchName.slice(1);
        const octave = Math.floor(midi / 12) - 1;
        const semitones = base.semitones + offset;
        return { ...base, name, octave, accidental, semitones, displayName: `${name}${accidental}${octave}`, frequency: 261.625565 * 2 ** (semitones / 12) };
      }

      function updateKeyLabels() {
        keyButtons.forEach((button, lane) => {
          const base = notes[lane];
          const signature = isRecording ? creatorKeySignatureInput.value : state === "playing" || state === "paused" ? chart.keySignature : "C";
          const label = state === "free" ? getFreeNote(lane).displayName : getSignatureNote(lane, signature).displayName;
          button.querySelector(".key-note").textContent = label;
          button.classList.toggle("has-accidental", label.includes("♯") || label.includes("♭"));
          button.dataset.note = label;
          button.setAttribute("aria-label", `${label}を鳴らす、${base.side === "left" ? "左手側" : base.side === "right" ? "右手側" : "中央"} (${base.key.toUpperCase()}キー)`);
        });
        keyRow.setAttribute("aria-label", "17鍵カリンバ。各鍵盤に実際に鳴る音名を表示しています");
      }

      function renderFreeTuning() {
        document.getElementById("freeTuningMode").value = freeTuning.mode;
        document.getElementById("freeSignature").value = freeTuning.signature;
        document.getElementById("freeTonic").value = String(freeTuning.tonic);
        document.getElementById("freeSignatureControl").hidden = freeTuning.mode !== "signature";
        document.getElementById("freeTonicControl").hidden = freeTuning.mode !== "tonic";
        document.getElementById("freeCustomControl").hidden = freeTuning.mode !== "custom";
        document.getElementById("freeTuningHelp").textContent = {
          signature: "ドレミの配置を保ち、調号に該当する音だけを半音変えます。例：ト長調ではファがすべてファ♯になります。",
          tonic: "中央のC4を選んだ音へ移し、すべての鍵盤を同じ半音数だけ上下します。音の間隔はそのままです。",
          custom: "C調の元の音を基準に、各鍵盤を個別に調整します。音名は変更後の音です。"
        }[freeTuning.mode];
        const tuned = notes.map((_, lane) => getFreeNote(lane));
        const lowest = tuned.reduce((a, b) => a.semitones <= b.semitones ? a : b);
        document.getElementById("freeTuningSummary").textContent = `フリー演奏に適用：中央 ${tuned[8].displayName} ／ 最低音 ${lowest.displayName}`;
        document.querySelectorAll(".free-custom-key").forEach((card, lane) => {
          const base = notes[lane];
          const offset = freeTuning.offsets[lane];
          const midi = 60 + base.semitones + offset;
          const label = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"][((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
          card.querySelector("output").textContent = label;
          card.querySelector("[data-direction='-1']").disabled = offset <= -12;
          card.querySelector("[data-direction='1']").disabled = offset >= 12;
        });
        updateKeyLabels();
      }

      function changeFreeTuning() {
        clearPointerInteraction();
        renderFreeTuning();
        if (state === "free") document.getElementById("freePlayNote").textContent = "♪";
        try {
          localStorage.setItem(freeTuningStorageKey, JSON.stringify(freeTuning));
        } catch (error) {
          console.warn("フリー演奏の調整設定を保存できませんでした。", error);
        }
      }

      function initFreeTuning() {
        const signatures = document.getElementById("freeSignature");
        freeSignatures.forEach((entry) => {
          const option = document.createElement("option");
          option.value = entry.id;
          option.textContent = entry.label;
          signatures.append(option);
        });
        const tonicSelect = document.getElementById("freeTonic");
        for (let offset = -12; offset <= 11; offset++) {
          const option = document.createElement("option");
          const midi = 60 + offset;
          option.value = String(offset);
          option.textContent = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"][midi % 12] + (Math.floor(midi / 12) - 1);
          tonicSelect.append(option);
        }
        const customKeys = document.getElementById("freeCustomKeys");
        notes.forEach((note, lane) => {
          const card = document.createElement("div");
          card.className = "free-custom-key";
          const label = `${note.name}${note.octave}`;
          card.innerHTML = `<span>元の鍵盤：${label}</span><div><button type="button" data-lane="${lane}" data-direction="-1" aria-label="${label}を半音下げる">−</button><output></output><button type="button" data-lane="${lane}" data-direction="1" aria-label="${label}を半音上げる">＋</button></div>`;
          customKeys.append(card);
        });
        document.getElementById("freeTuningMode").addEventListener("change", (event) => {
          freeTuning.mode = event.target.value;
          changeFreeTuning();
        });
        signatures.addEventListener("change", (event) => {
          freeTuning.signature = event.target.value;
          changeFreeTuning();
        });
        tonicSelect.addEventListener("change", (event) => {
          freeTuning.tonic = Number(event.target.value);
          changeFreeTuning();
        });
        customKeys.addEventListener("click", (event) => {
          const button = event.target.closest("button[data-lane]");
          if (!button || button.disabled) return;
          const lane = Number(button.dataset.lane);
          freeTuning.offsets[lane] = Math.max(-12, Math.min(12, freeTuning.offsets[lane] + Number(button.dataset.direction)));
          changeFreeTuning();
          if (state === "free") playKey(lane);
        });
        document.getElementById("freeTuningReset").addEventListener("click", () => {
          freeTuning.mode = "signature";
          freeTuning.signature = "C";
          freeTuning.tonic = 0;
          freeTuning.offsets.fill(0);
          changeFreeTuning();
        });
        renderFreeTuning();
      }

      const activePointers = new Map();
      initFreeTuning();

      function playKey(index) {
        if (isRecording) recordKeyPress(index);
        else if (state === "free") {
          if (freeCountIn) return;
          if (freeReplayStartedAt !== null) return;
          playTone(index);
          keyButtons[index].classList.add("pressed");
          window.setTimeout(() => keyButtons[index].classList.remove("pressed"), 105);
          const createdAt = performance.now();
          if (freeRecordStartedAt !== null) freeRecording.push({ lane: index, time: createdAt - freeRecordStartedAt, note: { ...getFreeNote(index) } });
          effects.push({ lane: index, createdAt });
          freeNotes.push({ lane: index, createdAt });
          document.getElementById("freePlayNote").textContent = getFreeNote(index).displayName;
        }
        else if (state === "playing") hit(index);
        else playTone(index);
      }

      function updatePressedKey(index) {
        keyButtons[index].classList.toggle(
          "pressed",
          [...activePointers.values()].includes(index)
        );
      }

      function clearPointerInteraction() {
        activePointers.clear();
        keyButtons.forEach((button) => button.classList.remove("pressed"));
      }

      function movePointerToKey(pointerId, index) {
        if (!activePointers.has(pointerId)) return;
        const previousIndex = activePointers.get(pointerId);
        if (previousIndex === index) return;
        if (previousIndex >= 0) {
          activePointers.set(pointerId, index);
          updatePressedKey(previousIndex);
        }
        if (index < 0) {
          activePointers.set(pointerId, -1);
          return;
        }
        activePointers.set(pointerId, index);
        updatePressedKey(index);
        playKey(index);
      }

      keyRow.addEventListener("pointerdown", (event) => {
        const key = event.target instanceof Element ? event.target.closest(".key") : null;
        if (!key || activePointers.has(event.pointerId)) return;
        event.preventDefault();
        activePointers.set(event.pointerId, -1);
        keyRow.setPointerCapture(event.pointerId);
        movePointerToKey(event.pointerId, keyButtons.indexOf(key));
      });
      window.addEventListener("pointermove", (event) => {
        if (!activePointers.has(event.pointerId)) return;
        const target = document.elementFromPoint(event.clientX, event.clientY);
        const key = target instanceof Element ? target.closest(".key") : null;
        movePointerToKey(event.pointerId, key && keyRow.contains(key) ? keyButtons.indexOf(key) : -1);
      });
      window.addEventListener("pointerup", (event) => {
        const index = activePointers.get(event.pointerId);
        if (index === undefined) return;
        activePointers.delete(event.pointerId);
        if (index >= 0) updatePressedKey(index);
      });
      window.addEventListener("pointercancel", (event) => {
        const index = activePointers.get(event.pointerId);
        if (index === undefined) return;
        activePointers.delete(event.pointerId);
        if (index >= 0) updatePressedKey(index);
      });
      keyRow.addEventListener("lostpointercapture", (event) => {
        const index = activePointers.get(event.pointerId);
        activePointers.delete(event.pointerId);
        if (index >= 0) updatePressedKey(index);
      });
      window.addEventListener("blur", clearPointerInteraction);

      function resizeCanvas() {
        const rect = playfield.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(rect.width * ratio);
        canvas.height = Math.round(rect.height * ratio);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        if (app.classList.contains("is-playing")) {
          const fieldTop = rect.top;
          const keyboardTop = keyRow.getBoundingClientRect().top;
          hitLine = Math.max(40, Math.min(rect.height - 12, keyboardTop - fieldTop - 7));
        } else {
          hitLine = rect.height - Math.min(46, Math.max(34, rect.height * .11));
        }
        draw(performance.now());
      }

      function getGeometry() {
        const width = playfield.clientWidth;
        const vanishingPoint = width / 2;
        const fieldRect = playfield.getBoundingClientRect();
        const keyRects = keyButtons.map((button) => button.getBoundingClientRect());
        const nearCenters = keyRects.map((rect) => rect.left - fieldRect.left + rect.width / 2);
        const farCenters = nearCenters.map((x) => vanishingPoint + (x - vanishingPoint) * .22);
        const depthCenters = (centers, index) => {
          const before = index === 0 ? centers[0] - (centers[1] - centers[0]) / 2 : (centers[index - 1] + centers[index]) / 2;
          const after = index === laneCount - 1 ? centers[index] + (centers[index] - centers[index - 1]) / 2 : (centers[index] + centers[index + 1]) / 2;
          return { left: before, right: after };
        };
        return {
          width,
          lanePoint: (index, depth) => ({
            x: farCenters[index] + (nearCenters[index] - farCenters[index]) * depth,
            y: 24 + (hitLine - 24) * depth
          }),
          laneBounds: (index, depth) => {
            const near = depthCenters(nearCenters, index);
            const far = depthCenters(farCenters, index);
            return {
              left: near.left + (far.left - near.left) * depth,
              right: near.right + (far.right - near.right) * depth
            };
          }
        };
      }


      function draw(now) {
        const width = playfield.clientWidth;
        const height = playfield.clientHeight;
        if (!width || !height) return;
        const renderTime = state === "paused" ? pausedAt : practiceHoldAt ?? now;
        ctx.clearRect(0, 0, width, height);
        const geometry = getGeometry();
        if (isRecording && Number.isFinite(recordingStartedAt)) {
          const elapsed = (now - recordingStartedAt) / 1000;
          while (recordingGuideCursor < recordingGuide.length && recordingGuide[recordingGuideCursor].time <= elapsed) {
            playTone(recordingGuide[recordingGuideCursor++].lane, creatorKeySignatureInput.value);
          }
          ctx.save();
          ctx.globalAlpha = .3;
          for (const note of recordingGuide) {
            const remaining = note.time - elapsed;
            if (remaining < 0 || remaining > travelTime) continue;
            const depth = 1 - remaining / travelTime;
            const { x, y } = geometry.lanePoint(note.lane, depth);
            const bounds = geometry.laneBounds(note.lane, 1 - depth);
            const radius = Math.max(3, (bounds.right - bounds.left) * .44);
            ctx.beginPath();
            ctx.ellipse(x, y, radius, radius * .48, 0, 0, Math.PI * 2);
            ctx.fillStyle = notes[note.lane].color;
            ctx.fill();
          }
          ctx.restore();
        }

        for (let i = 0; i < laneCount; i++) {
          const bottom = geometry.laneBounds(i, 0);
          const top = geometry.laneBounds(i, 1);
          ctx.beginPath();
          ctx.moveTo(top.left, 24);
          ctx.lineTo(top.right, 24);
          ctx.lineTo(bottom.right, hitLine);
          ctx.lineTo(bottom.left, hitLine);
          ctx.closePath();
          ctx.fillStyle = i % 2 ? "rgba(231,194,143,.018)" : "rgba(231,194,143,.032)";
          ctx.fill();
          ctx.strokeStyle = "rgba(231,194,143,.11)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(top.right, 24);
          ctx.lineTo(bottom.right, hitLine);
          ctx.stroke();
        }

        if (state !== "free") {
          const elapsed = (renderTime - startedAt) / 1000;
          ctx.save();
          for (const line of activeTimingLines) {
            if (elapsed < line.time - runTravelTime || elapsed > line.time + .08) continue;
            const depth = Math.min(1, Math.max(0, (elapsed - (line.time - runTravelTime)) / runTravelTime));
            const left = geometry.laneBounds(0, 1 - depth).left;
            const right = geometry.laneBounds(laneCount - 1, 1 - depth).right;
            const y = geometry.lanePoint(0, depth).y;
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.strokeStyle = line.isBar
              ? `rgba(255, 239, 210, ${.1 + depth * .12})`
              : `rgba(255, 239, 210, ${.025 + depth * .045})`;
            ctx.lineWidth = line.isBar ? 1 + depth * .6 : .6 + depth * .25;
            ctx.stroke();
          }
          ctx.restore();
          const pulse = state === "playing" ? (Math.sin(now / 170) + 1) * .5 : .22;
          const leftEdge = geometry.laneBounds(0, 0).left;
          const rightEdge = geometry.laneBounds(laneCount - 1, 0).right;
          const lineGradient = ctx.createLinearGradient(leftEdge, 0, rightEdge, 0);
          lineGradient.addColorStop(0, `rgba(233,185,111,${.34 + pulse * .42})`);
          lineGradient.addColorStop(.5, `rgba(233,185,111,${.34 + pulse * .42})`);
          lineGradient.addColorStop(1, `rgba(233,185,111,${.34 + pulse * .42})`);
          ctx.shadowBlur = 13 + pulse * 8;
          ctx.shadowColor = "rgba(233,185,111,.85)";
          ctx.fillStyle = lineGradient;
          ctx.beginPath();
          ctx.moveTo(geometry.laneBounds(0, 1).left, hitLine);
          ctx.lineTo(geometry.laneBounds(laneCount - 1, 1).right, hitLine);
          ctx.lineTo(rightEdge, hitLine + 4);
          ctx.lineTo(leftEdge, hitLine + 4);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;

          drawSlideConnections(geometry, (renderTime - startedAt) / 1000);
          for (const note of activeNotes) {
            if (!note.spawned || note.hit || note.missed) continue;
            const elapsed = (renderTime - startedAt) / 1000;
            const approach = Math.min(1, Math.max(0, (elapsed - (note.time - runTravelTime)) / runTravelTime));
            const depth = approach;
            const { x, y } = geometry.lanePoint(note.lane, depth);
            const laneBounds = geometry.laneBounds(note.lane, 1 - depth);
            const radiusX = Math.max(3, (laneBounds.right - laneBounds.left) * .44);
            const radiusY = radiusX * .48;
            const color = notes[note.lane].color;
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 4 + 12 * depth;
            ctx.beginPath();
            ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();
          }
        }

        if (state === "free") {
          const lifetime = travelTime * 1000;
          const replayElapsed = freeReplayStartedAt === null ? null : now - freeReplayStartedAt;
          const visibleNotes = replayElapsed === null ? freeNotes : freeRecording.slice(freeReplayCursor).filter((event) => event.time - replayElapsed <= lifetime).map((event) => ({ lane: event.lane, createdAt: freeReplayStartedAt + event.time - lifetime, descending: true }));
          freeNotes = freeNotes.filter((note) => now - note.createdAt < lifetime);
          for (const note of visibleNotes) {
            const progress = Math.max(0, Math.min(1, (now - note.createdAt) / lifetime));
            const depth = note.descending ? progress : 1 - progress;
            const { x, y } = geometry.lanePoint(note.lane, depth);
            const bounds = geometry.laneBounds(note.lane, 1 - depth);
            const radiusX = Math.max(3, (bounds.right - bounds.left) * .46);
            ctx.save();
            ctx.globalAlpha = note.descending ? 1 : 1 - progress ** 3;
            ctx.fillStyle = notes[note.lane].color;
            ctx.shadowColor = notes[note.lane].color;
            ctx.shadowBlur = 12 * (1 - progress);
            ctx.beginPath();
            ctx.ellipse(x, y, radiusX, radiusX * .48, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        // Effects use real animation time, not the frozen practice timeline.
        // A touch during a hold is newer than renderTime; subtracting that
        // timestamp could otherwise give arc() a negative radius and stop draw().
        effects = effects.filter((effect) => now - effect.createdAt < 420);
        for (const effect of effects) {
          const progress = Math.max(0, Math.min(1, (now - effect.createdAt) / 420));
          const alpha = 1 - progress;
          const { x, y } = geometry.lanePoint(effect.lane, 1);
          ctx.beginPath();
          ctx.arc(x, y, 8 + progress * 25, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(233,185,111,${alpha * .72})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      function frame(now) {
        // Keep the animation loop scheduled even if a drawing operation fails.
        requestAnimationFrame(frame);
        if (state === "playing") update();
        if (state === "free") updateFreeReplay(now);
        draw(now);
      }

      function update() {
        let elapsed = ((practiceHoldAt ?? performance.now()) - startedAt) / 1000;
        while (preparationClickIndex < preparationClicks.length && preparationClicks[preparationClickIndex] <= elapsed) {
          const clickTime = preparationClicks[preparationClickIndex++];
          // Skip stale clicks after a delayed frame rather than playing a burst.
          if (elapsed - clickTime < .15) playMetronome(false);
        }
        const nextPracticeNotes = practiceMode
          ? activeNotes.filter((note) => !note.hit && !note.missed && note.time <= elapsed)
          : [];
        const nextPracticeNote = nextPracticeNotes[0] ?? null;
        if (nextPracticeNote && !practiceNote) {
          practiceNote = nextPracticeNote;
          practiceHoldAt = startedAt + practiceNote.time * 1000;
          elapsed = practiceNote.time;
          showToast("この音を弾こう", "good");
          setNextNote();
        }
        for (const note of activeNotes) {
          if (!note.spawned && elapsed >= note.time - runTravelTime) note.spawned = true;
          if (!practiceMode && !note.hit && !note.missed && elapsed > note.time + .18) {
            note.missed = true;
            missCount++;
            judged++;
            combo = 0;
            updateStats();
            showToast("MISS", "miss");
            setNextNote();
          }
        }
        const lastNote = activeNotes[activeNotes.length - 1];
        if (lastNote && !practiceNote && elapsed > lastNote.time + 2.8) finishGame();
      }

      function handlePageVisibilityChange() {
        if (document.hidden) {
          clearPointerInteraction();
          pauseGame();
          stopRecording();
          return;
        }
        if (state === "playing") {
          const now = performance.now();
          // Mobile browsers throttle animation frames while backgrounded.
          // Freeze gameplay time across that gap, including a practice hold.
          startedAt += now - pausedAt;
          if (practiceHoldAt !== null) practiceHoldAt += now - pausedAt;
          pausedAt = 0;
          if (audioContext?.state === "suspended") audioContext.resume().catch(() => {});
          resizeCanvas();
          update();
        }
      }

      function hit(lane) {
        if (state !== "playing") return;
        // Touch events can arrive before the next animation frame on a busy phone.
        // Establish the wait before judging input, even when the note is overdue.
        if (practiceMode) update();
        const elapsed = ((practiceHoldAt ?? performance.now()) - startedAt) / 1000;
        const practiceChord = practiceMode ? getNextChord() : [];
        const candidate = activeNotes
          .filter((note) => note.lane === lane && !note.hit && !note.missed)
          .map((note) => ({ note, difference: Math.abs(note.time - elapsed) }))
          .filter(({ note, difference }) => practiceMode
            ? practiceChord.includes(note) && difference <= goodWindow
            : difference <= goodWindow)
          .sort((a, b) => a.note.time - b.note.time)[0];
        playTone(lane);
        keyButtons[lane].classList.add("pressed");
        window.setTimeout(() => keyButtons[lane].classList.remove("pressed"), 105);
        if (!candidate) {
          const firstTime = activeNotes[0]?.time;
          const lastTime = activeNotes[activeNotes.length - 1]?.time;
          if (elapsed >= firstTime - goodWindow && elapsed <= lastTime + goodWindow) {
            extraCount++;
            combo = 0;
            score = calculateScore();
            updateStats();
            showToast("余計な音", "miss");
          }
          return;
        }

        const { note, difference } = candidate;
        const wasWaiting = practiceMode;
        note.hit = true;
        if (practiceMode && practiceHoldAt !== null) {
          const next = practiceChord.find((pending) => !pending.hit && !pending.missed && pending.time <= elapsed);
          if (next) {
            practiceNote = next;
          } else {
            startedAt += performance.now() - practiceHoldAt;
            practiceHoldAt = null;
            practiceNote = null;
          }
        }
        judged++;
        combo++;
        bestCombo = Math.max(bestCombo, combo);
        const isPerfect = !wasWaiting && difference <= .085;
        if (isPerfect) perfectCount++;
        else goodCount++;
        accuracyPoints += isPerfect ? 100 : 60;
        score = calculateScore();
        effects.push({ lane, createdAt: performance.now() });
        updateStats();
        showToast(isPerfect ? "PERFECT" : "GOOD", isPerfect ? "" : "good");
        setNextNote();
      }

      function getKalimbaAudio() {
        if (!audioContext || audioContext.state === "closed") {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (kalimbaAudio?.context === audioContext) return kalimbaAudio;
        const input = audioContext.createGain();
        const dry = audioContext.createGain();
        const wet = audioContext.createGain();
        const reverb = audioContext.createConvolver();
        const warmth = audioContext.createBiquadFilter();
        const limiter = audioContext.createDynamicsCompressor();
        dry.gain.value = .95;
        wet.gain.value = .18;
        warmth.type = "lowpass";
        warmth.frequency.value = 4200;
        warmth.Q.value = .5;
        limiter.threshold.value = -14;
        limiter.knee.value = 18;
        limiter.ratio.value = 4;
        limiter.attack.value = .006;
        limiter.release.value = .2;

        // Build the resonant tail once, rather than one reverb per played note.
        const rate = audioContext.sampleRate;
        const impulse = audioContext.createBuffer(2, Math.ceil(rate * 1.6), rate);
        for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
          const data = impulse.getChannelData(channel);
          let smooth = 0;
          for (let i = 0; i < data.length; i++) {
            smooth = smooth * .6 + (Math.random() * 2 - 1) * .4;
            const time = i / rate;
            data[i] = smooth * Math.exp(-time * 4.5) * Math.min(1, time / .012);
          }
        }
        reverb.buffer = impulse;
        input.connect(dry).connect(limiter);
        input.connect(reverb).connect(warmth).connect(wet).connect(limiter);
        limiter.connect(audioContext.destination);

        // A brief, quiet pluck gives the soft onset a little definition.
        const pluck = audioContext.createBuffer(1, Math.ceil(rate * .016), rate);
        const pluckData = pluck.getChannelData(0);
        for (let i = 0; i < pluckData.length; i++) {
          pluckData[i] = (Math.random() * 2 - 1) * Math.exp(-i / rate * 380);
        }
        kalimbaAudio = { context: audioContext, input, pluck };
        return kalimbaAudio;
      }

      function playTone(lane, signature, recordedNote) {
        try {
          if (!audioContext || audioContext.state === "closed") audioContext = new (window.AudioContext || window.webkitAudioContext)();
          if (audioContext.state !== "running") audioContext.resume().catch((error) => console.warn("音声の再開に失敗しました。", error));
          const voice = getKalimbaAudio();
          const now = audioContext.currentTime;
          const note = recordedNote || (signature !== undefined ? getSignatureNote(lane, signature)
            : state === "free" ? getFreeNote(lane)
            : getSignatureNote(lane, isRecording ? creatorKeySignatureInput.value : state === "playing" ? chart.keySignature : "C"));
          const decay = Math.max(1.4, Math.min(4, 3.1 - note.semitones / 28 * .9));
          const master = audioContext.createGain();
          master.gain.value = .32 * settings.volume / 100;
          master.connect(voice.input);
          const partials = [
            { ratio: 1, peak: .22, duration: decay },
            { ratio: 2.76, peak: .055, duration: .65 },
            { ratio: 5.4, peak: .022, duration: .24 },
            { ratio: 8.93, peak: .009, duration: .10 }
          ];
          let remaining = 0;
          for (const partial of partials) {
            const frequency = note.frequency * partial.ratio;
            if (frequency >= audioContext.sampleRate * .45) continue;
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.type = "sine";
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(.0001, now);
            gain.gain.exponentialRampToValueAtTime(partial.peak, now + .003);
            gain.gain.exponentialRampToValueAtTime(partial.peak * .5, now + partial.duration * .12);
            gain.gain.exponentialRampToValueAtTime(.0001, now + partial.duration);
            oscillator.connect(gain).connect(master);
            remaining++;
            oscillator.onended = () => {
              oscillator.disconnect();
              gain.disconnect();
              if (--remaining === 0) master.disconnect();
            };
            oscillator.start(now);
            oscillator.stop(now + partial.duration + .02);
          }
          const pluck = audioContext.createBufferSource();
          const pluckGain = audioContext.createGain();
          pluck.buffer = voice.pluck;
          pluckGain.gain.value = .035;
          pluck.connect(pluckGain).connect(master);
          pluck.onended = () => { pluck.disconnect(); pluckGain.disconnect(); };
          pluck.start(now);
        } catch (error) {
          console.warn("音声を再生できませんでした。ブラウザーの音声設定をご確認ください。", error);
        }
      }

      function updateStats() {
        document.getElementById("hudCombo").textContent = String(combo);
      }

      function getNextChord() {
        const next = activeNotes.find((note) => !note.hit && !note.missed);
        // Arpeggio offsets change playback time, but the original beat still
        // identifies the chord whose remaining keys should light together.
        return next
          ? activeNotes.filter((note) => note.step === next.step && !note.hit && !note.missed)
            .sort((a, b) => notes[a.lane].semitones - notes[b.lane].semitones)
          : [];
      }

      function setNextNote() {
        if (isTutorial) {
          const next = activeNotes.find(note => !note.hit && !note.missed);
          document.getElementById("tutorialGuide").textContent = !next
            ? "演奏できました！ チュートリアルはまもなく終了します。"
            : next.step < 12 ? "1 / 3　音符がラインに来たら、光る鍵盤を押しましょう。"
            : next.step < 24 ? "2 / 3　和音は左右の手にかかわらず、低い音から順番に弾きます。"
            : "3 / 3　光る鍵盤だけを押しましょう。余計な音は減点になります。";
        }
        const lanes = new Set(getNextChord().map((note) => note.lane));
        keyButtons.forEach((button, index) => button.classList.toggle("next", lanes.has(index)));
      }

      function showToast(message, kind) {
        toastAnimation?.cancel();
        toast.textContent = message;
        toast.className = `toast show ${kind}`;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        toastAnimation = toast.animate(reducedMotion ? [
          { opacity: 1, offset: 0 },
          { opacity: 1, offset: .5 },
          { opacity: 0, offset: 1 }
        ] : [
          { opacity: 0, transform: "translate(-50%, calc(-50% + 3px)) scale(.82)", offset: 0 },
          { opacity: 1, transform: "translate(-50%, calc(-50% - 1px)) scale(1.08)", offset: .18 },
          { opacity: 1, transform: "translate(-50%, calc(-50% - 3px)) scale(1)", offset: .45 },
          { opacity: 0, transform: "translate(-50%, calc(-50% - 8px)) scale(.97)", offset: 1 }
        ], { duration: reducedMotion ? 400 : 620, easing: "ease-out" });
        toastAnimation.onfinish = () => {
          toast.classList.remove("show");
          toastAnimation = null;
        };
      }

      function getStartBeat(input, selectedChart) {
        input.setCustomValidity("");
        const startBeat = input.valueAsNumber;
        if (!Number.isFinite(startBeat) || startBeat < 0 || startBeat > 10000 || input.validity.stepMismatch) {
          input.reportValidity();
          return null;
        }
        if (!selectedChart.steps.some(([step]) => step >= startBeat * 2)) {
          input.setCustomValidity("開始拍以降に音がありません。開始拍を小さくしてください。");
          input.reportValidity();
          return null;
        }
        return startBeat;
      }

      function drawSlideConnections(geometry, elapsed) {
        ctx.save();
        ctx.lineCap = "round";
        for (const note of activeNotes) {
          for (const next of note.slideTargets || []) {
            if (!note.spawned || !next.spawned || note.missed || next.missed || (note.hit && next.hit)) continue;
            const depth = value => value.hit ? 1 : Math.min(1, Math.max(0, (elapsed - (value.time - runTravelTime)) / runTravelTime));
            const fromDepth = depth(note), toDepth = depth(next);
            const from = geometry.lanePoint(note.lane, fromDepth), to = geometry.lanePoint(next.lane, toDepth);
            ctx.strokeStyle = "rgba(255, 224, 166, .82)";
            ctx.lineWidth = 2 + Math.min(fromDepth, toDepth) * 2;
            ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
          }
        }
        ctx.restore();
      }

      function createActiveNotes(selectedChart, startBeat) {
        const startStep = startBeat * 2;
        const selectedSteps = selectedChart.steps.filter(([step]) => step >= startStep);
        const { events } = getArpeggiatedEvents(selectedSteps, selectedChart.directLanes, selectedChart.bpm);
        const result = events.map(({ step, lane, offset, handSide, handIndex }) => ({
            step,
            handSide,
            handIndex,
            time: runStartDelay + ((step - startStep) * (60 / selectedChart.bpm / 2) + offset) * runTempoScale,
            lane,
            spawned: false,
            hit: false,
            missed: false
          })).sort((a, b) => a.time - b.time || notes[a.lane].semitones - notes[b.lane].semitones);
        const hands = new Map(), beats = new Map();
        for (const note of result) {
          const key = `${note.step}:${note.handSide}`;
          if (!hands.has(key)) hands.set(key, []);
          hands.get(key).push(note);
          if (!beats.has(note.step)) beats.set(note.step, []);
          beats.get(note.step).push(note);
        }
        for (const hand of hands.values()) {
          hand.sort((a, b) => a.handIndex - b.handIndex);
          for (let i = 1; i < hand.length; i++) {
            const previous = hand[i - 1], current = hand[i];
            if (Math.abs(previous.lane - current.lane) === 1) previous.slideTargets = [current];
          }
        }
        for (const beat of beats.values()) {
          const center = beat.find(note => notes[note.lane].side === "center");
          if (!center) continue;
          center.slideTargets ||= [];
          for (const neighbor of beat) {
            if (Math.abs(center.lane - neighbor.lane) === 1 && !center.slideTargets.includes(neighbor)) center.slideTargets.push(neighbor);
          }
        }
        return result;
      }

      function createActiveTimingLines(selectedChart, startBeat) {
        const meter = Number(selectedChart.meter);
        const beatsPerBar = meter === 6 ? 3 : [2, 3, 4, 5].includes(meter) ? meter : null;
        const lastStep = Math.max(...selectedChart.steps.filter(([step]) => step >= startBeat * 2).map(([step]) => step));
        if (!Number.isFinite(lastStep)) return [];
        const lastBeat = lastStep / 2;
        const lines = [];
        for (let beat = Math.ceil(startBeat); beat <= lastBeat; beat++) {
          lines.push({
            beat,
            isBar: Boolean(beatsPerBar && beat % beatsPerBar === 0),
            time: runStartDelay + (beat - startBeat) * (60 / selectedChart.bpm) * runTempoScale
          });
        }
        return lines;
      }

      const portraitQuery = window.matchMedia("(orientation: portrait)");
      const orientationDialog = document.getElementById("orientationDialog");
      const orientationContinue = document.getElementById("orientationContinue");
      let pendingOrientationAction = null;
      function isTouchPortrait() {
        return portraitQuery.matches && (navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches);
      }
      function updateOrientationPrompt() {
        const portrait = isTouchPortrait();
        document.getElementById("orientationTitle").textContent = portrait ? "横向きでの演奏がおすすめです" : "演奏を始められます";
        document.getElementById("orientationCopy").textContent = portrait
          ? "17個の鍵盤を押しやすくするため、スマホを横向きにしてください。縦向きのままでも演奏できます。"
          : "横向きになりました。ボタンを押して演奏を続けてください。";
        orientationContinue.textContent = portrait ? "このまま続ける" : "演奏を開始・再開";
      }
      function requestOrientation(action) {
        if (!isTouchPortrait()) return false;
        pendingOrientationAction = action;
        updateOrientationPrompt();
        if (!orientationDialog.open) orientationDialog.showModal();
        return true;
      }
      orientationContinue.addEventListener("click", () => {
        const action = pendingOrientationAction;
        pendingOrientationAction = null;
        orientationDialog.close();
        action?.();
      });
      document.getElementById("orientationCancel").addEventListener("click", () => {
        pendingOrientationAction = null;
        orientationDialog.close();
      });
      orientationDialog.addEventListener("cancel", () => { pendingOrientationAction = null; });
      const handleOrientationChange = () => {
        if (isTouchPortrait() && state === "playing") {
          pauseGame();
          requestOrientation(() => startGame(true));
        }
        if (orientationDialog.open) updateOrientationPrompt();
      };
      portraitQuery.addEventListener("change", handleOrientationChange);

      const recordingReadyDialog = document.getElementById("recordingReadyDialog");
      let pendingRecordingStart = null;
      function showRecordingReady(action, bpm) {
        pendingRecordingStart = action;
        document.getElementById("recordingReadyCopy").textContent = `横画面にすると鍵盤を押しやすくなります。準備ができたら「録音開始」を押してください。BPM ${bpm}で4・3・2・1と鳴った後に録音が始まります。縦画面のままでも続けられます。`;
        recordingReadyDialog.showModal();
      }
      document.getElementById("confirmRecordingButton").addEventListener("click", () => {
        const action = pendingRecordingStart;
        pendingRecordingStart = null;
        recordingReadyDialog.close();
        action?.();
      });
      document.getElementById("cancelRecordingReadyButton").addEventListener("click", () => {
        pendingRecordingStart = null;
        recordingReadyDialog.close();
      });
      recordingReadyDialog.addEventListener("cancel", () => { pendingRecordingStart = null; });

      function beginFreeRecording(prepared = false) {
        if (state !== "free" || freeReplayStartedAt !== null) return;
        const bpm = Number(freeMetronomeBpm.value);
        if (!Number.isInteger(bpm) || bpm < 30 || bpm > 240) {
          freeMetronomeBpm.reportValidity(); return;
        }
        if (prepared !== true) { showRecordingReady(() => beginFreeRecording(true), bpm); return; }
        stopFreeTransport();
        prepareRecordingAudio();
        window.clearTimeout(freeMetronomeTimer);
        freeCountIn = true;
        app.classList.add("is-counting");
        freeRecording = [];
        document.getElementById("recordingCountdown").hidden = false;
        document.getElementById("recordingCountdown").textContent = "4";
        const beatDuration = 60000 / bpm;
        const tick = (index, deadline) => {
          freeCountInTimer = window.setTimeout(() => {
            if (!freeCountIn || state !== "free") return;
            if (index < 4) {
              playMetronome(false);
              refreshFreeRecordingControls(`録音開始まで ${4 - index}`);
              document.getElementById("recordingCountdown").textContent = String(4 - index);
              tick(index + 1, deadline + beatDuration);
            } else {
              freeCountIn = false;
              app.classList.remove("is-counting");
              document.getElementById("recordingCountdown").hidden = true;
              freeRecordStartedAt = performance.now();
              refreshFreeRecordingControls("録音中 · 終わったら「録音を停止」を押してください");
              if (freeMetronomeOn) scheduleFreeMetronome();
            }
          }, Math.max(0, deadline - performance.now()));
        };
        refreshFreeRecordingControls("録音の準備中");
        tick(0, performance.now() + 60);
      }

      function startFreePlay(orientationAccepted = false) {
        if (isRecording || (state !== "ready" && state !== "finished")) return;
        if (orientationAccepted !== true && requestOrientation(() => startFreePlay(true))) return;
        document.getElementById("resultPanel").hidden = true;
        stopPreview();
        cancelSheetGesture();
        clearPointerInteraction();
        activeNotes = [];
        activeTimingLines = [];
        freeNotes = [];
        effects = [];
        practiceHoldAt = null;
        practiceNote = null;
        practiceMode = false;
        isTestPlay = false;
        pausedAt = 0;
        state = "free";
        trackUsage('free_start');
        refreshFreeRecordingControls();
        updateKeyLabels();
        document.getElementById("freeTuningPanel").open = false;
        selectionControls.forEach((control) => { control.disabled = true; });
        keyButtons.forEach((button) => button.classList.remove("next"));
        document.getElementById("gameStatus").textContent = "フリー演奏";
        document.getElementById("freePlayNote").textContent = "♪";
        app.classList.add("is-playing", "is-free-play");
        overlay.classList.add("hidden");
        resizeCanvas();
        document.getElementById("exitFreePlayButton").focus();
      }

      const tutorialDialog = document.getElementById("tutorialDialog");
      document.getElementById("tutorialButton").addEventListener("click", () => {
        if (state !== "ready" && state !== "finished") return;
        document.getElementById("tutorialTitle").textContent = "チュートリアル";
        document.getElementById("tutorialCopy").textContent = "光る鍵盤を押して、8個の音符を演奏してみましょう。入力するまで音符が待つので、自分のペースで進められます。";
        document.getElementById("beginTutorialButton").textContent = "チュートリアルを始める";
        tutorialDialog.showModal();
      });
      document.getElementById("closeTutorialButton").addEventListener("click", () => tutorialDialog.close());
      document.getElementById("beginTutorialButton").addEventListener("click", () => {
        tutorialDialog.close();
        const begin = () => { isTutorial = true; startGame(true); };
        if (!requestOrientation(begin)) begin();
      });

      function startGame(orientationAccepted = false) {
        if (state === "free" || isRecording || !songSelect.value) return;
        if (state === "playing") return;
        if (orientationAccepted !== true && requestOrientation(() => startGame(true))) return;
        if (state === "paused") {
          const now = performance.now();
          const pauseDuration = now - pausedAt;
          startedAt += pauseDuration;
          if (practiceHoldAt !== null) practiceHoldAt += pauseDuration;
          state = "playing";
          app.classList.add("is-playing");
          resizeCanvas();
          document.getElementById("gameStatus").textContent = isTutorial ? "チュートリアル" : isTestPlay ? "おためし演奏" : practiceMode ? "練習モード" : "演奏中";
          overlay.classList.add("hidden");
          return;
        }
        if (audioContext && audioContext.state === "suspended") audioContext.resume();
        chart = charts[document.getElementById("songSelect").value];
        if (isTutorial) chart = parseCreatorChart("チュートリアル", 80, "0,C4\n2,D4\n4,E4\n6,F4\n6,G4\n9,C4\n9,E4\n12,C4");
        practiceMode = isTutorial || practiceModeInput.checked;
        const startBeat = isTutorial ? 0 : practiceMode ? getStartBeat(practiceStartBeatInput, chart) : 0;
        if (startBeat === null) return;
        runTravelTime = travelTime * 100 / settings.noteSpeed;
        runTempoScale = isTutorial ? 1 : practiceMode ? 100 / settings.practiceTempo : 1;
        preparePlayCountIn(chart);
        activeNotes = createActiveNotes(chart, startBeat);
        activeTimingLines = createActiveTimingLines(chart, startBeat);
        beginUsageRun(isTutorial ? 'tutorial' : practiceMode ? 'practice' : 'normal');
        practiceHoldAt = null;
        practiceNote = null;
        selectionControls.forEach((control) => { control.disabled = true; });
        document.getElementById("bpmValue").textContent = `BPM ${Math.round(chart.bpm / runTempoScale)}`;
        effects = [];
        score = 0; combo = 0; bestCombo = 0; judged = 0; accuracyPoints = 0;
        perfectCount = 0; goodCount = 0; missCount = 0; extraCount = 0;
        document.getElementById("resultPanel").hidden = true;
        updateStats();
        startedAt = performance.now();
        state = "playing";
        app.classList.add("is-playing");
        updateKeyLabels();
        resizeCanvas();
        document.getElementById("gameStatus").textContent = isTutorial ? "チュートリアル" : practiceMode ? "練習モード" : "演奏中";
        document.getElementById("tutorialGuide").hidden = !isTutorial;
        document.getElementById("overlayTitle").textContent = "演奏モードを選択";
        document.getElementById("overlayCopy").innerHTML = "曲を選んで「曲を演奏」を押してください。<br>譜面なしで弾く場合は「フリー演奏」。";
        document.getElementById("startButton").textContent = "曲を演奏";
        overlay.classList.add("hidden");
        setNextNote();
      }

      function startTestPlay(orientationAccepted = false) {
        if (state !== "ready" && state !== "finished") return;
        if (orientationAccepted !== true && requestOrientation(() => startTestPlay(true))) return;
        let testChart;
        try {
          testChart = parseCreatorChart(creatorNameInput.value, creatorBpmInput.value, creatorChartInput.value, creatorKeySignatureInput.value, creatorMeterInput.value);
        } catch (error) {
          showCreatorStatus(error.message, true);
          return;
        }
        const startBeat = getStartBeat(testStartBeatInput, testChart);
        if (startBeat === null) return;
        stopPreview();
        chart = { bpm: testChart.bpm, steps: testChart.steps, directLanes: true, keySignature: testChart.keySignature, meter: testChart.meter };
        practiceMode = practiceModeInput.checked;
        runTravelTime = travelTime * 100 / settings.noteSpeed;
        runTempoScale = practiceMode ? 100 / settings.practiceTempo : 1;
        preparePlayCountIn(chart);
        practiceHoldAt = null;
        practiceNote = null;
        isTestPlay = true;
        selectionControls.forEach((control) => { control.disabled = true; });
        activeNotes = createActiveNotes(chart, startBeat);
        activeTimingLines = createActiveTimingLines(chart, startBeat);
        beginUsageRun('test');
        effects = [];
        score = 0; combo = 0; bestCombo = 0; judged = 0; accuracyPoints = 0;
        perfectCount = 0; goodCount = 0; missCount = 0; extraCount = 0;
        document.getElementById("resultPanel").hidden = true;
        updateStats();
        startedAt = performance.now();
        state = "playing";
        app.classList.add("is-playing");
        updateKeyLabels();
        resizeCanvas();
        document.getElementById("bpmValue").textContent = `BPM ${Math.round(chart.bpm / runTempoScale)}`;
        document.getElementById("gameStatus").textContent = "おためし演奏";
        document.getElementById("overlayTitle").textContent = "譜面をテスト中";
        document.getElementById("overlayCopy").textContent = "編集中の譜面を再生しています。";
        document.getElementById("startButton").textContent = "曲を演奏";
        overlay.classList.add("hidden");
        setNextNote();
        showCreatorStatus(`「${testChart.name}」をテストプレイ中です。`);
      }

      function returnFromTestPlay(message) {
        document.getElementById("freePlayButton").hidden = false;
        state = "ready";
        isTestPlay = false;
        activeNotes = [];
        effects = [];
        practiceHoldAt = null;
        practiceNote = null;
        pausedAt = 0;
        chart = charts[songSelect.value];
        updateKeyLabels();
        selectionControls.forEach((control) => { control.disabled = false; });
        clearPointerInteraction();
        app.classList.remove("is-playing");
        document.getElementById("gameStatus").textContent = "待機中";
        document.getElementById("overlayTitle").textContent = "テストプレイ終了";
        document.getElementById("overlayCopy").textContent = "譜面を編集して、もう一度テストできます。";
        document.getElementById("startButton").textContent = "曲を演奏";
        document.getElementById("stopButton").hidden = true;
        keyButtons.forEach((button) => button.classList.remove("next"));
        overlay.classList.remove("hidden");
        resizeCanvas();
        showCreatorStatus(message);
      }

      function pauseGame() {
        if (state !== "playing") return;
        trackUsage('game_pause', {mode: usageRun?.mode || 'normal'});
        document.getElementById("freePlayButton").hidden = true;
        clearPointerInteraction();
        pausedAt = performance.now();
        state = "paused";
        app.classList.remove("is-playing");
        resizeCanvas();
        document.getElementById("gameStatus").textContent = "一時停止";
        document.getElementById("overlayTitle").textContent = "一時停止中";
        document.getElementById("overlayCopy").textContent = isTestPlay
          ? "編集画面に戻るときは、テストを終了してください。"
          : "「演奏を再開」で続きから演奏できます。";
        document.getElementById("startButton").textContent = "演奏を再開";
        document.getElementById("stopButton").textContent = isTestPlay ? "テストを終了" : "演奏をやめる";
        document.getElementById("stopButton").hidden = false;
        overlay.classList.remove("hidden");
      }

      function stopGame() {
        if (state !== "paused" && state !== "free") return;
        if (state === 'free') trackUsage('free_exit');
        else endUsageRun('game_exit');
        if (isTutorial) {
          isTutorial = false;
          chart = charts[songSelect.value];
          practiceMode = practiceModeInput.checked;
          document.getElementById("tutorialGuide").hidden = true;
          updateReadyBpm();
        }
        if (state === "free") { stopFreeMetronome(); stopFreeTransport(); }
        if (isTestPlay) {
          returnFromTestPlay("テストプレイを終了しました。譜面は保存されていません。");
          return;
        }
        state = "ready";
        activeNotes = [];
        freeNotes = [];
        effects = [];
        practiceHoldAt = null;
        practiceNote = null;
        pausedAt = 0;
        selectionControls.forEach((control) => { control.disabled = false; });
        clearPointerInteraction();
        app.classList.remove("is-playing", "is-free-play");
        updateKeyLabels();
        document.getElementById("freePlayButton").hidden = false;
        document.getElementById("gameStatus").textContent = "待機中";
        document.getElementById("overlayTitle").textContent = "演奏モードを選択";
        document.getElementById("overlayCopy").innerHTML = "曲を選んで「曲を演奏」を押してください。<br>譜面なしで弾く場合は「フリー演奏」。";
        document.getElementById("startButton").textContent = "曲を演奏";
        document.getElementById("stopButton").hidden = true;
        keyButtons.forEach((button) => button.classList.remove("next"));
        overlay.classList.remove("hidden");
        resizeCanvas();
      }

      function finishGame() {
        endUsageRun('game_finish');
        document.getElementById("freePlayButton").hidden = false;
        if (isTutorial) {
          state = "paused";
          stopGame();
          document.getElementById("tutorialTitle").textContent = "チュートリアル完了！";
          document.getElementById("tutorialCopy").textContent = "8個の音符を演奏できました。通常プレイでは音符が待たずに流れます。自分のペースで弾きたいときは、練習モードを選んでください。";
          document.getElementById("beginTutorialButton").textContent = "もう一度練習する";
          tutorialDialog.showModal();
          return;
        }
        if (isTestPlay) {
          returnFromTestPlay("テストプレイが最後まで終わりました。譜面は保存されていません。");
          return;
        }
        state = "finished";
        practiceHoldAt = null;
        practiceNote = null;
        document.getElementById("stopButton").hidden = true;
        selectionControls.forEach((control) => { control.disabled = false; });
        app.classList.remove("is-playing");
        resizeCanvas();
        document.getElementById("gameStatus").textContent = "演奏のおわり";
        document.getElementById("overlayTitle").textContent = "演奏結果";
        document.getElementById("overlayCopy").innerHTML = "得点と判定別の回数は、上のリザルトで確認できます。";
        document.getElementById("startButton").textContent = "もう一度演奏する";
        overlay.classList.remove("hidden");
        keyButtons.forEach((button) => button.classList.remove("next"));
        const resultPanel = document.getElementById("resultPanel");
        document.getElementById("resultSong").textContent = document.getElementById("songSelect").selectedOptions[0]?.textContent || "";
        document.getElementById("resultScore").textContent = score.toLocaleString();
        document.getElementById("resultPerfect").textContent = perfectCount.toLocaleString();
        document.getElementById("resultGood").textContent = goodCount.toLocaleString();
        document.getElementById("resultMiss").textContent = missCount.toLocaleString();
        document.getElementById("resultExtra").textContent = extraCount.toLocaleString();
        document.getElementById("resultCombo").textContent = bestCombo.toLocaleString();
        document.getElementById("resultAccuracy").textContent = performanceAccuracy();
        document.dispatchEvent(new CustomEvent("otoiro:result", { detail: {
          song: document.getElementById("resultSong").textContent,
          score, perfect: perfectCount, good: goodCount, miss: missCount, extra: extraCount, combo: bestCombo,
          accuracy: performanceAccuracy(),
          mode: practiceMode ? "練習モード" : "通常プレイ",
          bpm: Math.round(chart.bpm / runTempoScale)
        } }));
        resultPanel.hidden = false;
        resultPanel.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: "instant" });
      }



      const prepareShareButton = document.getElementById("prepareShareButton");
      const sendShareButton = document.getElementById("sendShareButton");
      const downloadShareButton = document.getElementById("downloadShareButton");
      const shareStatus = document.getElementById("shareStatus");
      const shareLinkOutput = document.getElementById("shareLinkOutput");
      const shortenShareButton = document.getElementById('shortenShareButton');
      const restoreLongShareButton = document.getElementById('restoreLongShareButton');
      let originalShareLink = null;
      let preparedShareSong = null;
      function invalidateShareFile() {
        if (!preparedShareLink) return;
        preparedShareLink = null;
        originalShareLink = null;
        preparedShareSong = null;
        shortenShareButton.hidden = true;
        restoreLongShareButton.hidden = true;
        sendShareButton.hidden = true;
        downloadShareButton.hidden = true;
        shareLinkOutput.hidden = true;
        shareLinkOutput.value = "";
        shareStatus.textContent = "曲が変更されました。共有リンクを作り直してください。";
      }
      function songShareText(name, link) {
        return window.OtoiroSharing.withHashtags(`おといろで「${name}」を演奏してみませんか？\n${link}`);
      }
      prepareShareButton.addEventListener("click", async () => {
        if (!["ready", "finished"].includes(state)) return;
        invalidateShareFile();
        prepareShareButton.disabled = true;
        shareStatus.textContent = "共有リンクを作成しています…";
        const snapshot = [creatorNameInput.value, creatorBpmInput.value, creatorChartInput.value, creatorKeySignatureInput.value, creatorMeterInput.value].join("\n");
        try {
          const parsed = parseCreatorChart(creatorNameInput.value, creatorBpmInput.value, creatorChartInput.value, creatorKeySignatureInput.value, creatorMeterInput.value);
          const link = await window.OtoiroSharing.createLink(parsed);
          if (snapshot !== [creatorNameInput.value, creatorBpmInput.value, creatorChartInput.value, creatorKeySignatureInput.value, creatorMeterInput.value].join("\n")) throw new Error("曲が変更されました。共有リンクを作り直してください。");
          preparedShareLink = link;
          originalShareLink = link;
          trackUsage('share_created', {notes: parsed.steps.length});
          preparedShareSong = parsed;
          shortenShareButton.hidden = false;
          shareLinkOutput.value = songShareText(parsed.name, link);
          shareLinkOutput.hidden = false;
          downloadShareButton.hidden = false;
          sendShareButton.hidden = typeof navigator.share !== "function";
          shareStatus.textContent = "ハッシュタグ付きの共有文をコピーするか、共有先を選んで投稿してください。" + (link.length > 2000 ? " リンクが長めです。末尾まで含まれていることを確認してください。" : "");
        } catch (error) { shareStatus.textContent = error.message; }
        finally { prepareShareButton.disabled = false; }
      });
      shortenShareButton.addEventListener('click', async () => {
        if (!preparedShareSong || shortenShareButton.disabled) return;
        const song = preparedShareSong;
        shortenShareButton.disabled = true;
        shareStatus.textContent = '譜面を保存してURLを短縮しています…';
        try {
          const link = await window.OtoiroSharing.shorten(song);
          if (preparedShareSong !== song) return;
          preparedShareLink = link;
          shareLinkOutput.value = songShareText(song.name, link);
          trackUsage('share_shortened', {notes: song.steps.length});
          shortenShareButton.hidden = true;
          restoreLongShareButton.hidden = false;
          shareStatus.textContent = '短縮しました。容量整理で削除される場合があるため、長いURLも保管してください。';
        } catch(error) { trackUsage('share_failed'); if (preparedShareSong === song) shareStatus.textContent = error.message; }
        finally { shortenShareButton.disabled = false; }
      });
      restoreLongShareButton.addEventListener('click', () => {
        if (!originalShareLink || !preparedShareSong) return;
        preparedShareLink = originalShareLink;
        shareLinkOutput.value = songShareText(preparedShareSong.name, originalShareLink);
        restoreLongShareButton.hidden = true;
        shortenShareButton.hidden = false;
        shareStatus.textContent = 'サーバーに依存しない長いURLに戻しました。';
      });
      sendShareButton.addEventListener("click", async () => {
        if (!preparedShareLink) return;
        try { await navigator.share({ url: preparedShareLink, title: creatorNameInput.value, text: window.OtoiroSharing.withHashtags("おといろで「" + creatorNameInput.value + "」を演奏") }); trackUsage('share_sent'); }
        catch (error) { if (error.name !== "AbortError") shareStatus.textContent = "共有できませんでした。「共有文をコピー」からSNSに貼り付けてください。"; }
      });
      downloadShareButton.addEventListener("click", async () => {
        if (!preparedShareLink) return;
        try {
          if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(shareLinkOutput.value);
          else {
            shareLinkOutput.focus();
            shareLinkOutput.select();
            if (!document.execCommand("copy")) throw new Error("copy unavailable");
          }
          shareStatus.textContent = "ハッシュタグ付きの共有文をコピーしました。SNSやメッセージに貼り付けてください。";
          trackUsage('share_copied');
        } catch {
          shareLinkOutput.focus();
          shareLinkOutput.select();
          shareStatus.textContent = "共有文を選択しました。長押しなどでコピーしてください。";
        }
      });
      shareLinkOutput.addEventListener("click", () => shareLinkOutput.select());
      let sharedSongId = null;
      let sharedLinkSequence = 0;
      async function loadSharedSong() {
        if (!(location.hash.startsWith("#song=") || location.hash.startsWith("#s=")) || !["ready", "finished"].includes(state)) return;
        const sequence = ++sharedLinkSequence;
        const hash = location.hash;
        const panel = document.getElementById("sharedSongPanel");
        const status = document.getElementById("sharedSongStatus");
        const play = document.getElementById("playSharedSongButton");
        const save = document.getElementById("saveSharedSongButton");
        panel.hidden = false;
        play.hidden = true;
        save.hidden = true;
        status.textContent = "共有された曲を読み込んでいます…";
        try {
          const data = await window.OtoiroSharing.readLink(hash);
          if (sequence !== sharedLinkSequence || hash !== location.hash || !["ready", "finished"].includes(state)) return;
          if (!Array.isArray(data.steps) || data.steps.length < 1 || data.steps.length > 2000) throw new Error("invalid notes");
          const source = data.steps.map(item => {
            if (!Array.isArray(item) || item.length !== 2 || !Number.isFinite(item[0]) || item[0] < 0 || item[0] > 20000 || !Number.isInteger(item[1]) || item[1] < 0 || item[1] >= notes.length) throw new Error("invalid note");
            const note = notes[item[1]];
            return (item[0] / 2) + "," + note.name + note.octave;
          }).join("\n");
          const parsed = parseCreatorChart(data.name, data.bpm, source, data.keySignature, data.meter);
          trackUsage('shared_open', {source: hash.startsWith('#s=') ? 'short' : 'long', notes: parsed.steps.length});
          if (sharedSongId && !makerSongs.some(song => song.id === sharedSongId)) { delete charts[sharedSongId]; delete songNames[sharedSongId]; }
          sharedSongId = "user-link-" + Date.now() + "-" + sequence;
          charts[sharedSongId] = { bpm: parsed.bpm, steps: parsed.steps, directLanes: true, keySignature: parsed.keySignature, meter: parsed.meter };
          songNames[sharedSongId] = parsed.name;
          refreshSongOptions(sharedSongId);
          loadSelectedSongIntoEditor();
          document.getElementById("sharedSongTitle").textContent = "共有された曲：" + parsed.name;
          status.textContent = "この曲を演奏できます。あとで演奏する場合は「この端末に保存」を押してください。";
          play.hidden = false;
          save.hidden = false;
        } catch (error) {
          if (sequence !== sharedLinkSequence) return;
          document.getElementById("sharedSongTitle").textContent = "共有リンクを読み込めません";
          trackUsage('shared_failed');
          status.textContent = error.message || "リンクが途中で切れていないか確認してください。";
        }
      }
      document.getElementById("playSharedSongButton").addEventListener("click", startGame);
      document.getElementById("saveSharedSongButton").addEventListener("click", async () => {
        await saveCreatorSong(true);
        document.getElementById("sharedSongStatus").textContent = creatorStatus.textContent;
      });
      initialProjectRestore.catch(() => {}).then(loadSharedSong);
      window.addEventListener("hashchange", loadSharedSong);
      function openFeedbackFromLink() {
        if (!["#feedback", "#contact"].includes(location.hash)) return;
        const feedback = document.getElementById(location.hash.slice(1));
        if (!feedback) return;
        feedback.open = true;
        feedback.scrollIntoView({ block: "start" });
      }
      openFeedbackFromLink();
      window.addEventListener("hashchange", openFeedbackFromLink);

      document.getElementById("importShareButton").addEventListener("click", () => document.getElementById("importShareFile").click());
      document.getElementById("importShareFile").addEventListener("change", async (event) => {
        const [file] = event.target.files;
        if (!file) return;
        try { await importCreatorSongs(file); }
        catch (error) { showCreatorStatus(error.message || "譜面を読み込めませんでした。", true); }
        finally { event.target.value = ""; }
      });
      creatorDetails.addEventListener("input", invalidateShareFile);
      creatorDetails.addEventListener("change", invalidateShareFile);

      document.getElementById("startButton").addEventListener("click", startGame);
      document.getElementById("freePlayButton").addEventListener("click", startFreePlay);
      document.getElementById("freeRecordButton").addEventListener("click", () => {
        if (state !== "free") return;
        if (freeCountIn || freeRecordStartedAt !== null) { stopFreeTransport(); return; }
        beginFreeRecording();
      });
      freeMetronomeButton.addEventListener("click", () => {
        if (state !== "free" || freeCountIn || freeReplayStartedAt !== null) return;
        if (freeMetronomeOn) { stopFreeMetronome(); return; }
        if (!freeMetronomeBpm.checkValidity()) { freeMetronomeBpm.reportValidity(); return; }
        prepareRecordingAudio();
        freeMetronomeOn = true;
        freeMetronomeButton.textContent = "メトロノーム：ON";
        freeMetronomeButton.setAttribute("aria-pressed", "true");
        scheduleFreeMetronome();
      });
      freeMetronomeBpm.addEventListener("change", () => {
        if (freeMetronomeOn) {
          if (freeMetronomeBpm.checkValidity()) scheduleFreeMetronome();
          else stopFreeMetronome();
        }
      });
      document.getElementById("freeReplayButton").addEventListener("click", () => {
        if (state !== "free" || freeCountIn || !freeRecording.length || freeRecordStartedAt !== null) return;
        stopFreeMetronome();
        stopFreeTransport();
        freeReplayCursor = 0;
        freeReplayStartedAt = performance.now() + travelTime * 1000;
        refreshFreeRecordingControls("再生中 · 音符が鍵盤に届くと鳴ります");
      });
      document.getElementById("freeReplayStopButton").addEventListener("click", stopFreeTransport);
      document.getElementById("freeVideoButton").addEventListener("click", () => {
        if (state !== "free" || freeCountIn || !freeRecording.length || freeRecordStartedAt !== null || freeReplayStartedAt !== null) return;
        stopFreeMetronome();
        window.OtoiroFreeVideo?.open({ events: freeRecording, notes: notes.map((_, lane) => getFreeNote(lane)), volume: settings.volume });
      });
      document.addEventListener("visibilitychange", () => { if (document.hidden && state === "free") { stopFreeMetronome(); stopFreeTransport(); } });
      document.getElementById("exitFreePlayButton").addEventListener("click", () => {
        stopGame();
        document.getElementById("freePlayButton").focus();
      });
      document.getElementById("stopButton").addEventListener("click", stopGame);
      document.getElementById("pauseButton").addEventListener("click", pauseGame);
      document.getElementById("loadChartButton").addEventListener("click", loadSelectedSongIntoEditor);
      document.getElementById("saveChartButton").addEventListener("click", () => saveCreatorSong(false));
      document.getElementById("saveNewChartButton").addEventListener("click", () => saveCreatorSong(true));
      creatorChartInput.addEventListener("input", renderSheetPreview);
      document.getElementById("sortChartButton").addEventListener("click", sortCreatorChart);
      creatorBpmInput.addEventListener("input", renderSheetPreview);
      creatorMeterInput.addEventListener("change", renderSheetPreview);
      creatorKeySignatureInput.addEventListener("change", () => {
        stopPreview();
        renderSheetPreview();
        showCreatorStatus("調号を変更しました。試聴で確認し、保存ボタンで保存してください。");
      });
      deleteChartButton.addEventListener("click", removeSelectedCreatorSong);
      previewChartButton.addEventListener("click", previewCreatorChart);
      stopPreviewButton.addEventListener("click", () => stopPreview(true));
      testPlayButton.addEventListener("click", startTestPlay);
      startRecordingButton.addEventListener("click", startRecording);
      document.getElementById("overdubRecordingButton").addEventListener("click", () => startRecording(false, true));
      stopRecordingButton.addEventListener("click", stopRecording);
      document.getElementById("discardRecordingButton").addEventListener("click", () => {
        if (isRecording && window.confirm("今回の録音を反映せず終了しますか？元の譜面はそのまま残ります。")) stopRecording(true);
      });
      exportChartsButton.addEventListener("click", exportCreatorSongs);
      if (exportMobileAppButton) exportMobileAppButton.addEventListener("click", exportPortableApp);
      importChartsButton.addEventListener("click", () => importChartsFile.click());
      if (connectProjectButton) connectProjectButton.addEventListener("click", connectProjectFolder);
      importChartsFile.addEventListener("change", async () => {
        const [file] = importChartsFile.files;
        if (!file) return;
        try {
          await importCreatorSongs(file);
        } catch (error) {
          console.error("譜面データを読み込めませんでした。", error);
          showCreatorStatus("読み込みに失敗しました。ファイルを確認してください。", true);
        } finally {
          importChartsFile.value = "";
        }
      });
      document.addEventListener("visibilitychange", handlePageVisibilityChange);
      document.getElementById("songSelect").addEventListener("change", (event) => {
        if (event.target.value !== sharedSongId) document.getElementById("sharedSongPanel").hidden = true;
        chart = charts[event.target.value];
        updateReadyBpm();
        loadSelectedSongIntoEditor();
      });
      window.addEventListener("keydown", (event) => {
        if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
        if (document.getElementById("freeVideoDialog").open || recordingReadyDialog.open) return;
        if (event.target instanceof Element && event.target.closest("input, textarea, select")) return;
        const index = keyboardShortcuts.indexOf(event.key.toLowerCase());
        if (index < 0) return;
        if (state === "playing" || state === "free" || isRecording) {
          event.preventDefault();
          playKey(index);
        }
      });
      window.addEventListener("resize", resizeCanvas);
      new ResizeObserver(resizeCanvas).observe(playfield);
      resizeCanvas();
      requestAnimationFrame(frame);

      if ("serviceWorker" in navigator && window.isSecureContext) {
        navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" }).catch((error) => {
          console.error("オフライン用ファイルを準備できませんでした。", error);
        });
      }
    })();
