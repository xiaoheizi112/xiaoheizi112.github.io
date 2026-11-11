/* ============================================================
   deck.js —— 卡片甲板引擎（Phase 0；2026-11 自然滑动改版）
   进度点 / underlay 导航胶囊（滑动定位 + hover 预览）/ 滚动驱动
   连续纵深 + 视差层 + 网格地板跟速 + 顶部 rail 进度 / 进场揭示与
   错峰 / [data-scroll] 锚点 / 3D 倾斜 / 数字滚动 / hash 直达
    2026-11 R4：缝合地平线（卡顶 .seam 边界线，rAF 写 --sg 点燃度）+
    频道调谐换台（setActive 瞬间入场卡 .tuning 静电抖动、HUD 跳字、
    fx.blip("tune")；600ms 冷却；reduced 全跳、touch 只留 HUD 跳字）
   子页（无 .deck）自动跳过，只留 dots 空转。
   已退役：scroll-snap 吸附、.tucked 阶梯姿态、键盘整卡跳转、拖拽换卡。
   ============================================================ */
(function () {
  var d = document, w = window;
  var reduced = w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch = w.matchMedia("(pointer: coarse)").matches;
  var deck = d.getElementById("deck");
  var cards = [].slice.call(d.querySelectorAll(".card"));
  if (!deck || !cards.length) { w.deck = { go: function () {}, cards: [] }; return; }

  /* ---------- 错峰索引：卡内 .rv 依次 --i ---------- */
  cards.forEach(function (c) {
    [].forEach.call(c.querySelectorAll(".rv"), function (el, i) {
      el.style.setProperty("--i", i);
    });
  });

  /* ---------- 进度点 + underlay 导航胶囊 ---------- */
  var dotsBox = d.querySelector(".dots");
  var dots = [];
  var under = null;      /* .dot-under：常驻描边小胶囊，垫在 dot 行背后滑动定位 */
  var underEl = null;    /* hover 预览目标；null = 跟随 active */
  var lastIdx = -1;      /* 上一次 active 下标：换卡时给旧卡挂 .tucked、胶囊归位 */
  function moveUnder(el) {
    if (!under || !el) return;
    /* rect 差保留小数：dot 行距实测 29.5px（10px × 1.75 行高 + 12px gap 的
       小数步长），offsetTop 只给整数会逐行累积 0.5px 错位 */
    var er = el.getBoundingClientRect();
    if (!er.height) return; /* 窄屏 .dots 收起时跳过 */
    var br = dotsBox.getBoundingClientRect();
    under.style.setProperty("--uy", (er.top - br.top).toFixed(2) + "px");
    under.style.setProperty("--uh", er.height.toFixed(2) + "px");
  }
  function underSync() { moveUnder(underEl || dots[lastIdx] || dots[0]); }
  if (dotsBox) {
    under = d.createElement("span");
    under.className = "dot-under";
    under.setAttribute("aria-hidden", "true");
    dotsBox.insertBefore(under, dotsBox.firstChild);
    cards.forEach(function (c, i) {
      var b = d.createElement("button");
      b.className = "dot";
      b.type = "button";
      b.textContent = c.getAttribute("data-num") || ("0" + (i + 1)).slice(-2);
      b.addEventListener("click", function () { go(i); });
      b.title = "CH." + b.textContent + " · " + (c.getAttribute("data-name") || "");
      dotsBox.appendChild(b);
      dots.push(b);
    });
    /* hover 预览：pointerover 冒泡到容器接管，离开导航回 active 位。
       触屏没有真 hover，不绑（与 tilt/拖拽同一 pointer:coarse 策略）。 */
    if (!touch) {
      dotsBox.addEventListener("pointerover", function (e) {
        var b = e.target && e.target.closest ? e.target.closest(".dot") : null;
        if (!b) return;
        underEl = b;
        moveUnder(b);
      });
      dotsBox.addEventListener("pointerleave", function () {
        underEl = null;
        underSync();
      });
    }
    moveUnder(dots[0]);
    /* 字体到位/窗口变化会挪 dot 行高：load 与 resize（rAF 节流）各补一次定位 */
    w.addEventListener("load", underSync);
    var uTick = false;
    w.addEventListener("resize", function () {
      if (uTick) return;
      uTick = true;
      requestAnimationFrame(function () { uTick = false; underSync(); });
    });
  }

  function activeIndex() {
    for (var i = 0; i < cards.length; i++) if (cards[i].classList.contains("active")) return i;
    return 0;
  }
  function go(i) {
    i = Math.max(0, Math.min(cards.length - 1, i));
    deck.scrollTo({ top: cards[i].offsetTop, behavior: reduced ? "auto" : "smooth" });
  }
  w.deck = { go: go, cards: cards, activeIndex: activeIndex };

  /* ---------- 揭示 + active + 进度点同步 ---------- */
  /* active 唯一入口：驱动进度点/胶囊/章节 HUD。姿态纵深已交给逐帧
     scrollFX 连续通道，.active 只作状态标记（无 CSS 消费）。 */
  /* R4 · 换台状态：冷却时戳 + HUD 调谐指针乱码滚动 */
  var tuneAt = 0, scrambleIv = 0;
  function hudScramble(text) {
    if (scrambleIv) w.clearInterval(scrambleIv);
    var t0 = w.performance.now();
    scrambleIv = w.setInterval(function () {
      if (w.performance.now() - t0 > 150) {
        w.clearInterval(scrambleIv); scrambleIv = 0;
        chapNoEl.textContent = text;
        return;
      }
      chapNoEl.textContent = "CH." + ("0" + (1 + Math.floor(Math.random() * cards.length))).slice(-2);
    }, 40);
  }
  function setActive(idx) {
    if (idx < 0 || idx === lastIdx) return;
    var first = lastIdx < 0;
    cards.forEach(function (x, i) {
      x.classList.toggle("active", i === idx);
    });
    dots.forEach(function (b, i) { b.classList.toggle("on", i === idx); });
    var c = cards[idx];
    var chapText = "CH." + (c.getAttribute("data-num") || "01");
    if (chapNoEl) {
      if (reduced || first) chapNoEl.textContent = chapText;
      else hudScramble(chapText);
      chapNameEl.textContent = c.getAttribute("data-name") || "";
    }
    /* R4 · 频道调谐换台：入场卡 .tuning 静电抖动 240ms + 换台 blip。
       600ms 冷却窗防快速往复连环触发；reduced 全跳；touch 只留 HUD 跳字。 */
    if (!first && !reduced && !touch) {
      var now = w.performance.now();
      if (now - tuneAt >= 600) {
        tuneAt = now;
        c.classList.add("tuning");
        setTimeout(function () { c.classList.remove("tuning"); }, 240);
        if (w.fx) w.fx.blip("tune");
      }
    }
    /* AMB-REACT · 换卡泄压脉冲：进新卡给背景一口能量（fx.js 指数衰减写 --pulse，
       地板拱一下 + 暗角收放 + 激光闪）。触屏也给——纯 JS 变量无鼠标层，成本零。 */
    if (!first && !reduced && w.fx && w.fx.pulse) w.fx.pulse(0.9);
    /* AMB-REACT R5 按卡增益：电台卡满档、hero 略收、作品 0.8、文字重的卡压到
       0.6 保阅读安静；目标值交 fx.js 平滑插值，切卡背景强度不跳变。 */
    if (w.fx && w.fx.ambCard) {
      var ambNum = c.getAttribute("data-num");
      w.fx.ambCard(ambNum === "04" ? 1 : ambNum === "01" ? 0.85 : ambNum === "06" ? 0.8 : 0.6);
    }
    var hint = d.querySelector(".scroll-hint");
    if (hint && idx > 0) hint.classList.add("gone");

    if (!underEl) moveUnder(dots[idx]);
    lastIdx = idx;
  }
  var counted = {};
  function countUp(el) {
    var to = parseFloat(el.getAttribute("data-count")) || 0;
    if (reduced) { el.textContent = to; return; }
    var t0 = w.performance.now(), dur = 1100;
    (function step(t) {
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var c = en.target;
      if (en.intersectionRatio > 0.26) {
        c.classList.add("on");
        var idx = cards.indexOf(c);
        if (!counted[idx]) {
          counted[idx] = 1;
          [].forEach.call(c.querySelectorAll("[data-count]"), countUp);
        }
      }
    });
  }, { root: deck, threshold: [0, 0.26] });
  cards.forEach(function (c) { io.observe(c); });

  /* 兜底：IO 首帧回调可能晚于绘制（直达 hash / 程序化滚动 / 恢复滚动位置），
     手动把视口内的卡标成 .on，防内容停在 opacity 0 */
  function revealPass() {
    var top = deck.scrollTop, vh = deck.clientHeight;
    cards.forEach(function (c) {
      if (c.offsetTop < top + vh && c.offsetTop + c.offsetHeight > top) c.classList.add("on");
    });
  }
  setTimeout(revealPass, 120);
  setTimeout(revealPass, 1400);
  w.addEventListener("load", revealPass);

  /* ---------- [data-scroll] 锚点（常驻 CONTACT 胶囊等） ---------- */
  d.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("[data-scroll]") : null;
    if (!a) return;
    var id = (a.getAttribute("href") || "").replace(/^.*#/, "");
    var el = id && d.getElementById(id);
    if (!el) return;
    e.preventDefault();
    if (cards.indexOf(el) > -1) go(cards.indexOf(el));
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }, true);

  /* ---------- hash 直达 ---------- */
  if (location.hash) {
    var hc = d.getElementById(location.hash.slice(1));
    if (hc && cards.indexOf(hc) > -1) setTimeout(function () { go(cards.indexOf(hc)); }, 60);
  }

  /* ---------- 记住停留位（子页 HOME 胶囊的落点，见 fx.js / chrome.html） ----------
     离开首页那一刻把当前 active 卡的 id 存进 sessionStorage：pagehide 覆盖
     点链接跳子页与关标签，visibilitychange 覆盖切后台/切标签（此时不一定 unload）。
     只在首页跑（deck.js 无 #deck 会提前 return），子页读到的是最后一次的记录。 */
  var SPOT_KEY = "deck-spot";
  function rememberSpot() {
    var c = cards[activeIndex()];
    if (!c || !c.id) return;
    try { sessionStorage.setItem(SPOT_KEY, c.id); } catch (err) {}
  }
  w.addEventListener("pagehide", rememberSpot);
  d.addEventListener("visibilitychange", function () { if (d.hidden) rememberSpot(); });

  /* ---------- 键盘/拖拽换卡已退役（2026-11 站主令：自然滑动） ----------
     原生滚动接管；点导航胶囊与 [data-scroll] 锚点仍走 go() 平滑跳转。 */

  /* ---------- 卡片 3D 倾斜 ---------- */
  if (!touch && !reduced) {
    [].forEach.call(d.querySelectorAll("[data-tilt]"), function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(720px) rotateX(" + (-py * 5).toFixed(2) + "deg) rotateY(" + (px * 6).toFixed(2) + "deg) translateZ(8px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- 灵感第一批（2026-11 画廊） ---------- */

  /* 四角 HUD：左下滚动百分比（rAF 节流的 scroll 读数） */
  var hudPct = d.getElementById("hud-pct");
  var chapNoEl = d.getElementById("chap-no");
  var chapNameEl = d.getElementById("chap-name");
  if (hudPct) {
    var pctTick = false;
    var pctUpd = function () {
      pctTick = false;
      var max = deck.scrollHeight - deck.clientHeight;
      var p = max > 0 ? Math.round((deck.scrollTop / max) * 100) : 0;
      hudPct.textContent = ("00" + p).slice(-3) + "%";
    };
    deck.addEventListener("scroll", function () {
      if (!pctTick) { pctTick = true; requestAnimationFrame(pctUpd); }
    }, { passive: true });
    pctUpd();
  }

  /* 巨型编号水印 + NN/07 角注（01 屏不加水印，别和 hero 巨字打架） */
  var totalPad = ("0" + cards.length).slice(-2);
  cards.forEach(function (c, i) {
    var num = c.getAttribute("data-num") || ("0" + (i + 1)).slice(-2);
    if (i > 0) {
      var wmark = d.createElement("span");
      wmark.className = "card-no";
      wmark.setAttribute("aria-hidden", "true");
      wmark.textContent = num;
      wmark.setAttribute("data-par", "70");
      c.insertBefore(wmark, c.firstChild);
    }
    var meta = d.createElement("span");
    meta.className = "card-meta";
    meta.setAttribute("aria-hidden", "true");
    meta.textContent = num + "/" + totalPad;
    c.appendChild(meta);
  });

  /* ---------- R4 · 缝合地平线：每张卡（除首卡）顶部注入 .seam 边界发丝线。
     线随卡走（吃卡的纵深 transform/opacity），rAF 按「边界距视口中线」写
     --sg 点燃度；reduced 时 JS 不写，CSS 固定半亮（见 90-media）。 ---------- */
  var seams = [];
  cards.forEach(function (c, i) {
    if (i === 0) return;
    var s = d.createElement("div");
    s.className = "seam";
    s.setAttribute("aria-hidden", "true");
    var lab = d.createElement("b");
    lab.textContent = "CH." + (cards[i - 1].getAttribute("data-num") || ("0" + i).slice(-2)) +
      " ▸ CH." + (c.getAttribute("data-num") || ("0" + (i + 1)).slice(-2));
    s.appendChild(lab);
    c.insertBefore(s, c.firstChild);
    seams.push({ el: s, card: c });
  });

  /* ---------- 连续滚动驱动引擎（自然滑动，2026-11） ----------
     单条 rAF：滚动时逐帧算每张卡心相对视口心的归一化偏移 pv（-1 上方 / 0 居
     中 / +1 下方），写 --rk-* 做连续纵深（沉/缩/压暗，无阶梯无 transition，
     跟手如实体堆叠）；[data-par] 层写 --py 做视差漂移（水印 70 / hero 36 /
     行式标题 28）；网格地板 --gf-y 随全程进度下沉；body 尾挂 .scroll-rail
     顶部进度发丝线（scaleX 跟进度）。reduced：只留 active 判定与 rail 读数，
     姿态/视差/地板全部跳过（CSS 变量取默认 = 全平）。 */
  var par = [];
  cards.forEach(function (c) {
    var hl = c.querySelector(".hero-lines");
    if (hl) { hl.setAttribute("data-par", "36"); par.push({ el: hl, sp: 36, card: c }); }
    var rh = c.querySelector(".row-head");
    if (rh) { rh.setAttribute("data-par", "28"); par.push({ el: rh, sp: 28, card: c }); }
    [].forEach.call(c.querySelectorAll(".card-no"), function (wn) {
      par.push({ el: wn, sp: 70, card: c });
    });
  });
  var railFill = null;
  var railEl = d.createElement("div");
  railEl.className = "scroll-rail";
  railEl.setAttribute("aria-hidden", "true");
  railFill = d.createElement("i");
  railEl.appendChild(railFill);
  d.body.appendChild(railEl);
  var floor = d.querySelector(".grid-floor");
  var tick = false;
  function scrollStep() {
    tick = false;
    var vh = deck.clientHeight || 1;
    var mid = deck.scrollTop + vh / 2;
    var max = deck.scrollHeight - deck.clientHeight;
    var prog = max > 0 ? deck.scrollTop / max : 0;
    if (railFill) railFill.style.transform = "scaleX(" + prog.toFixed(4) + ")";
    var best = 0, bd = 1e9;
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var cc = c.offsetTop + c.offsetHeight / 2;
      var dm = Math.abs(cc - mid);
      if (dm < bd) { bd = dm; best = i; }
      if (reduced) continue;
      var pv = Math.max(-1.2, Math.min(1.2, (cc - mid) / vh));
      var ad = Math.min(Math.abs(pv), 1);
      c.style.setProperty("--rk-ty", (pv * 6).toFixed(2) + "%");
      c.style.setProperty("--rk-sc", (1 - ad * 0.06).toFixed(4));
      c.style.setProperty("--rk-op", (1 - ad * 0.45).toFixed(3));
    }
    /* R4 · 缝合地平线点燃度：边界线（卡顶）距视口中线越近越亮，0.55 屏外全灭 */
    if (!reduced) {
      for (var j = 0; j < seams.length; j++) {
        var sg = 1 - Math.min(Math.abs(seams[j].card.offsetTop - mid) / (vh * 0.55), 1);
        seams[j].el.style.setProperty("--sg", sg.toFixed(3));
      }
    }
    setActive(best);
    if (reduced) return;
    if (floor) floor.style.setProperty("--gf-y", (30 - prog * 60).toFixed(1) + "px");
    for (var k = 0; k < par.length; k++) {
      var L = par[k];
      var p = (L.card.offsetTop + L.card.offsetHeight / 2 - mid) / vh;
      L.el.style.setProperty("--py", (-p * L.sp).toFixed(1) + "px");
    }
  }
  function kick() { if (!tick) { tick = true; requestAnimationFrame(scrollStep); } }
  deck.addEventListener("scroll", kick, { passive: true });
  w.addEventListener("resize", kick);
  scrollStep();

  /* 站龄 ONLINE DAY：服务端已按 home.yml online_since 直出构建日真值（无 JS 即成品）；
     这里每次访问用当前时间重算校正跨天漂移。取不到真值（缺属性/非法日期/负数）就保留服务端值。 */
  var sd = d.getElementById("site-days");
  if (sd) {
    var sn = Date.parse(sd.getAttribute("data-since") + "T00:00:00Z");
    if (!isNaN(sn)) {
      var days = Math.floor((Date.now() - sn) / 864e5);
      if (days >= 0 && days <= 9999) sd.textContent = ("00" + days).slice(-3);
    }
  }
})();
