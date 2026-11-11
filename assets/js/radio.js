/* ============================================================
   radio.js —— 04 SIGNALS 电台调谐面板(方案 C,零依赖,2026-11;R4 细节打磨同月)
    职责(只管面板,不碰播放逻辑 —— 点击频道行仍由 tape.js 委托装载):
    · 刻度条:往 #dial-scale 注入 87.5–108.0 每 0.5 一格(整点 .maj,
      5 的倍数与 108 加 .lab5 数字标注,窄屏靠 90-media.css 只留这组);
    · 指针:--np(百分比数值)驱动 .needle 的 left(CSS 负责 .5s 滑动;
      不用 translate,因为 translate % 参照的是指针自身宽度);
    · 读数:#dial-read 数字滚动(乱跳几帧再定格,如 092.5);
    · 同步:订阅 window.tape.on("track"/"state") —— 频道行 .active/.live
      (VU 柱动画开关)、拍立得封面、示波器大标题/歌手 swap、读数窗真值;
    · 示波器:canvas 透明底(网格在 CSS),rAF 画波 ——
      播放且 WebAudio 就绪 → getByteTimeDomainData(fftSize 256) 真波形,
      酸绿 1.5px + 轻辉光;否则 idle 正弦缓漂 + 噪点微闪;
      切台 250ms 雪花噪点 burst 叠加（拖拽调谐期间改画雪花静噪，声画同因；rAF 走 IO+visibility 双门控，离屏不空转）。
    机芯三件套(2026-11 R1/R2/R3,站主批准;注入件样式在 44-radio.css,
    但全部关键视觉走内联 style/SVG 属性 —— 44 未被运行中服务器索引前也可用):
    · R1 卡带:手绘 SVG 卡带(id=cassette)注入 .deck-bay 左格(右列上行,与 VU 并排;
      旧壳无 bay 退回 .radio-grid 直挂 scope-box 之上),
      两 reel <g> 走 transform="rotate(a cx cy)" 属性旋转(不吃 CSS,无 minifier 坑);
      转速由本文件唯一 rAF(frame)驱动:播放 ±105°/s 一收一放,
      暂停 lerp 阻尼缓停,切 track 倒卷半圈(400ms sin 包络 ±720°/s);
      窗内 #cass-cover 叠当前封面(track 事件取 data-cover,低对比圆角)。
    · R2 调谐拟真:.dial 上 pointer 拖指针(指针 capture;--np 实时跟手、读数跟扫;
       touch-action:pan-y 纵向翻页交还浏览器;读数窗按下先握手不接管——
       横移>4px 且横向主导即升级为调谐(窄屏 LCD 占 dial 近三成,不能是死区),
       纯竖划/轻点彻底放行;pointercancel→dragCancel 拨回当前台);
      拖拽期间 tape.audio.pause(),独立 WebAudio 支路播调谐沙沙
      (白噪 1s BufferSource loop → bandpass Q1.2,88–108MHz→800–3200Hz → gain .12 → destination);
      松手按 --np 反算最近电台 → 240ms var(--ease) 吸附 → 220Hz 方波咔哒 → rows[i].click() 开播。
      只读共用 analyser,不另建 MediaElementSource;reduced-motion / 无 AudioContext:
      仍可拖 + 吸附选台,无噪音无咔哒。
    · R3 VU 表:canvas 注入 .deck-bay 右格(退回 .scope-box 底部),~220×112 clamp,
      刻度 -20..0 dB 两段(暗区/--d-acid 实心警示区),针走二阶弹簧
      (vel+=(t-p)*.09; vel*=.87; p+=vel),目标=同帧 sampleAudio() 的时域 RMS
      (20log10+14 校准);idle 回 -20 附 noise-floor 游摆。无第二个 rAF。
    reduced-motion 补丁:reel 停转、VU 只画静态刻度+定格针、拖拽无动画直接吸附。
    调试钩子:window.__radioMech = { reelA, reelB, spin, vu, noise, drag, rewinding }()。
    接线纪律:AudioContext 只在首次用户手势(pointerdown capture)后懒建
    并 resume —— createMediaElementSource 一旦接上,音频就改道走图,
    必须保证 ctx 可用;接不上(老浏览器)则永远画 idle,不报错。
    reduced-motion:指针瞬移(CSS)、读数直改、无 burst、无 rAF(静态中线)。
    风格对齐 tape.js:IIFE + "use strict" + var 老式写法。
   ============================================================ */
