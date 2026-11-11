/* core.js — 01 HOME · ENGINE CORE 线框反应堆核心（契约见 40-cards.css CORE 段）
   纯 SVG 二十面体投影，全站特效仍只 fx.js 一个 canvas。
   交互：滚动速度→能量 E→转速/辉光（E 指数衰减，像飞轮）；点击/Enter/Space→OVERCLOCK。
   复用 markup 里 rotY34·rotX22·rotZ9 的静态投影兜底：JS 只逐帧改写同一批
   line/circle 的坐标，不重建 DOM——顶点/棱枚举顺序与静态数据生成脚本严格一致。 */
(function () {
  "use strict";
  var d = document, w = window;
  var panel = d.querySelector(".core-panel");
  if (!panel) return;
  var deck = d.getElementById("deck");
  var gE = d.getElementById("core-edges");
  var gN = d.getElementById("core-nodes");
  var sat = d.getElementById("core-sat");
  var elSpin = d.getElementById("core-spin");
  var elStat = d.getElementById("core-status");
  var elUp = d.getElementById("core-uptime");
  if (!gE || !gN) return;
  var reduced = w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mqHide = w.matchMedia("(max-width: 1100px)"); /* 与 90-media 隐藏断点一致，藏了就不空转 */

  /* ---------- 二十面体几何：(0,±1,±φ) 三循环置换，棱=距离 2 的点对 ---------- */
  var PHI = (1 + Math.sqrt(5)) / 2, SC = 34, FOC = 4.6, DEG = Math.PI / 180;
  var V = [];
  [[0, 1, PHI], [0, 1, -PHI], [0, -1, PHI], [0, -1, -PHI]].forEach(function (t) {
    V.push(t, [t[1], t[2], t[0]], [t[2], t[0], t[1]]);
  });
  var ED = [];
  for (var i = 0; i < 12; i++) for (var j = i + 1; j < 12; j++) {
    var q = (V[i][0] - V[j][0]) * (V[i][0] - V[j][0]) + (V[i][1] - V[j][1]) * (V[i][1] - V[j][1]) + (V[i][2] - V[j][2]) * (V[i][2] - V[j][2]);
    if (Math.abs(q - 4) < 0.01) ED.push([i, j]);
  }
  var LE = gE.children, LN = gN.children; /* 静态兜底已备好 30 line + 12 circle，直接接管 */

  /* ---------- 状态 ---------- */
  var ax = 0.6, ay = 0.9, energy = 0, lastY = deck ? deck.scrollTop : 0;
  var raf = 0, prev = 0, vis = true, ocUntil = 0, ocT = 0, lastRead = 0;
  var bootT0 = Date.now();
  var PX = new Array(12), PY = new Array(12), PZ = new Array(12), PS = new Array(12);
  var RING_T = -16 * DEG, RT = Math.cos(RING_T), UT = Math.sin(-RING_T); /* 环倾角（与 markup rotate(-16) 一致） */

  function render(now) {
    var cy = Math.cos(ay), sy = Math.sin(ay);
    var cx = Math.cos(ax), sx = Math.sin(ax);
    var cz = Math.cos(Math.sin(now * 0.00013) * 0.2), sz = Math.sin(Math.sin(now * 0.00013) * 0.2);
    for (var k = 0; k < 12; k++) {
      var x = V[k][0], y = V[k][1], z = V[k][2];
      var x1 = cy * x + sy * z, z1 = -sy * x + cy * z;      /* rotY */
      var y2 = cx * y - sx * z1, z2 = sx * y + cx * z1;     /* rotX */
      var x3 = cz * x1 - sz * y2, y3 = sz * x1 + cz * y2;   /* rotZ（章动微摆） */
      var s = FOC / (FOC - z2);
      PX[k] = x3 * s * SC; PY[k] = -y3 * s * SC; PZ[k] = z2; PS[k] = s;
    }
    for (k = 0; k < ED.length && k < LE.length; k++) {
      var a = ED[k][0], b = ED[k][1], el = LE[k];
      el.setAttribute("x1", PX[a].toFixed(1)); el.setAttribute("y1", PY[a].toFixed(1));
      el.setAttribute("x2", PX[b].toFixed(1)); el.setAttribute("y2", PY[b].toFixed(1));
      el.setAttribute("stroke-opacity", (0.16 + 0.44 * ((PZ[a] + PZ[b]) / 2 + 1.9) / 3.8).toFixed(2));
    }
    for (k = 0; k < 12 && k < LN.length; k++) {
      LN[k].setAttribute("cx", PX[k].toFixed(1));
      LN[k].setAttribute("cy", PY[k].toFixed(1));
      LN[k].setAttribute("r", (1.5 + PS[k] * 1.1).toFixed(1));
    }
    if (sat) {
      var th = now * 0.00045 * (1 + energy * 0.8);
      var ex = 100 * Math.cos(th), ey = 31 * Math.sin(th);
      sat.setAttribute("cx", (RT * ex + UT * ey).toFixed(1));
      sat.setAttribute("cy", (-UT * ex + RT * ey).toFixed(1));
      sat.setAttribute("opacity", (0.3 + 0.7 * (Math.sin(th) + 1) / 2).toFixed(2));
    }
    panel.style.setProperty("--cg", Math.min(energy / 2.6, 1).toFixed(3));
  }

  function readouts(now, spin) {
    if (now - lastRead < 150) return;
    lastRead = now;
    if (elSpin) elSpin.textContent = ("00" + Math.round(spin)).slice(-3) + "\u00b0/S";
    if (elStat) elStat.textContent = now < ocUntil ? "OVERCLOCK" : (energy > 0.55 ? "HOT" : "IDLE");
    if (elUp) {
      var s = Math.floor((Date.now() - bootT0) / 1000);
      elUp.textContent = ("0" + Math.floor(s / 60)).slice(-2) + ":" + ("0" + (s % 60)).slice(-2);
    }
  }

  function frame(now) {
    raf = 0;
    if (!vis || d.hidden || mqHide.matches) return;
    var dt = Math.min((now - prev) / 1000, 0.05); prev = now;
    /* 滚动供能：本帧 scrollTop 变化量注入 E，E 每秒指数衰减——蹬得越快飞轮转得越猛 */
    var st = deck ? deck.scrollTop : 0;
    energy += Math.min(Math.abs(st - lastY) * 0.016, 1.6);
    lastY = st;
    energy *= Math.exp(-dt * 1.4);
    if (energy > 3) energy = 3;
    var spin = 12 + energy * 92; /* °/s：怠速 12，满能量 ~288 */
    ax += dt * spin * 0.52 * DEG;
    ay += dt * spin * DEG;
    render(now);
    readouts(now, spin);
    raf = requestAnimationFrame(frame);
  }

  function kick() {
    if (!raf && vis && !d.hidden && !mqHide.matches) { prev = performance.now(); raf = requestAnimationFrame(frame); }
  }

  /* ---------- OVERCLOCK：点击/回车 → 能量冲顶 + .oc 爆闪 1.4s ---------- */
  function bang() {
    energy = Math.max(energy, 2.8);
    ocUntil = performance.now() + 1400;
    panel.classList.add("oc");
    clearTimeout(ocT);
    ocT = setTimeout(function () { panel.classList.remove("oc"); }, 1400);
    if (reduced) { render(performance.now()); readouts(performance.now(), 304); }
    kick();
  }
  panel.addEventListener("pointerdown", bang);
  panel.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); bang(); }
  });

  /* ---------- 生命周期：卡 01 出视口/切后台/窄屏隐藏 → rAF 挂起 ---------- */
  if ("IntersectionObserver" in w) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { vis = en.isIntersecting; if (vis) kick(); else if (raf) { cancelAnimationFrame(raf); raf = 0; } });
    }, { threshold: 0.05 });
    io.observe(d.getElementById("c-home") || panel);
  }
  d.addEventListener("visibilitychange", kick);
  if (mqHide.addEventListener) mqHide.addEventListener("change", kick); else if (mqHide.addListener) mqHide.addListener(kick);

  if (reduced) {
    /* 降级：静态投影即成品，不转不动；只留 UPTIME 秒级心跳 */
    render(0);
    if (elSpin) elSpin.textContent = "000\u00b0/S";
    if (elUp) setInterval(function () {
      var s = Math.floor((Date.now() - bootT0) / 1000);
      elUp.textContent = ("0" + Math.floor(s / 60)).slice(-2) + ":" + ("0" + (s % 60)).slice(-2);
    }, 1000);
  } else {
    kick();
  }
})();
