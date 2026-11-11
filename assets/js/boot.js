/* ============================================================
   boot.js —— 启动序列（v3：气闸 → 泄压 → CRT 通电显像）

   1. 打 html.js 标记（渐进增强：无 JS 不隐藏 .rv）。
   2. 页间转场的到达侧收尾：head.html 内联脚本首绘前挂 html.wipeout，这里摘。
   3. 入场门（首页、每会话首次）：不再是黑墙，是半透明 HUD 气闸。
      门后舱内是活的——.fx 的网格地板/激光尘点/辉光/噪点/HUD 括号照常流动；
      内容被 html.gate-lock 扣在 opacity 0（见 10-base.css），所以看到的是
      "机器在转、灯还没开"。中央酸绿缝线是全屏唯一主光源：本体辉光 +
      上下巡扫高光 + 两侧压力刻度；真指针下鼠标靠近缝线能量会聚
      （--e / --my 两个变量，pointermove + rAF 节流写，不逐帧改 DOM）。
      自检日志每行都是当场取到的真读数，三扇真闸 DOM / FONTS / PAINT 各到位
      才计入进度；拿不到真值的行整行不显示，绝不编一个数。未就绪时提示
      FORCE ENTRY nn%——照样可点，点进去如实补一行 OVERRIDE。
   4. 点击 = 泄压：缝线爆闪（+0，同帧 fx.hiss() 一记 0.35s 白噪泄压）→ 两扇带刃口
      撕裂滑开（+100）→ 摘 gate-lock 并起跑 CRT 通电（+260，body.booting：屏幕中线
      炸出水平亮线 → 纵向撑开成全屏扫描纹 → 衰减交还内容，总 680ms）→ 亮线定住那刻
      广播 deck:sweep，fx.js 的粒子显影接力（+940 摘门）。旧版"门 → 四格绿幕假
      LOADING → 粒子"三段各演各的 ~3.5s，现在一条因果链 ~1.7s。
   5. 文案不瞬间替换：胶囊标签走 scramble()（乱码归位，占位符与目标一一对应所以宽度
      不跳），日志读数走 typeVal()（22cps 逐字打，打完才 .set 上酸绿）。

   契约（fx.js / _edge_ctl 消费，别动）：window.__deckBootDone + deck:boot-done 与
   window.__deckSweep + deck:sweep（扫描起跑线，粒子显影认这个，等 boot-done 会晚 1s）；
   sessionStorage deck-gate（门）/ deck-booted（扫描带）各管一段；
   .boot 节点名保留（50-sub.css 打印规则在用）。音效复用 fx.js 的 blip / hiss，
   这一击同时就是 fx.js 等的那个真实手势（环境音由它自己解锁）。
   ============================================================ */