(function () {
  "use strict";
  var d = document, w = window;
  var scale = d.getElementById("dial-scale");
  var needle = d.getElementById("needle");
  var readout = d.getElementById("dial-read");
  var cv = d.getElementById("scope");
  if (!scale || !needle || !cv) return;
  var rows = [].slice.call(d.querySelectorAll(".chan-row"));
  if (!rows.length) return;
  var titleEl = d.getElementById("scope-title");
  var artistEl = d.getElementById("scope-artist");
  var segBr = d.getElementById("tele-br");
  var brEl = d.getElementById("scope-br");
  var segPeak = d.getElementById("tele-peak");
  var peakEl = d.getElementById("scope-peak");
  var descEl = d.getElementById("scope-desc");
  var polaImg = d.getElementById("scope-cover");
  var mqR = w.matchMedia ? w.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var reduce = mqR ? mqR.matches : false;
  /* 机芯注入锚点(markup 契约见 40-cards.css radio 段) */
  var radioEl = cv.closest ? cv.closest(".radio") : d.querySelector(".radio");
  var dialEl = radioEl ? radioEl.querySelector(".dial") : null;
  var gridEl = radioEl ? radioEl.querySelector(".radio-grid") : null;
  var scopeBox = radioEl ? radioEl.querySelector(".scope-box") : null;

  var ctx2 = cv.getContext("2d");
  if (!ctx2) return;

  /* ---------- FM 频段几何 ---------- */
  var LO = 87.5, HI = 108.0, SPAN = HI - LO;
  function pct(f) { return Math.min(100, Math.max(0, (f - LO) / SPAN * 100)); }
  function rowFreq(r) {
    var f = parseFloat(r.getAttribute("data-freq"));
    return isFinite(f) ? f : LO;
  }
  function fmt(f) { return ("0000" + f.toFixed(1)).slice(-5); } /* 88.1→088.1 */

  /* ---------- 注入刻度(半格细线 / 整点高线 + 数字) ---------- */
  (function ticks() {
    var frag = d.createDocumentFragment();
    for (var f = LO; f <= HI + 1e-6; f += 0.5) {
      var maj = Math.abs(f - Math.round(f)) < 1e-6;
      var t = d.createElement("span");
      t.className = "d-tick" + (maj ? " maj" + ((f % 5 === 0 || f === HI) ? " lab5" : "") : "");
      t.style.left = pct(f).toFixed(3) + "%";
      if (maj) {
        var lab = d.createElement("span");
        lab.className = "d-lab";
        lab.textContent = String(Math.round(f));
        t.appendChild(lab);
      }
      frag.appendChild(t);
    }
    scale.insertBefore(frag, needle); /* 保持 #needle 在容器内且最后 */
  })();

  /* ---------- 令牌色(canvas 吃不到 CSS 变量,读取一次) ---------- */
  function tok(name, fb) {
    var v = (d.documentElement && w.getComputedStyle)
      ? w.getComputedStyle(d.documentElement).getPropertyValue(name) : "";
    return (v && v.trim()) || fb;
  }
  var ACID = tok("--d-acid", "#3ae35c");
  var MUTEC = tok("--d-mute", "#97a49e");
  var DIMC = tok("--d-dim", "#55625c");

  /* ---------- 指针 + 读数 ---------- */
  var curIdx = -1;
  var readTimer = 0;
  function setNeedle(f, instant) {
    if (instant) {
      needle.style.transition = "none";
      needle.style.setProperty("--np", pct(f).toFixed(3));
      void needle.offsetWidth;               /* 冲一遍,再交还 CSS 过渡 */
      needle.style.transition = "";
    } else {
      needle.style.setProperty("--np", pct(f).toFixed(3));
    }
  }
  function scrambleRead(f) {
    var target = fmt(f);
    if (reduce) { readout.textContent = target; return; }
    if (readTimer) w.clearInterval(readTimer);
    var ticks = 0;
    readTimer = w.setInterval(function () {
      ticks++;
      if (ticks > 6) {                       /* 乱跳 ~240ms 后定格 */
        w.clearInterval(readTimer);
        readTimer = 0;
        readout.textContent = target;
        return;
      }
      /* 频段内随机 87.0–107.x，凑成 "0XX.X"/"1XX.X" 五字读数 */
      var rf = 87 + Math.floor(Math.random() * 21);
      readout.textContent = ("0" + rf + "." + Math.floor(Math.random() * 10)).slice(-5);
    }, 40);
  }

  /* ---------- 状态同步(track / state 事件) ---------- */
  function markRows(i, playing) {
    rows.forEach(function (r, k) {
      r.classList.toggle("active", k === i);
      r.classList.toggle("live", playing && k === i);
      r.setAttribute("aria-pressed", k === i ? "true" : "false");
    });
  }
  function swapText(el, txt) {
    if (!el || el.textContent === txt) return;
    el.textContent = txt;
    if (reduce) return;
    el.classList.remove("swap");
    void el.offsetWidth;
    el.classList.add("swap");
  }
  function tune(i, opts) {
    var r = rows[i];
    if (!r) return;
    curIdx = i;
    var f = rowFreq(r);
    setNeedle(f, !!(opts && opts.instant));
    if (opts && opts.burst) startBurst();
    scrambleRead(f);
    swapText(titleEl, r.getAttribute("data-title") || "");
    swapText(artistEl, r.getAttribute("data-artist") || "");
    if (descEl) descEl.textContent = r.getAttribute("data-desc") || "";
    if (polaImg) {
      var c = r.getAttribute("data-cover");
      if (c) polaImg.src = c;
      polaImg.alt = (r.getAttribute("data-title") || "") + " 封面";
    }
    probeBitrate(r);
    markRows(i, audioPlaying && !!(opts && opts.keepLive));
  }

  /* ---------- WebAudio:首次手势后懒接,analyser 取时域 ---------- */
  var ac = null, an = null, td = null, wired = false;
  var audioPlaying = false;
  function ensureGraph() {
    if (wired) return;
    var t = w.tape;
    var AC = w.AudioContext || w.webkitAudioContext;
    if (!t || !t.audio || !AC) { wired = true; return; } /* 不重试,画 idle */
    try {
      ac = new AC();
      var src = ac.createMediaElementSource(t.audio);
      an = ac.createAnalyser();
      an.fftSize = 256;                      /* 256 时域采样 */
      td = new Uint8Array(an.fftSize);
      src.connect(an);
      an.connect(ac.destination);            /* 必须接回输出,否则没声 */
      if (ac.state === "suspended" && ac.resume) ac.resume();
      /* AMB-REACT:把这条既有 AnalyserNode 递给背景引擎(fx.js)。全站只有这一条
         挂在 tape.audio 上——createMediaElementSource 一台元素只能挂一次,
         背景躁动必须复用真信号,不许另建一条假监听。 */
      if (w.fx && w.fx.setAudio) w.fx.setAudio(an);
      wired = true;
    } catch (e) { wired = true; }            /* 接不上就算了 */
  }
  d.addEventListener("pointerdown", ensureGraph, true);
  if (w.tape && w.tape.on) {
    w.tape.on("track", function (i) {
      if (i >= 0) {
        ensureGraph();
        tune(i, { burst: true, keepLive: audioPlaying });
        reelRewind();                      /* R1:切 track 倒卷半圈再正转 */
        setCassetteCover(i);               /* R1:窗内封面跟随 */
      }
      /* i === -1(close):面板保持调谐,markRows 会随 state false 撤 .live */
    });
    w.tape.on("state", function (st) {
      audioPlaying = !!(st && st.playing);
      if (audioPlaying) ensureGraph();
      rows.forEach(function (r, k) { r.classList.toggle("live", audioPlaying && k === curIdx); });
    });
  }

  /* ---------- 真读数:BITRATE(HEAD 字节数×8÷时长) / PEAK(时域峰值→dBFS) ----------
     铁律:取不到真值整段不显示,绝不编数(旧「SNR 0.94+rand」假漂移已删)。 */
  var brCache = {};
  function showBr(k) {
    if (!brEl || !segBr) return;
    brEl.textContent = k + "k";
    segBr.hidden = false;
  }
  function probeBitrate(row) {
    if (!brEl || !segBr || !w.fetch || !row) return;
    var src = row.getAttribute("data-src");
    if (!src) return;
    if (brCache[src]) { showBr(brCache[src]); return; }
    var a = w.tape && w.tape.audio;
    if (!a) return;
    var dur = isFinite(a.duration) && a.duration > 0
      ? Promise.resolve(a.duration)
      : new Promise(function (res) {
          var on = function () { a.removeEventListener("loadedmetadata", on); res(isFinite(a.duration) ? a.duration : 0); };
          a.addEventListener("loadedmetadata", on);
        });
    dur.then(function (secs) {
      if (!(secs > 0)) return;
      return w.fetch(src, { method: "HEAD" }).then(function (rs) {
        var len = +rs.headers.get("content-length");
        if (!(len > 0)) return;
        var k = Math.round(len * 8 / secs / 1000);
        if (!k) return;
        brCache[src] = k;
        if (rows[curIdx] === row) showBr(k);   /* 只点亮当前台,拖快了我已被顶掉就不写 */
      });
    })["catch"](function () { /* 探不到就不显示,保持如实 */ });
  }

  /* ---------- 示波器绘制 ---------- */
  var W = 0, H = 0, dpr = Math.min(w.devicePixelRatio || 1, 2);
  function fit() {
    var r = cv.getBoundingClientRect();
    var cw = Math.max(1, Math.round(r.width)), chh = Math.max(1, Math.round(r.height));
    if (cw !== W || chh !== H) {
      W = cw; H = chh;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  var burstT = 0, lastTs = 0, drift = 0;
  var rafId = 0, onScreen = true, onPage = true, peakT = 0;
  function startBurst() { if (!reduce) burstT = 250; }
  function drawWave() {
    var mid = H / 2, n, i, x, y;
    ctx2.lineWidth = 1.5;
    ctx2.strokeStyle = ACID;
    ctx2.shadowColor = "rgba(58, 227, 92, .55)";
    ctx2.shadowBlur = 6;
    ctx2.beginPath();
    if (audioPlaying && an) {
      an.getByteTimeDomainData(td);
      n = td.length;
      for (i = 0; i < n; i++) {
        x = i / (n - 1) * W;
        y = mid + (td[i] - 128) / 128 * (mid * 0.82);
        if (i) ctx2.lineTo(x, y); else ctx2.moveTo(x, y);
      }
    } else {
      n = 96;
      for (i = 0; i < n; i++) {
        x = i / (n - 1) * W;
        y = mid + Math.sin(i * 0.18 + drift) * H * 0.05
                + Math.sin(i * 0.037 + drift * 0.7) * H * 0.025;
        if (i) ctx2.lineTo(x, y); else ctx2.moveTo(x, y);
      }
    }
    ctx2.stroke();
    ctx2.shadowBlur = 0;
  }
  function drawNoise(k) {                    /* k = 强度 0..1(idle 微闪 / burst) */
    var cnt = k > 0.2 ? 90 : 14;
    for (var i = 0; i < cnt; i++) {
      var a = Math.random() * k * 0.9;
      ctx2.fillStyle = Math.random() < 0.25
        ? "rgba(58, 227, 92, " + a.toFixed(3) + ")"
        : "rgba(226, 236, 231, " + a.toFixed(3) + ")";
      ctx2.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 2, 1 + Math.random());
    }
  }
  function drawTuning() {                  /* 拖拽中:沙沙在响,画面对应雪花静噪(声画同因,不再是待机正弦) */
    var mid = H / 2, n = Math.max(12, Math.round(W / 6)), i;
    drawNoise(0.55);
    ctx2.lineWidth = 1.2;
    ctx2.strokeStyle = "rgba(226, 236, 231, .5)";
    ctx2.beginPath();
    for (i = 0; i <= n; i++) {
      var x = i / n * W;
      var y = mid + (Math.random() - 0.5) * H * 0.34;
      if (i) ctx2.lineTo(x, y); else ctx2.moveTo(x, y);
    }
    ctx2.stroke();
  }
  function peakPulse(dt) {                 /* PEAK:analyser 时域真峰 → dBFS,250ms 节流;没在播就收段 */
    if (!peakEl || !segPeak) return;
    peakT -= dt;
    if (peakT > 0) return;
    peakT = 250;
    if (!(audioPlaying && an)) { segPeak.hidden = true; return; }
    an.getByteTimeDomainData(td);
    var pk = 0;
    for (var i = 0; i < td.length; i++) {
      var v = Math.abs(td[i] - 128);
      if (v > pk) pk = v;
    }
    peakEl.textContent = (pk > 0 ? (20 * Math.log(pk / 128) / Math.LN10).toFixed(1) : "-inf") + " dB";
    segPeak.hidden = false;
  }
  function frame(ts) {
    var dt = lastTs ? Math.min(64, ts - lastTs) : 16;
    lastTs = ts;
    fit();
    ctx2.clearRect(0, 0, W, H);
    drift += dt * 0.0016;
    if (dragging) drawTuning(); else drawWave();
    if (burstT > 0) { burstT -= dt; drawNoise(Math.min(1, burstT / 250) + 0.25); }
    else if (!dragging && !(audioPlaying && an)) drawNoise(0.16);
    spinReels(dt);                         /* R1 转盘(同循环,不开第二个 rAF) */
    vuPhysics(dt); vuDraw();               /* R3 VU 弹簧针 */
    peakPulse(dt);
    rafId = w.requestAnimationFrame(frame);
  }
  function pump() {                        /* rAF 门控:面板离屏/切后台不空转 */
    if (reduce) return;
    var want = onScreen && onPage;
    if (want && !rafId) { lastTs = 0; rafId = w.requestAnimationFrame(frame); }
    else if (!want && rafId) { w.cancelAnimationFrame(rafId); rafId = 0; }
  }

  /* ============================================================
     R1 卡带机芯 —— 手绘 SVG 注入 .dial 与 .radio-grid 之间
     ============================================================ */
  var cassette = null, reelL = null, reelR = null, cassCover = null, cassLed = null;
  var REEL_L = { cx: 100, cy: 102 }, REEL_R = { cx: 220, cy: 102 };
  var BASE_V = 105;            /* 播放角速度 deg/s */
  var DAMP = 0.085;            /* 缓停 lerp 系数/帧 */
  var REW_MS = 400, REW_PEAK = 720;   /* 倒卷时长 ms / 峰值角速度 deg/s(sin 包络,累计≈半圈) */
  var angL = 0, angR = 0, velL = 0, velR = 0, rewT = 0;
  var reelsStill = false, ledLit = null;

  function teeth(cx, cy, n, r1, r2) {      /* n 个齿轮凸齿路径(极坐标) */
    var s = "", i, a, w = 0.32;
    for (i = 0; i < n; i++) {
      a = i / n * Math.PI * 2;
      s += "<path d='M" + (cx + r1 * Math.cos(a - w)).toFixed(2) + " " + (cy + r1 * Math.sin(a - w)).toFixed(2) +
        "L" + (cx + r2 * Math.cos(a - w * 0.55)).toFixed(2) + " " + (cy + r2 * Math.sin(a - w * 0.55)).toFixed(2) +
        "L" + (cx + r2 * Math.cos(a + w * 0.55)).toFixed(2) + " " + (cy + r2 * Math.sin(a + w * 0.55)).toFixed(2) +
        "L" + (cx + r1 * Math.cos(a + w)).toFixed(2) + " " + (cy + r1 * Math.sin(a + w)).toFixed(2) + "'/>";
    }
    return s;
  }
  function screw(cx, cy, r) {              /* 十字槽螺丝孔 */
    return "<g class='c-screw'><circle cx='" + cx + "' cy='" + cy + "' r='" + r + "'/>" +
      "<line x1='" + (cx - r * 0.62) + "' y1='" + cy + "' x2='" + (cx + r * 0.62) + "' y2='" + cy + "'/>" +
      "<line x1='" + cx + "' y1='" + (cy - r * 0.62) + "' x2='" + cx + "' y2='" + (cy + r * 0.62) + "'/></g>";
  }
  /* 44-radio.css 上线探测:运行中 hugo server 未索引新 css 文件时,JS 回退内联上色。
     探针 width 由 .mech-probe{width:7px} 决定——命中说明样式表已生效,跳过回退。 */
  var mechCssLiveCache = null;
  function mechCssLive() {
    if (mechCssLiveCache !== null) return mechCssLiveCache;
    var t = d.createElement("div");
    t.className = "mech-probe";
    (radioEl || d.body).appendChild(t);
    mechCssLiveCache = w.getComputedStyle(t).width === "7px";
    t.parentNode.removeChild(t);
    return mechCssLiveCache;
  }
  var CASS_PAINT = {                            /* 与 44-radio.css 一一对应的保底上色 */
    "c-shell":     "fill:var(--d-card);stroke:var(--d-line-2);stroke-width:1.1",
    "c-ghost":     "fill:none;stroke:var(--d-line);stroke-width:.8;stroke-dasharray:3 7",
    "c-label":     "fill:var(--d-void-2);stroke:var(--d-line);stroke-width:.8",
    "c-mono":      "fill:var(--d-mute);font:700 9px var(--f-mono);letter-spacing:.14em",
    "c-mini":      "font-size:9px",
    "c-rule":      "stroke:var(--d-line);stroke-width:.8",
    "c-led":       "fill:var(--d-acid);opacity:.3",
    "c-pack":      "fill:url(#cass-hatch)",
    "c-path":      "stroke:var(--d-line-2);stroke-width:.8;stroke-dasharray:1 3",
    "c-cover":     "opacity:.4;filter:grayscale(1) contrast(.85)",
    "c-coverline": "fill:none;stroke:var(--d-line-2);stroke-width:.8",
    "c-band":      "fill:none;stroke:var(--d-dim)",
    "c-reelring":  "fill:var(--d-void);stroke:var(--d-mute);stroke-width:1",
    "c-teeth":     "fill:var(--d-void-2);stroke:var(--d-mute);stroke-width:.7",
    "c-spoke":     "stroke:var(--d-dim);stroke-width:1",
    "c-hub":       "fill:var(--d-void);stroke:var(--d-mute);stroke-width:1",
    "c-screw":     "fill:none;stroke:var(--d-line-2);stroke-width:.8"
  };
  function paintCassetteFallback(root) {
    for (var k in CASS_PAINT) {
      var els = root.querySelectorAll("." + k);
      for (var i = 0; i < els.length; i++) els[i].style.cssText += ";" + CASS_PAINT[k];
    }
  }
  function buildCassette() {
    if (!radioEl || !gridEl) return;
    var cxL = REEL_L.cx, cyL = REEL_L.cy, cxR = REEL_R.cx, cyR = REEL_R.cy;
    var mk = "<svg viewBox='0 0 320 200' aria-hidden='true' style='width:100%;height:auto;display:block'>" +
      "<defs>" +
      "<pattern id='cass-hatch' width='5' height='5' patternUnits='userSpaceOnUse' patternTransform='rotate(38)'>" +
      "<line x1='0' y1='0' x2='0' y2='5' style='stroke:var(--d-line-2)' stroke-width='0.7'/></pattern>" +
      "<clipPath id='cass-coverclip'><rect x='141' y='82' width='38' height='34' rx='4'/></clipPath>" +
      "</defs>" +
      /* 外壳:主廓 + 内侧手绘复线(ghost) */
      "<rect class='c-shell' x='3' y='3' width='314' height='194' rx='11'/>" +
      "<rect class='c-ghost' x='6.5' y='7' width='307' height='187' rx='9'/>" +
      /* 标签贴纸区 */
      "<rect class='c-label' x='20' y='14' width='280' height='42' rx='4'/>" +
      "<text class='c-mono' x='30' y='30'>SIDE A &#183; MIXTAPE</text>" +
      "<line class='c-rule' x1='30' y1='36' x2='230' y2='36'/>" +
      "<line class='c-rule' x1='30' y1='43' x2='190' y2='43'/>" +
      "<text class='c-mono c-mini' x='270' y='30' text-anchor='end'>FM&#8239;87.5&#8211;108</text>" +
      "<circle class='c-led' id='cass-led' cx='286' cy='28' r='2.6'/>" +
      /* 中央窗:带基斜纹 + 隐约走带虚线 */
      "<rect class='c-shell' x='116' y='66' width='88' height='66' rx='5'/>" +
      "<rect class='c-pack' x='118' y='68' width='84' height='62' rx='4'/>" +
      "<line class='c-path' x1='160' y1='70' x2='160' y2='128'/>" +
      "<line class='c-path' x1='128' y1='100' x2='192' y2='100'/>" +
      /* 封面小图(track 事件换源) */
      "<image class='c-cover' id='cass-cover' x='141' y='82' width='38' height='34' clip-path='url(#cass-coverclip)'/>" +
      "<rect class='c-coverline' x='141' y='82' width='38' height='34' rx='4'/>" +
      /* 两 reel:缠带环(一粗一细=一收一放)+ 齿轮圈 + 辐条 + 中心孔(整体旋转) */
      "<circle class='c-band' cx='" + cxL + "' cy='" + cyL + "' r='23' stroke-width='9'/>" +
      "<circle class='c-band' cx='" + cxR + "' cy='" + cyR + "' r='23' stroke-width='5'/>" +
      "<g id='cass-reel-l' class='c-reel' transform='rotate(0 " + cxL + " " + cyL + ")'>" +
      "<circle class='c-reelring' cx='" + cxL + "' cy='" + cyL + "' r='16'/>" +
      "<g class='c-teeth'>" + teeth(cxL, cyL, 10, 16, 20.5) + "</g>" +
      "<line class='c-spoke' x1='" + cxL + "' y1='" + (cyL - 14) + "' x2='" + cxL + "' y2='" + (cyL + 14) + "'/>" +
      "<line class='c-spoke' x1='" + (cxL - 12.1) + "' y1='" + (cyL - 7) + "' x2='" + (cxL + 12.1) + "' y2='" + (cyL + 7) + "'/>" +
      "<line class='c-spoke' x1='" + (cxL - 12.1) + "' y1='" + (cyL + 7) + "' x2='" + (cxL + 12.1) + "' y2='" + (cyL - 7) + "'/>" +
      "<circle class='c-hub' cx='" + cxL + "' cy='" + cyL + "' r='5.5'/></g>" +
      "<g id='cass-reel-r' class='c-reel' transform='rotate(0 " + cxR + " " + cyR + ")'>" +
      "<circle class='c-reelring' cx='" + cxR + "' cy='" + cyR + "' r='16'/>" +
      "<g class='c-teeth'>" + teeth(cxR, cyR, 10, 16, 20.5) + "</g>" +
      "<line class='c-spoke' x1='" + cxR + "' y1='" + (cyR - 14) + "' x2='" + cxR + "' y2='" + (cyR + 14) + "'/>" +
      "<line class='c-spoke' x1='" + (cxR - 12.1) + "' y1='" + (cyR - 7) + "' x2='" + (cxR + 12.1) + "' y2='" + (cyR + 7) + "'/>" +
      "<line class='c-spoke' x1='" + (cxR - 12.1) + "' y1='" + (cyR + 7) + "' x2='" + (cxR + 12.1) + "' y2='" + (cyR - 7) + "'/>" +
      "<circle class='c-hub' cx='" + cxR + "' cy='" + cyR + "' r='5.5'/></g>" +
      /* 下缘走带通道梯形 + 压带轮/导带柱小孔 */
      "<path class='c-shell' d='M82 148H238L224 188H96Z'/>" +
      "<line class='c-rule' x1='108' y1='160' x2='212' y2='160'/>" +
      "<line class='c-rule' x1='104' y1='174' x2='216' y2='174'/>" +
      "<circle class='c-hub' cx='132' cy='167' r='3'/>" +
      "<circle class='c-hub' cx='188' cy='167' r='3'/>" +
      /* 四角螺丝 */
      screw(13, 13, 3) + screw(307, 13, 3) + screw(13, 187, 3) + screw(307, 187, 3) +
      "</svg>";
    cassette = d.createElement("div");
    cassette.className = "cassette";
    cassette.id = "cassette";
    cassette.setAttribute("aria-hidden", "true");
    /* 尺寸/居中交给 44-radio.css(便于窄屏 media 覆盖);CSS 未上线时下方探测回退 */
    cassette.style.cssText = "touch-action:manipulation";
    cassette.innerHTML = mk;
    /* 首选 .deck-bay(右列上行,与 VU 并排);旧壳无 bay 时退回 grid 直挂 */
    var bay = gridEl.querySelector(".deck-bay");
    if (bay) bay.appendChild(cassette);
    else gridEl.insertBefore(cassette, gridEl.querySelector(".scope-box"));
    if (!mechCssLive()) {
      cassette.style.cssText += ";width:min(100%,320px)";
      paintCassetteFallback(cassette);
      if (dialEl) dialEl.style.cursor = "ew-resize";
    }
    reelL = d.getElementById("cass-reel-l");
    reelR = d.getElementById("cass-reel-r");
    cassCover = d.getElementById("cass-cover");
    cassLed = d.getElementById("cass-led");
    if (cassCover && rows[0]) cassCover.setAttribute("href", rows[0].getAttribute("data-cover") || "");
  }

  function reelRewind() {                  /* 切 track:倒卷半圈(400ms 加速回转)再正转 */
    if (reduce) return;
    rewT = REW_MS;
  }
  function setCassetteCover(i) {
    if (cassCover && rows[i]) {
      var c = rows[i].getAttribute("data-cover");
      if (c) cassCover.setAttribute("href", c);
    }
  }
  function spinReels(dt) {
    if (!reelL || !reelR) return;
    syncLed();
    var still = !audioPlaying && rewT <= 0 && Math.abs(velL) < 0.01 && Math.abs(velR) < 0.01;
    if (still && reelsStill) return;       /* R4 停稳:不再逐帧写 SVG transform(上一帧已写终值) */
    reelsStill = still;
    var f = dt / 16.667;                   /* 归一到 60fps 帧步 */
    if (rewT > 0) {
      rewT = Math.max(0, rewT - dt);
      var env = Math.sin(Math.PI * (1 - rewT / REW_MS));
      var v = REW_PEAK * env;
      velL = -v; velR = v;                 /* 倒卷:收放互换 */
    } else if (audioPlaying) {
      velL += (BASE_V - velL) * Math.min(1, 0.12 * f);
      velR += (-BASE_V - velR) * Math.min(1, 0.12 * f);
    } else {                               /* 暂停:阻尼 lerp 缓停 */
      velL *= Math.max(0, 1 - DAMP * f);
      velR *= Math.max(0, 1 - DAMP * f);
    }
    angL += velL * dt / 1000;
    angR += velR * dt / 1000;
    reelL.setAttribute("transform", "rotate(" + angL.toFixed(2) + " " + REEL_L.cx + " " + REEL_L.cy + ")");
    reelR.setAttribute("transform", "rotate(" + angR.toFixed(2) + " " + REEL_R.cx + " " + REEL_R.cy + ")");
  }
  function syncLed() {                     /* R4:LED 只在播放/暂停翻转时写一次 */
    if (!cassLed) return;
    var lit = !!audioPlaying;
    if (ledLit === lit) return;
    ledLit = lit;
    cassLed.setAttribute("class", "c-led" + (lit ? " lit" : ""));
    if (!mechCssLive()) cassLed.style.opacity = lit ? "1" : "0.3";
  }
  function reelsStatic() {                 /* reduced-motion:定格一点姿态,证明组件在场 */
    if (!reelL || !reelR) return;
    reelL.setAttribute("transform", "rotate(7 " + REEL_L.cx + " " + REEL_L.cy + ")");
    reelR.setAttribute("transform", "rotate(-7 " + REEL_R.cx + " " + REEL_R.cy + ")");
  }

  /* ============================================================
     R3 指针式 VU 表 —— canvas 注入 .scope-box 底部
     ============================================================ */
  var vuCv = null, ctx3 = null, vw = 0, vh = 0;
  var vuPos = -20, vuVel = 0, vuIdle = 0;
  var SPRING_K = 0.09, SPRING_D = 0.86;    /* 二阶弹簧: stiffness / 每帧阻尼 */
  var VU_BIAS = 14;                        /* RMS→dB 校准偏置 */
  function buildVu() {
    var bay = gridEl ? gridEl.querySelector(".deck-bay") : null;
    if (!bay && !scopeBox) return;
    var wrap = d.createElement("div");
    wrap.className = "vu-meter";
    wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:4px";
    wrap.innerHTML =
      "<p class='vu-cap mono' aria-hidden='true'><span>OUTPUT</span><span>VU</span></p>" +
      "<canvas class='vu-cv' id='vu-meter' width='220' height='112' aria-hidden='true' " +
      "style='width:min(100%,var(--vu-max,220px));height:auto;background:var(--d-void);border:1px solid var(--d-line);border-radius:3px'></canvas>";
    if (bay) bay.appendChild(wrap);
    else scopeBox.insertBefore(wrap, scopeBox.querySelector(".scope-pola"));
    vuCv = d.getElementById("vu-meter");
    ctx3 = vuCv.getContext("2d");
    if (!ctx3) { vuCv = null; return; }
    vuFit();
  }
  function vuFit() {
    var r = vuCv.getBoundingClientRect();
    var cw = Math.max(1, Math.round(r.width)), chh = Math.max(1, Math.round(r.height));
    if (cw !== vw || chh !== vh) {
      vw = cw; vh = chh;
      vuCv.width = vw * dpr; vuCv.height = vh * dpr;
      ctx3.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  /* 时域样本 → RMS dB(只读 analyser,不新增任何 AudioNode 链) */
  function audioDb() {
    if (!audioPlaying || !an) return null;
    an.getByteTimeDomainData(td);
    var s = 0, i, q;
    for (i = 0; i < td.length; i++) { q = (td[i] - 128) / 128; s += q * q; }
    var rms = Math.sqrt(s / td.length);
    var db = 20 * Math.log(rms + 1e-7) / Math.LN10 + VU_BIAS;
    return Math.min(3, Math.max(-20, db));
  }
  function vuPhysics(dt, t) {
    var f = dt / 16.667;
    var tgt = audioDb();
    if (tgt === null) {                    /* idle:回 -20 处 noise-floor 轻游摆 */
      vuIdle += dt * 0.001;
      tgt = -20 + 0.9 * Math.sin(vuIdle * 1.15) + (Math.random() - 0.5) * 0.7;
    }
    vuVel += (tgt - vuPos) * SPRING_K * f;
    vuVel *= Math.pow(SPRING_D, f);
    vuPos += vuVel * f;
  }
  function vuAngle(db) {                   /* -20..0(+3 允许过冲) → -46°..+46° */
    return ((Math.min(2.6, Math.max(-20.6, db)) + 20) / 22.6 * 92 - 46) * Math.PI / 180;
  }
  function vuDraw() {
    if (!ctx3) return;
    vuFit();
    var W2 = vw, H2 = vh, cx = W2 / 2, cy = H2 * 0.88, R = Math.min(W2 * 0.44, H2 * 0.78);
    var i, a, mx, my, db, big;
    ctx3.clearRect(0, 0, W2, H2);
    /* 刻度弧:暗区 -20..-4 + 警示区 -4..0(酸绿实心) */
    ctx3.lineWidth = 1.2;
    ctx3.strokeStyle = DIMC;
    ctx3.beginPath(); ctx3.arc(cx, cy, R, -Math.PI / 2 + vuAngle(-20), -Math.PI / 2 + vuAngle(-4)); ctx3.stroke();
    ctx3.strokeStyle = ACID;
    ctx3.beginPath(); ctx3.arc(cx, cy, R, -Math.PI / 2 + vuAngle(-4), -Math.PI / 2 + vuAngle(0)); ctx3.stroke();
    /* 长短刻度 + 数字 */
    ctx3.lineWidth = 1;
    for (db = -20; db <= 2; db += 2) {
      a = vuAngle(db); big = (db % 5 === 0) || db === 2 || db === 0 || db === -20 || db === -7;
      ctx3.strokeStyle = db >= -4 ? ACID : DIMC;
      mx = Math.sin(a); my = -Math.cos(a);
      ctx3.beginPath();
      ctx3.moveTo(cx + mx * (R - (big ? 7 : 4)), cy + my * (R - (big ? 7 : 4)));
      ctx3.lineTo(cx + mx * R, cy + my * R);
      ctx3.stroke();
      if (big) {
        ctx3.fillStyle = db >= -4 ? ACID : MUTEC;
        ctx3.font = "9px 'JetBrains Mono', monospace";
        ctx3.textAlign = "center"; ctx3.textBaseline = "middle";
        ctx3.fillText(String(db), cx + mx * (R - 15), cy + my * (R - 15));
      }
    }
    /* -20 peg 位小字 */
    ctx3.fillStyle = DIMC; ctx3.font = "8px 'JetBrains Mono', monospace";
    ctx3.textAlign = "left"; ctx3.textBaseline = "top";
    ctx3.fillText("dB", 4, 4);
    /* 针:二阶弹簧驱动,红区加辉光 */
    var ang = vuAngle(vuPos);
    var nx = Math.sin(ang), ny = -Math.cos(ang);
    ctx3.strokeStyle = ACID;
    ctx3.lineWidth = 1.4;
    ctx3.shadowColor = "rgba(58, 227, 92, .6)";
    ctx3.shadowBlur = vuPos > -3 ? 8 : 3;
    ctx3.beginPath();
    ctx3.moveTo(cx - nx * 6, cy - ny * 6);
    ctx3.lineTo(cx + nx * (R - 3), cy + ny * (R - 3));
    ctx3.stroke();
    ctx3.shadowBlur = 0;
    ctx3.fillStyle = ACID;
    ctx3.beginPath(); ctx3.arc(cx, cy, 3, 0, Math.PI * 2); ctx3.fill();
  }
  function vuStatic() {                    /* reduced-motion:定格 -19.6,只有刻度 */
    if (!ctx3) return;
    vuFit();
    vuPos = -19.6; vuVel = 0;
    vuDraw();
  }
  function vuMechResize() { if (!reduce) return; vuStatic(); reelsStatic(); }

  /* ============================================================
     R2 调谐拟真 —— dial 拖指针 + 白噪带通沙沙 + 吸附咔哒开播
     噪音链(独立支路):白噪 BufferSource(loop)→bandpass(Q1.2)→gain→destination
     复用 ensureGraph 的 ac,绝不另建 createMediaElementSource。
     ============================================================ */
  var nzBuf = null, nzSrc = null, nzFilt = null, nzGain = null, nzLive = 0;
  var dragging = false, dragP = 0, wasPlaying = false, snapTimer = 0;
  function noiseMapHz(f) {                 /* FM 88..108MHz → 800..3200Hz */
    return 800 + (Math.min(108, Math.max(88, f)) - 88) / 20 * 2400;
  }
  function noiseStart() {
    if (reduce || !ac || !ac.createBufferSource) return;
    noiseStop();
    try {
      if (!nzBuf) {                        /* 1s 白噪,random 填充,只造一次 */
        nzBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        var ch = nzBuf.getChannelData(0);
        for (var i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
      }
      nzSrc = ac.createBufferSource(); nzSrc.buffer = nzBuf; nzSrc.loop = true;
      nzFilt = ac.createBiquadFilter(); nzFilt.type = "bandpass"; nzFilt.Q.value = 1.2;
      nzFilt.frequency.value = noiseMapHz(LO + dragP / 100 * SPAN);
      nzGain = ac.createGain(); nzGain.gain.value = 0.0001;
      nzSrc.connect(nzFilt); nzFilt.connect(nzGain); nzGain.connect(ac.destination);
      var s0 = nzSrc, f0 = nzFilt, g0 = nzGain;
      nzSrc.onended = function () {        /* 兜底销毁:防 pointerup 丢失导致节点泄漏 */
        try { s0.disconnect(); f0.disconnect(); g0.disconnect(); } catch (e) {}
        if (nzSrc === s0) { nzSrc = nzFilt = nzGain = null; nzLive = 0; }
      };
      nzSrc.start();
      nzGain.gain.linearRampToValueAtTime(0.12, ac.currentTime + 0.035); /* 快淡入 */
      nzLive = 1;
    } catch (e) { nzSrc = nzFilt = nzGain = null; nzLive = 0; }
  }
  function noiseTrack(f) {
    if (!nzFilt || !ac) return;
    try { nzFilt.frequency.setTargetAtTime(noiseMapHz(f), ac.currentTime, 0.02); } catch (e) {}
  }
  function noiseStop() {
    if (!nzSrc || !ac) return;
    var s = nzSrc, fl = nzFilt, g = nzGain;
    nzSrc = nzFilt = nzGain = null; nzLive = 0;
    try {
      var t = ac.currentTime;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0.0001, t + 0.14);   /* 淡出 */
      s.stop(t + 0.18);
      s.onended = function () { try { s.disconnect(); fl.disconnect(); g.disconnect(); } catch (e) {} };
    } catch (e) {}
  }
  function clickClack() {                  /* 吸附「咔哒」(2026-11 重做,旧 220Hz 方波电子味):
     14ms bandpass 1.8k 噪声擦音当"咔"(触点碰击) + 三角体 160→70Hz 60ms 下坠当"哒"(旋钮落闩)。
     一次性短缓冲自己建自己摘,onended disconnect,与 fx.js 同一纪律 */
    if (reduce || !ac || !ac.createOscillator) return;
    try {
      var t = ac.currentTime;
      var len = Math.max(1, Math.floor(ac.sampleRate * 0.03));
      var buf = ac.createBuffer(1, len, ac.sampleRate);
      var ch = buf.getChannelData(0);
      for (var i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      var s = ac.createBufferSource(); s.buffer = buf;
      var bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800; bp.Q.value = 1.2;
      var g = ac.createGain();
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.014);
      s.connect(bp); bp.connect(g); g.connect(ac.destination);
      var o = ac.createOscillator(), og = ac.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(160, t);
      o.frequency.exponentialRampToValueAtTime(70, t + 0.06);
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(0.14, t + 0.004);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      o.connect(og); og.connect(ac.destination);
      o.onended = function () {
        try { o.disconnect(); og.disconnect(); s.disconnect(); bp.disconnect(); g.disconnect(); } catch (e) {}
      };
      s.start(t); s.stop(t + 0.04);
      o.start(t); o.stop(t + 0.1);
    } catch (e) {}
  }
  /* 读数滚动:tween 到目标频率(吸附期间) */
  var rollTimer = 0;
  function rollRead(from, to, ms) {
    if (rollTimer) w.clearInterval(rollTimer);
    if (reduce) { readout.textContent = fmt(to); return; }
    var t0 = +new Date();
    rollTimer = w.setInterval(function () {
      var p = Math.min(1, ((+new Date()) - t0) / ms);
      var e = 1 - (1 - p) * (1 - p);
      readout.textContent = fmt(from + (to - from) * e);
      if (p >= 1) { w.clearInterval(rollTimer); rollTimer = 0; }
    }, 30);
  }
  function nearestIdx(f) {
    var bi = 0, bd = 1e9;
    rows.forEach(function (r, k) {
      var dd = Math.abs(rowFreq(r) - f);
      if (dd < bd) { bd = dd; bi = k; }
    });
    return bi;
  }
  function dragApply(e) {
    var r = scale.getBoundingClientRect();
    dragP = Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100));
    needle.style.setProperty("--np", dragP.toFixed(3));
    var f = LO + dragP / 100 * SPAN;
    readout.textContent = fmt(f);
    noiseTrack(f);
  }
  function dragEnd(e) {
    if (!dragging) return;
    dragging = false;
    if (dialEl) dialEl.classList.remove("tuning");
    try { if (e && e.pointerId != null && dialEl && dialEl.releasePointerCapture && dialEl.hasPointerCapture(e.pointerId)) dialEl.releasePointerCapture(e.pointerId); } catch (_) {}
    var f = LO + dragP / 100 * SPAN;
    var idx = nearestIdx(f);
    var tf = rowFreq(rows[idx]);
    noiseStop();
    if (reduce) {
      needle.style.transition = "";        /* 减动效:瞬移定格,不留内联过渡 */
      needle.style.setProperty("--np", pct(tf).toFixed(3));
      rollRead(f, tf, 240);                /* rollRead 内部 reduce→直接定格 */
    } else {
      needle.style.transition = "left .24s var(--ease)";  /* 240ms 吸附滑动 */
      needle.style.setProperty("--np", pct(tf).toFixed(3));
      rollRead(f, tf, 240);
    }
    if (snapTimer) w.clearTimeout(snapTimer);
    snapTimer = w.setTimeout(function () {
      snapTimer = 0;
      needle.style.transition = "";
      clickClack();
      rows[idx].click();     /* 等效点频道行:loadPlay/togglePlay,复用全部既有链路 */
    }, reduce ? 0 : 260);
  }
  function dragCancel() {                  /* 滚动接管等异常中断:拨回当前台,不选台 */
    if (!dragging) return;
    dragging = false;
    if (dialEl) dialEl.classList.remove("tuning");
    noiseStop();
    var f0 = rowFreq(rows[curIdx >= 0 ? curIdx : 0]);
    needle.style.transition = "";
    setNeedle(f0, false);
    readout.textContent = fmt(f0);
  }
  function bindDrag() {
    if (!dialEl) return;
    dialEl.style.touchAction = "pan-y";    /* R4:纵向翻页交还浏览器(被接管时 pointercancel→dragCancel 收尾),横向仍归拖调谐 */
    var holdId = 0, holdX = 0, holdY = 0, holdTouch = false, holdRead = false;
    function startDrag(e, fromRead) {      /* fromRead:按下点是 LCD 读数窗,但横移已证明是调谐手势 */
      if (snapTimer) { w.clearTimeout(snapTimer); snapTimer = 0; }  /* 打断上一次未完成的吸附 */
      if (!fromRead && e.pointerType !== "touch") e.preventDefault();  /* 鼠标/笔:防文本选中与兼容事件。触屏绝不能拦——pointerdown 的 preventDefault 会连 pan-y 竖划翻页一起取消(Chromium 实测)。读数窗的接管发生在竖划已交还之后,再 preventDefault 反会打断手势,跳过 */
      dragging = true;
      try { dialEl.setPointerCapture(e.pointerId); } catch (_) {}
      dialEl.classList.add("tuning");
      needle.style.transition = "none";    /* 拖拽期间瞬移跟手 */
      wasPlaying = audioPlaying;
      if (audioPlaying && w.tape && w.tape.audio) w.tape.audio.pause(); /* 噪音接管,最小侵入:只 pause 不碰总线 */
      dragApply(e);
      noiseStart();
    }
    dialEl.addEventListener("pointerdown", function (e) {
      if (dragging) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      holdId = e.pointerId; holdX = e.clientX; holdY = e.clientY;
      holdTouch = e.pointerType === "touch";
      holdRead = !!(e.target && e.target.closest && e.target.closest(".dial-read"));
      if (!holdRead) startDrag(e, false);  /* 读数窗是 LCD:先握手不接管,纯竖划照常翻页;横移 >4px 由 move 升级为调谐 */
    });
    dialEl.addEventListener("pointermove", function (e) {
      if (dragging) { dragApply(e); return; }
      if (!holdId || e.pointerId !== holdId) return;
      if (!holdRead) return;               /* 没按在读数窗上却没进拖拽=已取消,不处理 */
      var dx = e.clientX - holdX, dy = Math.abs(e.clientY - holdY);
      if (Math.abs(dx) > 4 && dx >= dy) {   /* 横移主导:证明用户想调谐,读数窗也允许起步 */
        if (holdTouch) e.preventDefault();  /* 此刻取消已交还的 pan-y 竖划,改由 JS 接管 */
        holdId = 0;
        startDrag(e, true);
      } else if (dy > 8 || (Math.abs(dx) > 4 && dy > Math.abs(dx))) {
        holdId = 0;                         /* 竖划/斜上滑:判定为翻页意图,本手势彻底放行 */
      }
    });
    dialEl.addEventListener("pointerup", function (e) {
      if (!dragging && holdId && e.pointerId === holdId) { holdId = 0; return; }  /* 读数窗轻点:不选台不拖拽 */
      holdId = 0;
      dragEnd(e);
    });
    dialEl.addEventListener("pointercancel", function () { holdId = 0; dragCancel(); });
  }

  /* ---------- 调试钩子(Playwright 采样用) ---------- */
  w.__radioMech = {
    reelA: function () { return angL; },
    reelB: function () { return angR; },
    velA: function () { return velL; },
    vu: function () { return vuPos; },
    noise: function () { return nzLive; },
    drag: function () { return dragging; },
    rewinding: function () { return rewT; }
  };

  /* ---------- 开机:CH-01 定格 ---------- */
  setNeedle(rowFreq(rows[0]), true);
  readout.textContent = fmt(rowFreq(rows[0]));
  probeBitrate(rows[0]);
  buildCassette();                         /* R1 卡带(注入 .dial 与 .radio-grid 之间) */
  buildVu();                               /* R3 VU(scale 注入 .scope-box 底部) */
  bindDrag();                              /* R2 dial 拖拽调谐 */

  if (reduce) {
    /* 无 rAF:静态中线 + 一次定格图,resize 重画;机芯全静态 */
    reelsStatic();
    var once = function () {
      fit(); ctx2.clearRect(0, 0, W, H); drawWave();
      vuStatic();
    };
    w.addEventListener("resize", once);
    once();
  } else {
    if ("IntersectionObserver" in w) {
      new w.IntersectionObserver(function (es) {
        onScreen = es[0].isIntersecting;
        pump();
      }, { threshold: 0.02 }).observe(radioEl || cv);
    }
    d.addEventListener("visibilitychange", function () {
      onPage = !d.hidden;
      pump();
    });
    pump();
  }
})();
