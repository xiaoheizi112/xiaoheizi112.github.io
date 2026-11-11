/* ============================================================
   htop.js —— 05 INTERESTS「生活进程表」交互引擎（2026-11 方案 A + 心跳）
   零依赖。契约（勿改名，样式在 40-cards.css）：
     #htop-rows 行容器 / .htop-row 行（data-name/desc/state/cpu/mem/up）/
     #hob-sort 按钮（点击循环 SORT·CPU→MEM→UPTIME→NAME）/
     #htop-hint 详情文案 / #htop-wave 波形（data-wave 换档）/
     #hm-tasks #hm-load 表头聚合读数（服务端渲染真种子，心跳接管后写活值）。
   心跳（2026-11 站主批准）：setInterval 1500ms 离散 tick（htop 的真实刷新节奏，
   不开第三个 rAF），每行 CPU/MEM 围绕 interests.yml 基线做有界随机游走，波形按
   state 分档（RUNNING 快抖+偶发尖峰 / SLEEPING 40s 呼吸正弦 / IDLE 近平+偶尔拱 /
   WAITING 6s 方波 / HIGH LOAD 高位抖动+12% 冲顶 100 并给条挂 .hot 红段）；
   UPTIME = 种子秒数 + 本页真实会话时长（performance.now）。表头 Tasks/Mem 括号/
   Load average 为六行活值的真聚合（Load = ΣCPU/100 的 1/5/15 tick 窗 EMA）。
   门控：IntersectionObserver(05 卡 0.2) + visibilitychange + reduced-motion——
   滚走/切后台/减弱动效全停，静态表即成品；hover 行游走幅度 ×2（触屏无此层）。
   排序用 FLIP：First 量行 rect → appendChild 重排 → Invert 写回 translateY
   → 下一帧过渡归零；reduced-motion 直接落位。
   触屏无 hover：点行同样出详情（再点别行切换）。
   ============================================================ */
