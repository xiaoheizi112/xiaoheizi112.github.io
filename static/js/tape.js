// 胶卷播放器：右下角胶片盘（播放时旋转），点开面板切歌/进度。无依赖，替代 APlayer。
// Turbo 8 初始渲染会重建 body 节点，旧版 if(window.tape)return 守卫导致新节点没监听（整个播放器是死的）。
// 改法：按节点打 __tape 标记绑定 + 监听 turbo 事件重绑，节点被换也能复活。
(() => {
  function boot() {
    let root = document.getElementById("tape");
    // 陈旧 Turbo 缓存快照里没有 #tape 时，permanent 节点会被整个移除（播放器消失+断音）。
    // 用首次 boot 存的 HTML 备份自愈：重新插回节点和样式，再从 localStorage 恢复播放状态。
    if (!root && window.__tapeHTML) {
      document.body.insertAdjacentHTML("beforeend", window.__tapeHTML);
      root = document.getElementById("tape");
      if (root && !document.querySelector('link[href*="tape.css"]')) {
        const l = document.createElement("link"); l.rel = "stylesheet"; l.href = window.__tapeCSS; document.head.appendChild(l);
      }
    }
    if (!root || root.__tape) return; // 同一节点只绑一次，防 Turbo 保活时重复 toggle
    root.__tape = true;
    if (!window.__tapeHTML) {
      const c = root.cloneNode(true); c.classList.remove("playing", "open");
      window.__tapeHTML = c.outerHTML;
      const lk = document.querySelector('link[href*="tape.css"]');
      if (lk) window.__tapeCSS = lk.getAttribute("href");
    }
    const audio = document.getElementById("tape-audio");
    const tracks = [...root.querySelectorAll(".tape-track")];
    if (!tracks.length) return;
    const cover = root.querySelector(".tape-cover");
    const title = root.querySelector(".tape-title");
    const artist = root.querySelector(".tape-artist");
    const seek = root.querySelector(".tape-seek");
    const fill = seek.querySelector("i");
    const tCur = root.querySelector(".t-cur");
    const tDur = root.querySelector(".t-dur");
    let idx = 0;

    const fmt = (s) => { s = Math.round(s || 0); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

    function load(i, autoplay) {
      idx = ((i % tracks.length) + tracks.length) % tracks.length;
      const t = tracks[idx];
      audio.src = t.dataset.url;
      cover.src = t.dataset.cover;
      title.textContent = t.dataset.title;
      artist.textContent = t.dataset.artist;
      tracks.forEach((li, j) => li.classList.toggle("cur", j === idx));
      try { localStorage.setItem("tape-idx", idx); } catch (e) {}
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: t.dataset.title, artist: t.dataset.artist,
          artwork: [{ src: t.dataset.cover }],
        });
      }
      if (autoplay) audio.play().catch((e) => {
        if (e.name !== "AbortError") { console.warn("[tape]", e.name); title.textContent = "点一下再播放"; }
      });
    }

    audio.addEventListener("play", () => root.classList.add("playing"));
    audio.addEventListener("pause", () => root.classList.remove("playing"));
    audio.addEventListener("waiting", () => root.classList.remove("playing")); // 卡缓冲时转盘别空转
    audio.addEventListener("playing", () => root.classList.add("playing"));
    audio.addEventListener("ended", () => load(idx + 1, true));
    audio.addEventListener("error", () => { title.textContent = "播放失败，点列表重试"; });
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) fill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
      tCur.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener("loadedmetadata", () => {
      tDur.textContent = fmt(audio.duration);
      if ("mediaSession" in navigator) { try { navigator.mediaSession.setPositionState({ duration: audio.duration || 0 }); } catch (e) {} }
    });

    root.querySelector(".tape-pp").addEventListener("click", () => { audio.paused ? audio.play().catch(() => {}) : audio.pause(); });
    root.querySelector(".tape-prev").addEventListener("click", () => load(idx - 1, true));
    root.querySelector(".tape-next").addEventListener("click", () => load(idx + 1, true));
    tracks.forEach((li, i) => li.addEventListener("click", () => load(i, true)));
    seek.addEventListener("click", (e) => {
      if (!audio.duration) return;
      const r = seek.getBoundingClientRect();
      audio.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * audio.duration;
    });
    root.querySelector(".tape-reel-btn").addEventListener("click", () => root.classList.toggle("open"));

    // 快捷键：P 播放/暂停，←/→ 切歌；输入场景不拦截
    document.addEventListener("keydown", (e) => {
      const t = e.target;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key === "p" || e.key === "P") { audio.paused ? audio.play().catch(() => {}) : audio.pause(); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { load(idx - 1, true); e.preventDefault(); }
      else if (e.key === "ArrowRight") { load(idx + 1, true); e.preventDefault(); }
    });

    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () => audio.play().catch(() => {}));
      navigator.mediaSession.setActionHandler("pause", () => audio.pause());
      navigator.mediaSession.setActionHandler("previoustrack", () => load(idx - 1, true));
      navigator.mediaSession.setActionHandler("nexttrack", () => load(idx + 1, true));
    }

    window.tape = { play: (i) => { load(i, true); root.classList.add("open"); } };
    let saved = 0;
    try { saved = +localStorage.getItem("tape-idx") || 0; } catch (e) {}
    load(saved, false);
  }
  boot();
  addEventListener("turbo:load", boot);
  addEventListener("turbo:render", boot);
})();