(function () {
  var d = document, w = window, de = d.documentElement;
  de.classList.add("js");
  var reduced = w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePtr = w.matchMedia("(hover: hover) and (pointer: fine)").matches;

  try {
    if (sessionStorage.getItem("deck-wipe") === "1") {
      sessionStorage.removeItem("deck-wipe");
      if (!reduced) setTimeout(function () { de.classList.remove("wipeout"); }, 1200);
    }
  } catch (e) {}

  /* boot 完成广播：跳过动画的路径（reduced / 已 boot 过）同步即发，
     fx.js 早注册走事件、晚注册查旗标，两边都不会把显影卡死 */
  function bootDone() {
    if (w.__deckBootDone) return;
    w.__deckBootDone = true;
    try { d.dispatchEvent(new CustomEvent("deck:boot-done")); } catch (e) {}
  }

  /* ---------- 扫描通电（原四格绿幕 + LOADING 计数已删） ----------
     body.booting → .boot 的单条光带走一遍（10-base.css，680ms 顶到底）。
     走查教训（_entry_audit2）：显影若等 boot-done（原 240ms 后）再起跑，
     标题要 3.1s 才亮，光带扫过时是黑的——因果断线。所以这里在起带那一刻
     就广播 deck:sweep，粒子显影直接骑在光带上；boot-done 仍按原语义
     晚 200ms 发（幕布还没撕完就说"加载完成"是假信号）。 */
  var KEY = "deck-booted";
  function runSweep() {
    try {
      if (reduced || sessionStorage.getItem(KEY)) { bootDone(); return; }
      sessionStorage.setItem(KEY, "1");
    } catch (e) { bootDone(); return; }
    w.__deckSweep = true;
    try { d.dispatchEvent(new CustomEvent("deck:sweep")); } catch (e) {}
    d.body.classList.add("booting");
    setTimeout(bootDone, 200);
    setTimeout(function () { d.body.classList.remove("booting"); }, 760);
  }

  /* ---------- 入场气闸：每会话首次进站一次 ---------- */
  var GKEY = "deck-gate";
  var needGate = false;
  try { needGate = !reduced && location.pathname === "/" && !sessionStorage.getItem(GKEY); } catch (e) {}
  if (!needGate) { runSweep(); return; }

  function el(tag, cls, parent, text) {
    var n = d.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function ms() { return Math.round(w.performance && w.performance.now ? w.performance.now() : 0) + "ms"; }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- 故障语言机芯（手法来自 _lab.html 的 SCRAMBLE DECODE / REAL READOUT） ----------
     两条纪律：① 只走 textContent，不碰 DOM 结构（进度线是胶囊的子节点，
     整块 innerHTML 重写会把它拆掉——本会话踩过的坑）；
     ② rAF 节流到 ≤12fps，乱码闪烁要的是「糙」，不是每帧重排。 */
  var raf = w.requestAnimationFrame
    ? function (f) { w.requestAnimationFrame(f); }
    : function (f) { setTimeout(f, 16); };
  function clock() { return (w.performance && w.performance.now) ? w.performance.now() : +new Date(); }
  var GLYPHS = "!<>-/\\|(){}[]=+*~#\u00a7\u00a401";
  var CPS = 22; /* 归位速度：字符/秒，与 _lab.html 默认档一致 */

  /* 乱码归位：逐字揭示，未揭示的位置用随机符号占位（不是空格）——
     一一对应才不会改变文本宽度，居中的胶囊不会左右跳。
     scrToken 是代际号：走查实测两次归位在同一个节点上打架（FORCE ENTRY 刚落定，
     上一轮 SYSTEM CHECK 的循环又把它盖回去），新任务一进来就让旧循环作废。 */
  var scrNode = null, scrToken = 0;
  function scramble(node, target) {
    if (reduced) { node.textContent = target; return; }
    var t0 = clock(), last = -999;
    var mine = ++scrToken;
    scrNode = node;
    function step() {
      if (mine !== scrToken) return;
      var t = clock() - t0;
      if (t - last >= 80) {
        last = t;
        var reveal = Math.floor((t - 120) * CPS / 1000), out = "", rest = false;
        for (var c = 0; c < target.length; c++) {
          var ch = target.charAt(c);
          if (ch === " " || ch === "\u00b7") { out += ch; continue; }
          if (c < reveal) { out += ch; continue; }
          rest = true;
          out += GLYPHS.charAt((Math.floor(t / 45) + c * 7) % GLYPHS.length);
        }
        node.textContent = out;
        if (!rest) return;
      }
      raf(step);
    }
    raf(step);
  }

  /* 逐字打字：读数是一个字符一个字符打出来的，打完才落 .set（酸绿 + 锁存闪烁）。
     先占好整行宽度，打字过程中不推挤下面的行。 */
  function typeVal(row, node, txt, startDelay) {
    if (reduced) { node.textContent = txt; row.classList.add("set"); return; }
    setTimeout(function () {
      var t0 = clock(), n = 0;
      function step() {
        var want = Math.floor((clock() - t0) * 22 / 1000);
        if (want !== n) {
          n = want > txt.length ? txt.length : want;
          node.textContent = txt.slice(0, n);
        }
        if (n >= txt.length) { node.textContent = txt; row.classList.add("set"); return; }
        raf(step);
      }
      node.textContent = "";
      raf(step);
    }, startDelay || 0);
  }

  var gate = el("div", "gate", null);
  gate.setAttribute("role", "dialog");
  gate.setAttribute("aria-modal", "true");
  gate.setAttribute("aria-label", "入场气闸：点击或按任意键进入");
  gate.tabIndex = 0;
  el("i", "gate-c gate-l", gate);
  el("i", "gate-c gate-r", gate);
  /* 门后的机器：一层自带流动的透视地板。站里真地板 .grid-floor 的位移 --gf-y
     只由 deck.js 在滚动时写，待机时它是死的；幕布又糊了 9px，于是「机器在背后
     活着」这件事完全看不出来。这层画在幕布之上、仪表之下，摘门即消失，
     不去改 deck.js（别人区域）。 */
  el("i", "gate-depth", gate);
  var core = el("div", "gate-core", gate);
  el("i", "gate-rungs", core);
  el("i", "gate-seam", core);

  /* 自检日志：先立三扇真闸的占位行（值到位才改写），再补当场就能读到的真值 */
  var log = el("div", "gate-log", core);
  log.setAttribute("aria-hidden", "true");
  var rowN = 0;
  function logRow(key, val) {
    var r = el("span", "gl-row", log);
    r.style.setProperty("--r", rowN++);
    el("em", "gl-k", r, "> " + key);
    var v = el("b", "gl-v", r, "\u00b7\u00b7\u00b7");
    /* 静态行（值当场就有）跟着该行的淡入延迟一起起跑打字，读起来是「一行行通电」；
       三闸行的值晚到，set() 立即打字。打完才落 .set（酸绿 + 锁存闪）。 */
    if (val != null) typeVal(r, v, val, 600 + rowN * 130 - 130);
    return { set: function (txt) { typeVal(r, v, txt, 0); } };
  }

  var hint = el("div", "gate-hint", core);
  var ghTxt = el("span", "gh-txt", hint);
  /* 标签单独一个节点：sync() 要反复改文案，直接写 ghTxt.textContent 会把
     同一个父节点里的进度线一并清空（textContent 会拆掉所有子节点）。 */
  var ghLabel = el("span", "gh-label", ghTxt, "SYSTEM CHECK");
  /* 开机第一件事：标签自己乱码归位。只在文案真的变了才重跑，
     否则 sync() 每次上闸都闪一遍就成了抽搐不是解码。 */
  var curLabel = "";
  function setLabel(txt) {
    if (txt === curLabel) return;
    curLabel = txt;
    scramble(ghLabel, txt);
  }
  setLabel("SYSTEM CHECK");
  /* 进度线画在胶囊自己的底边上（不是悬空一根横杆）：走查教训——横杆与中缝
     交叉成一个「＋」字，配上满高刻度就像一根虾线。胶囊即仪表，读起来才是一体的。 */
  var bar = el("i", "gh-bar", ghTxt);
  bar.setAttribute("aria-hidden", "true");
  var ghStat = el("span", "gh-stat", hint, "");
  ghStat.setAttribute("aria-hidden", "true");

  var sig = { dom: false, font: false, paint: false };
  var rDom = logRow("DOM", null);
  var rFont = logRow("FONTS", null);
  var rPaint = logRow("PAINT", null);

  var lm = d.lastModified, dt = lm ? new Date(lm) : null;
  if (dt && !isNaN(+dt)) {
    logRow("BUILD", dt.getFullYear() + "." + pad2(dt.getMonth() + 1) + "." + pad2(dt.getDate()) +
      " " + pad2(dt.getHours()) + ":" + pad2(dt.getMinutes()));
  }
  logRow("VIEW", w.innerWidth + "\u00d7" + w.innerHeight + " @" + (w.devicePixelRatio || 1) + "x");
  var nav = w.navigator || {};
  if (nav.hardwareConcurrency) {
    logRow("CORE", nav.hardwareConcurrency + " THREADS" + (nav.deviceMemory ? " / " + nav.deviceMemory + "GB" : ""));
  }
  logRow("CARDS", String(d.querySelectorAll(".card").length));
  var sndOn = false;
  try { sndOn = localStorage.getItem("deck-snd") === "1"; } catch (e) {}
  logRow("AUDIO", (sndOn ? "ON" : "OFF") + " \u00b7 GESTURE");

  function sync() {
    var n = (sig.dom ? 1 : 0) + (sig.font ? 1 : 0) + (sig.paint ? 1 : 0);
    var pct = Math.round(n / 3 * 100);
    gate.style.setProperty("--ready", (n / 3).toFixed(3));
    if (n === 3) {
      hint.classList.add("live");
      setLabel("CLICK TO ENTER");
      ghStat.textContent = "SYSTEMS NOMINAL \u25aa " + ms();
    } else {
      setLabel("FORCE ENTRY");
      ghStat.textContent = "CHECK " + ("00" + pct).slice(-3) + "%";
    }
  }

  /* 闸 1 · DOM：readyState 真到 complete 才算，读数是从导航起算的毫秒 */
  function domHit() {
    if (sig.dom) return;
    sig.dom = true;
    rDom.set("COMPLETE " + ms());
    sync();
  }
  if (d.readyState === "complete") setTimeout(domHit, 0);
  w.addEventListener("load", domHit);

  /* 闸 2 · FONTS：document.fonts.ready（Anton 是真 webfont，没落地就是没落地）；
     没有 FontFaceSet 的浏览器不装等待，如实标 NATIVE */
  if (d.fonts && d.fonts.ready && d.fonts.ready.then) {
    d.fonts.ready.then(function () {
      if (sig.font) return;
      sig.font = true;
      rFont.set((d.fonts.status || "loaded").toUpperCase() + " " + ms());
      sync();
    }, function () {
      if (sig.font) return;
      sig.font = true;
      rFont.set("FALLBACK");
      sync();
    });
  } else {
    sig.font = true;
    rFont.set("NATIVE");
    sync();
  }

  /* 闸 3 · PAINT：first-contentful-paint 的真时间戳；取不到 paint 计时
     就退一帧"画面真呈现过"，读数写 PRESENTED，不冒充 FCP */
  function paintHit(txt) {
    if (sig.paint) return;
    sig.paint = true;
    rPaint.set(txt);
    sync();
  }
  var paintKnown = false;
  try {
    var legacy = d.getEntriesByName && d.getEntriesByName("first-contentful-paint");
    if (legacy && legacy.length) {
      paintKnown = true;
      paintHit("FCP " + Math.round(legacy[0].startTime) + "ms");
    }
  } catch (e) {}
  if (!paintKnown && w.PerformanceObserver) {
    try {
      var po = new w.PerformanceObserver(function (list) {
        var es = list.getEntries();
        for (var i = 0; i < es.length; i++) {
          if (es[i].name !== "first-contentful-paint") continue;
          try { po.disconnect(); } catch (e) {}
          paintHit("FCP " + Math.round(es[i].startTime) + "ms");
          return;
        }
      });
      po.observe({ type: "paint", buffered: true });
      paintKnown = true;
    } catch (e) { paintKnown = false; }
  }
  if (!paintKnown) w.requestAnimationFrame(function () { paintHit("PRESENTED"); });

  /* ---------- 鼠标能量：只有真指针才挂，缝线辉光/刻度点亮随距离聚散 ---------- */
  var px = w.innerWidth / 2, py = w.innerHeight / 2, queued = false, hot = false, opened = false;
  function applyEnergy() {
    queued = false;
    if (opened) return;
    var half = w.innerWidth / 2 || 1;
    var near = Math.max(0, 1 - (Math.abs(px - half) / half) * 1.35);
    var e2 = near * near;
    gate.style.setProperty("--e", e2.toFixed(3));
    gate.style.setProperty("--my", ((py / (w.innerHeight || 1)) * 100).toFixed(1) + "%");
    var nowHot = near > 0.9;
    if (nowHot && !hot && w.fx && w.fx.blip) w.fx.blip("hover");
    hot = nowHot;
  }
  function onMove(e) {
    px = e.clientX; py = e.clientY;
    if (!queued) { queued = true; w.requestAnimationFrame(applyEnergy); }
  }
  if (finePtr) d.addEventListener("pointermove", onMove, { passive: true });
  sync();

  /* ---------- 泄压 → 撕裂开幕 → CRT 通电显像 ---------- */
  function enter() {
    if (opened) return;
    opened = true;
    clearTimeout(guard);
    d.removeEventListener("keydown", onKey);
    if (finePtr) d.removeEventListener("pointermove", onMove);
    gate.style.pointerEvents = "none";
    try { sessionStorage.setItem(GKEY, "1"); } catch (e) {}
    if (w.fx && w.fx.blip) w.fx.blip("up");
    var done = (sig.dom ? 1 : 0) + (sig.font ? 1 : 0) + (sig.paint ? 1 : 0);
    if (done < 3) logRow("OVERRIDE", "ENTER AT " + Math.round(done / 3 * 100) + "%");
    gate.classList.add("armed");
    /* 泄压那一声跟视觉同帧起（blip("up") 是机械锁扣的「咔」，hiss 是气从缝里挤出的「嗞——」）。
       只在 deck-snd 开着时响，fx.js 内部判；点门这一下本身就是解锁手势，所以 ctx 建得起来。 */
    if (w.fx && w.fx.hiss) w.fx.hiss();
    setTimeout(function () {
      gate.classList.add("open");
      de.classList.add("gate-open");
    }, 100);
    /* 260ms：幕布刚撕开一道缝（滑开全程 780ms），此刻放行内容 + 起跑 CRT 通电。
       刻意与开幕重叠而不是排队——观众看到的是「缝里透出亮线 → 画面炸开 → 内容逐级通电」
       一条连续动作，不是三段动画轮着上。
       走查教训：原 560ms 时 350ms 那一帧是「幕布没了 + 首页全黑」的空洞。 */
    setTimeout(function () {
      de.classList.remove("gate-lock");
      runSweep();
    }, 260);
    setTimeout(function () {
      if (gate.parentNode) gate.parentNode.removeChild(gate);
      de.classList.remove("gate-open");
    }, 940);
  }
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    enter();
  }
  /* 兜底：万一有什么卡住（异常/后台标签页计时器被挂起），12s 后先把内容放行，
     绝不能让整个首屏扣在 opacity 0；门仍然可点，走正常时间线 */
  var guard = setTimeout(function () { de.classList.remove("gate-lock"); }, 12000);
  gate.addEventListener("click", enter);
  d.addEventListener("keydown", onKey);
  d.documentElement.classList.add("gate-lock");
  d.body.appendChild(gate);
  try { gate.focus({ preventScroll: true }); } catch (e) { gate.focus(); }
})();