(function () {
  "use strict";
  var d = document;

  function start() {
    var rows = d.getElementById("htop-rows");
    var btn = d.getElementById("hob-sort");
    var hint = d.getElementById("htop-hint");
    var wave = d.getElementById("htop-wave");
    if (!rows || !btn || !hint || !wave) return;
    var items = Array.prototype.slice.call(rows.children);
    if (!items.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    var KEYS = ["cpu", "mem", "up", "name"];
    var LABEL = { cpu: "CPU", mem: "MEM", up: "UPTIME", name: "NAME" };
    var ki = 0;
    var defHint = hint.textContent;
    /* 触屏无 hover：把提示语里的「悬停」换成「点按」 */
    if (window.matchMedia("(hover: none)").matches) {
      defHint = defHint.replace("悬停", "点按");
      hint.textContent = defHint;
    }

    /* ---------- 详情行：hover/点选哪行，底部出哪行 ---------- */
    function show(el) {
      hint.textContent = el.getAttribute("data-name") + " — " + el.getAttribute("data-desc");
      wave.setAttribute("data-wave", el.getAttribute("data-state"));
    }

    /* ---------- 心跳模型 ---------- */
    /* 每行独立 PRNG（mulberry32，PID 做种子防各行同步） */
    function mulberry32(a) {
      return function () {
        a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    /* state 波形档：band=游走带（基线±），amp=每 tick 步幅，spike/jump=尖峰概率与幅度，
       form=sine/square 走时间函数；floor=硬底（HIGH LOAD 不许塌下 88） */
    var PROF = {
      RUNNING:  { band: 10, amp: 6,   spike: 0.06, jump: 12, memBand: 5, memAmp: 1.6, form: "walk" },
      SLEEPING: { band: 3,  amp: 1.5, memBand: 2, memAmp: 0.6, form: "sine", period: 40 },
      IDLE:     { band: 4,  amp: 1,   spike: 0.04, jump: 4,  memBand: 3, memAmp: 0.8, form: "walk" },
      WAITING:  { band: 16, amp: 1.2, memBand: 4, memAmp: 1.2, form: "square", period: 6, hi: 14 },
      HIGHLOAD: { band: 4,  amp: 2.4, spike: 0.12, to100: true, floor: 88, memBand: 4, memAmp: 1.4, form: "walk" }
    };
    var t0 = performance.now();
    var model = items.map(function (el, i) {
      var st = (el.getAttribute("data-state") || "").toUpperCase();
      var p = PROF[st] || PROF.IDLE;
      var cpu = parseFloat(el.getAttribute("data-cpu")) || 0;
      var mem = parseFloat(el.getAttribute("data-mem")) || 0;
      var upm = /^(\d+):(\d+):(\d+)$/.exec(el.getAttribute("data-up") || "");
      return {
        el: el, p: p, st: st,
        base: { cpu: cpu, mem: mem },
        v: { cpu: cpu, mem: mem },
        seed: upm ? (+upm[1]) * 3600 + (+upm[2]) * 60 + (+upm[3]) : 0,
        rand: mulberry32(i * 7919 + 104729),
        bar: el.querySelector(".hc-cpu .hp-bar"),
        barM: el.querySelector(".hc-mem .hp-bar"),
        emC: el.querySelector(".hc-cpu em"),
        emM: el.querySelector(".hc-mem em"),
        upEl: el.querySelector(".hc-up"),
        hover: false
      };
    });
    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
    function step(r, el) {
      var p = r.p, mul = r.hover ? 2 : 1, v = r.v.cpu, m = r.v.mem, lo, hi;
      if (p.form === "sine") {
        v = r.base.cpu + p.amp * Math.sin(2 * Math.PI * el / p.period) + (r.rand() * 2 - 1) * 0.7 * mul;
      } else if (p.form === "square") {
        v = r.base.cpu + (Math.floor(el / p.period) % 2 === 1 ? p.hi : 0) + (r.rand() * 2 - 1) * p.amp * mul;
      } else {
        v += (r.base.cpu - v) * 0.3 + (r.rand() * 2 - 1) * p.amp * mul;
        if (p.spike && r.rand() < p.spike) v = p.to100 ? 100 : v + p.jump * r.rand();
      }
      lo = p.floor != null ? p.floor : Math.max(0, r.base.cpu - p.band);
      hi = Math.min(100, r.base.cpu + p.band);
      r.v.cpu = clamp(v, lo, hi);
      m += (r.base.mem - m) * 0.4 + (r.rand() * 2 - 1) * p.memAmp * mul;
      r.v.mem = clamp(m, Math.max(0, r.base.mem - p.memBand), Math.min(100, r.base.mem + p.memBand));
    }
    function pad(n, w) { n = String(n); while (n.length < w) n = "0" + n; return n; }
    function paint(r) {
      var cv = Math.round(r.v.cpu), mv = Math.round(r.v.mem);
      if (r.bar) {
        r.bar.style.setProperty("--v", cv);
        /* .hot 只在冲顶 100 时点亮（HIGH LOAD 尖峰一闪）；阈值 90 会让 AI 行常红 */
        r.bar.classList.toggle("hot", cv >= 100);
      }
      if (r.emC) r.emC.textContent = cv + "%";
      r.el.setAttribute("data-cpu", cv);
      if (r.barM) r.barM.style.setProperty("--v", mv);
      if (r.emM) r.emM.textContent = mv + "%";
      r.el.setAttribute("data-mem", mv);
      if (r.upEl) {
        var s = Math.floor(r.seed + (performance.now() - t0) / 1000);
        r.upEl.textContent = pad(Math.floor(s / 3600), 4) + ":" + pad(Math.floor(s / 60) % 60, 2) + ":" + pad(s % 60, 2);
      }
    }
    /* ---------- 表头聚合：Tasks 计数 / Mem 括号=均值 / Load=ΣCPU/100 的 1/5/15 tick EMA ---------- */
    var tasksEl = d.getElementById("hm-tasks"), loadEl = d.getElementById("hm-load");
    var L = [0, 0, 0], seeded = false;
    function paintMeta() {
      var sum = 0, memsum = 0, run = 0;
      model.forEach(function (r) {
        sum += r.v.cpu; memsum += r.v.mem;
        if (r.st === "RUNNING" || r.st === "HIGHLOAD") run++;
      });
      if (tasksEl) tasksEl.textContent = "Tasks: " + model.length + ", " + run + " running";
      if (loadEl) {
        var f = Math.round(memsum / model.length / 10), br = "", k;
        for (k = 0; k < 10; k++) br += k < f ? "|" : "·";
        var load = sum / 100, A = [1, 0.333, 0.125], j;
        for (j = 0; j < 3; j++) L[j] = seeded ? L[j] + (load - L[j]) * A[j] : load;
        seeded = true;
        loadEl.textContent = "Mem[" + br + "] Load average: " + L[0].toFixed(2) + " " + L[1].toFixed(2) + " " + L[2].toFixed(2);
      }
    }
    var timer = 0, visible = false;
    function tick() {
      var el = (performance.now() - t0) / 1000;
      model.forEach(function (r) { step(r, el); paint(r); });
      paintMeta();
    }
    function gate() {
      var on = visible && !d.hidden && !reduced.matches;
      if (on && !timer) timer = setInterval(tick, 1500);
      else if (!on && timer) { clearInterval(timer); timer = 0; }
    }
    var card = d.getElementById("c-interests");
    if (card && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        visible = es[es.length - 1].isIntersecting;
        gate();
      }, { threshold: 0.2 }).observe(card);
    } else {
      visible = true;
    }
    d.addEventListener("visibilitychange", gate);
    if (reduced.addEventListener) reduced.addEventListener("change", gate);
    gate();

    items.forEach(function (el, i) {
      el.addEventListener("mouseenter", function () { model[i].hover = true; show(el); });
      el.addEventListener("mouseleave", function () { model[i].hover = false; });
      el.addEventListener("click", function (e) {
        /* 行本身不是链接（触屏可达）：点行只切详情，不拦别的 */
        e.preventDefault();
        show(el);
      });
    });
    rows.addEventListener("mouseleave", function () {
      hint.textContent = defHint;
      wave.setAttribute("data-wave", "idle");
    });

    /* ---------- 排序：FLIP 重排 ---------- */
    function cmp(k) {
      return function (a, b) {
        var av = a.getAttribute("data-" + k), bv = b.getAttribute("data-" + k);
        if (k === "name") return av.localeCompare(bv, "zh-Hans-CN");
        return parseFloat(bv) - parseFloat(av); /* cpu/mem/up 降序 */
      };
    }
    btn.addEventListener("click", function () {
      if (window.fx && window.fx.blip) window.fx.blip("click");
      var k = KEYS[ki % KEYS.length];
      ki++;
      btn.textContent = "SORT · " + LABEL[k];
      var first = items.map(function (el) { return el.getBoundingClientRect(); });
      items.slice().sort(cmp(k)).forEach(function (el) { rows.appendChild(el); });
      if (reduced.matches) return;
      items.forEach(function (el, i) {
        var dy = first[i].top - el.getBoundingClientRect().top;
        if (Math.abs(dy) < 1) return;
        el.style.transition = "none";
        el.style.transform = "translateY(" + dy.toFixed(1) + "px)";
      });
      void rows.offsetWidth; /* 钉住反演起点 */
      requestAnimationFrame(function () {
        items.forEach(function (el) {
          el.style.transition = "transform .55s var(--ease)";
          el.style.transform = "";
        });
        setTimeout(function () {
          items.forEach(function (el) { el.style.transition = ""; el.style.transform = ""; });
        }, 700);
      });
    });
  }

  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", start);
  else start();
})();
