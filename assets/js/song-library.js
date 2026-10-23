(() => {
  "use strict";
  const labels = ["かんたん", "ふつう", "むずかしい", "めちゃむず"];
  // Original chart tempo. Each chord tone counts as one note; ignore lead-in silence.
  function measure(chart) {
    const times = chart.steps.map(([step]) => step * 30 / chart.bpm).sort((a, b) => a - b);
    if (!times.length) return { level: 0, label: labels[0], count: 0, average: 0, peak: 0, index: 0 };
    const span = times[times.length - 1] - times[0] + 60 / chart.bpm;
    const average = times.length / span;
    const windowSeconds = Math.min(4, span);
    let left = 0, peak = 0;
    for (let right = 0; right < times.length; right++) {
      while (times[right] - times[left] >= windowSeconds) left++;
      peak = Math.max(peak, (right - left + 1) / windowSeconds);
    }
    const index = average * .65 + peak * .35;
    const level = index < 3 ? 0 : index < 3.6 ? 1 : index < 5 ? 2 : 3;
    return { level, label: labels[level], count: times.length, average, peak, index };
  }
  function mount({ select, getSongs }) {
    const grid = document.getElementById("songCards");
    const search = document.getElementById("songSearch");
    const filter = document.getElementById("difficultyFilter");
    const summary = document.getElementById("songSelectionSummary");
    const empty = document.getElementById("songLibraryEmpty");
    const play = document.getElementById("playSelectedSongButton");
    const normalize = value => value.normalize("NFKC").toLocaleLowerCase("ja");
    const metrics = new WeakMap();
    function refresh() {
      const query = normalize(search.value.trim());
      const songs = getSongs();
      const selected = songs.find(song => song.id === select.value);
      summary.textContent = selected ? "選択中：" + selected.name : "曲を選択してください";
      play.disabled = select.disabled || !selected;
      const fragment = document.createDocumentFragment();
      let visible = 0;
      for (const song of songs) {
        if (query && !normalize(song.name).includes(query)) continue;
        let difficulty = metrics.get(song.chart);
        if (!difficulty) { difficulty = measure(song.chart); metrics.set(song.chart, difficulty); }
        if (filter.value !== "all" && difficulty.level !== Number(filter.value)) continue;
        visible++;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "song-card";
        button.dataset.songId = song.id;
        button.dataset.level = String(difficulty.level);
        button.disabled = select.disabled;
        button.setAttribute("aria-pressed", String(song.id === select.value));
        button.setAttribute("aria-label", song.name + "、" + difficulty.label + "、BPM " + song.chart.bpm);
        const art = document.createElement("span");
        art.className = "song-card-art";
        art.setAttribute("aria-hidden", "true");
        art.textContent = "♪";
        const info = document.createElement("span");
        info.className = "song-card-info";
        const title = document.createElement("strong");
        title.className = "song-card-title";
        title.textContent = song.name;
        const meta = document.createElement("span");
        meta.className = "song-card-meta";
        meta.textContent = "BPM " + song.chart.bpm + " · " + difficulty.count + "音";
        const density = document.createElement("span");
        density.className = "song-card-density";
        density.textContent = "平均 " + difficulty.average.toFixed(1) + "音/秒";
        info.append(title, meta, density);
        const footer = document.createElement("span");
        footer.className = "song-card-footer";
        const badge = document.createElement("span");
        badge.className = "song-difficulty";
        badge.textContent = difficulty.label;
        const meter = document.createElement("span");
        meter.className = "song-difficulty-meter";
        meter.setAttribute("aria-hidden", "true");
        for (let i = 0; i < 4; i++) {
          const bar = document.createElement("i");
          if (i <= difficulty.level) bar.className = "filled";
          meter.append(bar);
        }
        footer.append(badge, meter);
        const check = document.createElement("span");
        check.className = "song-card-check";
        check.setAttribute("aria-hidden", "true");
        check.textContent = song.id === select.value ? "✓" : "";
        button.append(art, info, footer, check);
        button.addEventListener("click", () => {
          if (select.disabled) return;
          select.value = song.id;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          // Keep focus on the chosen card after the list is refreshed.
          [...grid.children].find(card => card.dataset.songId === song.id)?.focus({ preventScroll: true });
        });
        fragment.append(button);
      }
      grid.replaceChildren(fragment);
      empty.hidden = visible > 0;
    }
    search.addEventListener("input", refresh);
    filter.addEventListener("change", refresh);
    select.addEventListener("change", refresh);
    new MutationObserver(refresh).observe(select, { attributes: true, attributeFilter: ["disabled"] });
    play.addEventListener("click", () => {
      if (!select.disabled && select.value) document.getElementById("startButton").click();
    });
    refresh();
    return { refresh };
  }
  window.OtoiroSongLibrary = Object.freeze({ measure, mount });
})();

