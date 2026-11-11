/* ============================================================
 * proj.js — 05 WORKS 放映机灯箱（W1）
 *   点击带 data-shots 的 .work-row → preventDefault，全屏灯箱看 README 原图：
 *   大图 max-height 82vh 原始分辨率居中，右列 name / sub / tech / 行内 .wr-stats
 *   读数 / GITHUB 按钮 / CLOSE；多图时底部缩略条，←→ 切换，Esc / 点遮罩关闭。
 *   数据来源：行上 data-shots（Hugo 由 products.yml shots 渲染，逗号分隔，relURL）。
 *   打开期间：锁 .deck 滚动；document 捕获层吞掉全部按键（deck.js 的方向键换卡
 *   不会在灯箱里生效，不依赖也不修改它的监听）；焦点入灯箱、Tab 困在灯箱、
 *   关闭归还触发行。行无 shots 或有修饰键 → 不拦截，保留 <a> 原导航兜底。
 *   样式全在 42-works.css（.pj-* / .wr-glint），reduced-motion 双轨降级。
 *   约定同其他引擎：零依赖 IIFE，window.proj 命名空间。
 * ============================================================ */
(function () {
  "use strict";

  var d = document;
  var cur = null; // { row, box, img, readout, count, thumbsBox, wait, shots, n, idx, name, deck, prevOv }

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function mk(tag, cls, txt) {
    var e = d.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function p2(n) { return (n < 10 ? "0" : "") + n; }

  function shotsOf(row) {
    var raw = (row.getAttribute("data-shots") || "").split(",");
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var s = raw[i].trim();
      if (s) out.push(s);
    }
    return out;
  }

  /* ---------- 切图 ---------- */

  function show(i) {
    var c = cur;
    if (!c) return;
    c.idx = i;
    var img = c.img;
    img.onload = function () {
      if (cur !== c || c.idx !== i) return;          // 快速连按 ←→ 时丢弃过期回调
      img.classList.add("pj-ok");
      c.readout.textContent = "SHOT " + p2(i + 1) + " / " + p2(c.n) +
        " · " + img.naturalWidth + "×" + img.naturalHeight + "PX";
      preload(i + 1); preload(i - 1);
    };
    img.onerror = function () {
      if (cur !== c || c.idx !== i) return;          // 被新 src 取代的 abort 不误报
      c.readout.textContent = "✕ SOURCE MISSING · " + c.shots[i];
    };
    img.alt = c.name + " 截图 " + p2(i + 1) + " / " + p2(c.n);
    img.src = c.shots[i];
    if (img.complete && img.naturalWidth) img.onload();  // 缓存命中不再触发 onload 的兜底
    c.count.textContent = p2(i + 1) + " / " + p2(c.n);
    var ts = c.thumbsBox.children;
    for (var j = 0; j < ts.length; j++) ts[j].classList.toggle("on", j === i);
  }
  function step(dir) {
    var c = cur;
    if (c && c.n > 1) show((c.idx + dir + c.n) % c.n);
  }
  function preload(i) {
    var c = cur;
    if (!c || c.n < 2) return;
    new Image().src = c.shots[(i + c.n) % c.n];
  }

  function mkThumb(src, j) {
    var b = mk("button", "pj-thumb");
    b.type = "button";
    b.setAttribute("aria-label", "查看截图 " + p2(j + 1));
    var im = mk("img");
    im.src = src;
    im.alt = "";
    im.loading = "lazy";
    im.onload = function () {
      b.style.aspectRatio = im.naturalWidth + " / " + im.naturalHeight;  // 竖屏缩略不挤压
    };
    b.appendChild(im);
    b.addEventListener("click", function () { show(j); });
    return b;
  }

  /* ---------- 开 / 关 ---------- */

  function open(row) {
    var shots = shotsOf(row);
    if (!shots.length) return;
    cur = { row: row, shots: shots, n: shots.length, idx: 0,
            name: (row.querySelector(".wr-name") || {}).textContent || "PROJECT" };

    var box = mk("div", "pj");
    box.tabIndex = -1;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", cur.name + " 放映灯箱");
    cur.box = box;

    var scrim = mk("div", "pj-scrim");
    scrim.addEventListener("click", close);
    box.appendChild(scrim);

    /* 左列：舞台 + 底部读数/缩略条 */
    var frame = mk("div", "pj-frame");
    var colMain = mk("div", "pj-col-main");
    var stage = mk("div", "pj-stage");
    var wait = mk("div", "pj-wait mono", "LOADING");
    var img = mk("img", "pj-img");
    cur.img = img;
    stage.appendChild(img);
    stage.appendChild(wait);
    stage.addEventListener("click", function (e) {
      if (e.target !== img && e.target !== stage) return;  // 大图/空白区点击=下一张（单图=关）
      if (cur && cur.n > 1) step(1); else close();
    });
    colMain.appendChild(stage);

    var bar = mk("div", "pj-bar");
    cur.readout = mk("p", "pj-read mono", "LOADING…");
    bar.appendChild(cur.readout);
    cur.thumbsBox = mk("div", "pj-thumbs");
    if (shots.length > 1) {
      for (var j = 0; j < shots.length; j++) cur.thumbsBox.appendChild(mkThumb(shots[j], j));
    }
    bar.appendChild(cur.thumbsBox);
    colMain.appendChild(bar);
    frame.appendChild(colMain);

    /* 右列：作品档案 */
    var meta = mk("div", "pj-meta");
    var noEl = row.querySelector(".wr-no");
    meta.appendChild(mk("p", "pj-kicker mono", "PROJECT" + (noEl ? " · " + noEl.textContent : "")));
    var h2 = mk("h2", "pj-name", cur.name);
    meta.appendChild(h2);
    var subEl = row.querySelector(".wr-sub");
    if (subEl) meta.appendChild(mk("p", "pj-sub", subEl.textContent));
    var techEl = row.querySelector(".wr-tech");
    if (techEl) meta.appendChild(mk("p", "pj-tech mono", techEl.textContent));
    var statsEl = row.querySelector(".wr-stats");   // 行内实时读数：有实数据才克隆（骨架屏不要）
    if (statsEl && statsEl.children.length && !statsEl.querySelector(".ws-skel")) {
      var st = mk("p", "pj-stats");
      st.appendChild(statsEl.cloneNode(true));
      meta.appendChild(st);
    }
    cur.count = mk("p", "pj-count mono", "");
    meta.appendChild(cur.count);
    var acts = mk("div", "pj-acts");
    var gh = mk("a", "pj-btn pj-open", "GITHUB ↗");
    gh.href = row.href;
    gh.target = "_blank";
    gh.rel = "noopener";
    var cb = mk("button", "pj-btn pj-close", "CLOSE · ESC");
    cb.type = "button";
    cb.addEventListener("click", close);
    acts.appendChild(gh);
    acts.appendChild(cb);
    meta.appendChild(acts);
    frame.appendChild(meta);
    box.appendChild(frame);

    /* 锁甲板滚动 + 挂载（进场淡入微浮：.on 类交给 CSS 过渡） */
    var deck = d.querySelector(".deck");
    if (deck) {
      cur.deck = deck;
      cur.prevOv = deck.style.overflow;
      deck.style.overflow = "hidden";
    }
    d.body.appendChild(box);
    requestAnimationFrame(function () {
      box.classList.add("on");
      if (img.complete && img.naturalWidth) wait.remove();
      else img.addEventListener("load", function once() { wait.remove(); img.removeEventListener("load", once); });
    });
    show(0);
    box.focus({ preventScroll: true });
  }

  function close() {
    var c = cur;
    if (!c) return;
    cur = null;
    if (c.deck) c.deck.style.overflow = c.prevOv || "";
    var box = c.box;
    box.classList.remove("on");
    if (reduced()) box.remove();
    else setTimeout(function () { box.remove(); }, 520);   // 盖住 CSS .4s 退场
    if (c.row && c.row.isConnected) c.row.focus({ preventScroll: true });
  }

  /* ---------- 全局监听（捕获层，见文件头说明） ---------- */

  function onKey(e) {
    if (!cur) return;
    e.stopPropagation();   // 灯箱开着：按键不外泄（deck.js 在 document 冒泡层的换卡不吃它）
    var k = e.key;
    if (k === "Escape") { e.preventDefault(); close(); return; }
    if (k === "ArrowRight") { e.preventDefault(); step(1); return; }
    if (k === "ArrowLeft") { e.preventDefault(); step(-1); return; }
    if (k === "Tab") {     // 焦点困在灯箱：容器/首尾来回卷
      var list = cur.box.querySelectorAll("a[href], button");
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && (d.activeElement === first || d.activeElement === cur.box)) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && d.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  function onClick(e) {
    if (cur || e.defaultPrevented || e.button !== 0) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;  // 修饰键＝用户要新开标签，放行
    var row = e.target && e.target.closest ? e.target.closest("#c-works .work-row") : null;
    if (!row) return;
    if (!shotsOf(row).length) return;   // 无数据兜底：保留 <a> 原导航（同标签直开仓库）
    e.preventDefault();
    open(row);
  }

  d.addEventListener("keydown", onKey, true);
  d.addEventListener("click", onClick);

  window.proj = {
    open: function (row) { if (row && !cur) open(row); },
    close: function () { if (cur) close(); },
    next: function () { step(1); },
    prev: function () { step(-1); }
  };
})();
