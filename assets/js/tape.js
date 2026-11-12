/* ============================================================
   tape.js —— 底部播放器条(Phase 1 · P1,零依赖)
   契约:
   · 点 .sig-card / .chan-row(data-src/title/artist/cover/desc)即播;再点同一张 = 暂停/继续;
   · 界面一次性渲染进 #tape,之后只改文本/图片/进度 —— 事件全部委托在
     #tape 容器与 document 上,不绑在会被重建的子节点;
   · 播放/暂停/切歌各响一声 window.fx.blip("click")(quiet 路径除外);
    · 对外总线 w.tape = { audio, on } —— radio.js 订阅 "track"(装载=索引/关闭=-1)
      与 "state"({ playing });audio 供 WebAudio 接 AnalyserNode;
    · 频道行点击的 blip 由 fx.js 负责，tape 对该路径传 quiet 防双响
   · 进度 rAF 更新 + timeupdate 兜底;点/拖 .tape-prog 按位置 seek;
   · 播完自动下一首(循环);关闭按钮停播收起;
   · 不改 document.title、不拦全局按键、不动 Turbo。
   风格对齐 fx.js/deck.js:IIFE + "use strict" + var 老式写法。
   ============================================================ */
(function () {
  "use strict";
  var d = document, w = window;
  var tape = d.getElementById("tape");
  var cards = [].slice.call(d.querySelectorAll(".sig-card, .chan-row"));
  if (!tape || !cards.length) return;

  /* ---------- 外壳只建一次(玻璃条骨架),子节点永不重建 ---------- */
  tape.innerHTML =
    '<div class="tape-bar">' +
      '<img class="tape-cover" alt="">' +
      '<div class="tape-meta"><span class="tape-title"></span><span class="tape-artist mono"></span></div>' +
      '<button class="tape-toggle" type="button" aria-label="播放 / 暂停"><span aria-hidden="true">\u25B6</span></button>' +
      '<div class="tape-prog" role="slider" aria-label="播放进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>' +
      '<button class="tape-next" type="button" aria-label="下一首"><span aria-hidden="true">\u21E5</span></button>' +
      '<button class="tape-close" type="button" aria-label="关闭播放器"><span aria-hidden="true">\u2715</span></button>' +
    '</div>';
  var bar = tape.querySelector(".tape-bar");
  var coverEl = tape.querySelector(".tape-cover");
  var metaEl = tape.querySelector(".tape-meta");
  var titleEl = tape.querySelector(".tape-title");
  var artistEl = tape.querySelector(".tape-artist");
  var toggleBtn = tape.querySelector(".tape-toggle");
  var glyph = toggleBtn.firstElementChild;
  var progEl = tape.querySelector(".tape-prog");
  var fillEl = progEl.firstElementChild;

  /* ---------- 单曲实例:一个隐藏 <audio> 走天下(挂进 #tape 便于调试) ---------- */
  var songs = cards.map(function (c) {
    return {
      src: c.getAttribute("data-src") || "",
      /* 播放条窄列优先用短标题（data-bar），避免长曲名 CSS 截断断在难看音节上 */
      title: c.getAttribute("data-bar") || c.getAttribute("data-title") || "",
      artist: c.getAttribute("data-artist") || "",
      cover: c.getAttribute("data-cover") || "",
      desc: c.getAttribute("data-desc") || ""
    };
  });
  var audio = d.createElement("audio");
  audio.preload = "metadata";
  tape.appendChild(audio);

  var cur = -1;   // 当前曲目索引,-1 = 未装载
  var raf = 0;

  /* ---------- 对外事件总线(radio.js 订阅;只做广播,不管行为) ---------- */
  var subs = { track: [], state: [] };
  function on(evt, fn) {
    if (subs[evt] && typeof fn === "function") subs[evt].push(fn);
  }
  function emit(evt, data) {
    var a = subs[evt];
    if (!a) return;
    for (var i = 0; i < a.length; i++) {
      try { a[i](data); } catch (err) { /* 订阅者出错不拖垮播放器 */ }
    }
  }

  function blip(kind) { if (w.fx && w.fx.blip) w.fx.blip(kind || "click"); }

  function setGlyph() {
    glyph.textContent = (!audio.paused && !audio.ended) ? "\u2759\u2759" : "\u25B6";
  }
  function markCards() {
    cards.forEach(function (c, i) { c.classList.toggle("playing", i === cur); });
  }
  function paintProgress() {
    var dur = audio.duration;
    var p = (dur && isFinite(dur)) ? audio.currentTime / dur : 0;
    fillEl.style.width = (p * 100).toFixed(2) + "%";
    progEl.setAttribute("aria-valuenow", Math.round(p * 100));
  }
  function loop() {
    raf = w.requestAnimationFrame(loop);
    paintProgress();
  }
  function startLoop() { if (!raf) loop(); }
  function stopLoop() { if (raf) { w.cancelAnimationFrame(raf); raf = 0; } }

  /* ---------- 装载并播放第 i 首(quiet = 调用方已带点击音效,别再 blip) ---------- */
  function loadPlay(i, quiet) {
    var s = songs[i];
    cur = i;
    coverEl.src = s.cover;
    titleEl.textContent = s.title;
    artistEl.textContent = s.artist;
    metaEl.title = s.desc;          // 悬停看歌曲简介,不占版面
    markCards();
    tape.classList.add("on");
    audio.src = s.src;
    var p = audio.play();
    if (p && p.catch) p.catch(function () { setGlyph(); }); // 自动播放被拦时图形回正
    emit("track", i);               // radio.js:指针滑动 + 读数 + 示波器换台
    if (!quiet) blip("tapeOn");     // 走带启动：按键咔 + 马达起转气声
  }

  /* ---------- 暂停 / 继续(当前曲目) ---------- */
  function togglePlay(quiet) {
    if (cur < 0) return;
    var resuming = audio.paused || audio.ended;
    if (resuming) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      audio.pause();
    }
    if (!quiet) blip(resuming ? "tapeOn" : "click"); /* 起播带马达声，暂停是普通按键音 */
  }

  /* ---------- 下一首(手动 / 播完自动,循环片单) ---------- */
  function next() {
    loadPlay((cur + 1) % songs.length);
  }

  /* ---------- 关闭:停播 + 收起 + 清状态 ---------- */
  function close() {
    audio.pause();
    stopLoop();
    cur = -1;
    markCards();
    tape.classList.remove("on");
    emit("track", -1);              // radio.js:面板保持调谐,但不再是「正在播」
    blip();
  }

  /* ---------- 进度条点击 seek(委托在 #tape) ---------- */
  function seek(e) {
    if (cur < 0 || !isFinite(audio.duration)) return;
    var rect = progEl.getBoundingClientRect();
    if (!rect.width) return;
    var r = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = r * audio.duration;
    paintProgress();
  }

  /* ---------- 拖拽 scrub(点按仍走上面的委托;捕获期间随时位移连续 seek) ---------- */
  var scrubbing = false;
  progEl.addEventListener("pointerdown", function (e) {
    if (cur < 0 || !isFinite(audio.duration)) return;
    e.preventDefault();                    /* 抑制后续 click 二次 seek 与文本选中 */
    scrubbing = true;
    try { progEl.setPointerCapture(e.pointerId); } catch (_) {}
    seek(e);
  });
  progEl.addEventListener("pointermove", function (e) { if (scrubbing) seek(e); });
  function endScrub(e) {
    if (!scrubbing) return;
    scrubbing = false;
    try { if (e && progEl.releasePointerCapture && progEl.hasPointerCapture(e.pointerId)) progEl.releasePointerCapture(e.pointerId); } catch (_) {}
  }
  progEl.addEventListener("pointerup", endScrub);
  progEl.addEventListener("pointercancel", endScrub);

  /* ---------- audio 状态回灌界面 ---------- */
  audio.addEventListener("play", function () { setGlyph(); startLoop(); emit("state", { playing: true }); });
  audio.addEventListener("pause", function () { setGlyph(); stopLoop(); paintProgress(); emit("state", { playing: false }); });
  audio.addEventListener("timeupdate", paintProgress);   // rAF 被节流时的兜底
  audio.addEventListener("ended", next);                  // 播完自动下一首(循环)
  audio.addEventListener("error", function () {
    // 资源坏了:停在原位,图形归位,不静默死循环
    stopLoop();
    setGlyph();
  });

  /* ---------- 事件委托 ---------- */
  // 歌卡/频道行:绑 document(卡片是静态 DOM,但委托更稳,且不吃未来重建的亏)。
  // 频道行是 button 且不在 .tape 里,fx.js 的通用 blip 已经替它响过一声,
  // 这里传 quiet 防双响;老 .sig-card 若在,行为不变(fx 对 .sig-card 跳过)。
  d.addEventListener("click", function (e) {
    var c = e.target && e.target.closest ? e.target.closest(".sig-card, .chan-row") : null;
    if (!c) return;
    var i = cards.indexOf(c);
    if (i < 0) return;
    var quiet = c.classList.contains("chan-row");
    if (i === cur) togglePlay(quiet);   // 同一张 = 暂停/继续
    else loadPlay(i, quiet);
  });
  // 播放器内部按钮与进度条:绑容器 #tape,子节点怎么换都不怕
  tape.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest(".tape-toggle")) togglePlay();
    else if (t.closest(".tape-next")) next();
    else if (t.closest(".tape-close")) close();
    else if (t.closest(".tape-prog")) seek(e);
  });

  /* ---------- 对外接口(radio.js 用;audio 供 WebAudio 接线,on 订事件) ---------- */
  w.tape = { audio: audio, on: on };
})();
