/* ============================================================
   fx.js —— 常驻特效引擎（Phase 0）
   斜向激光+粒子 canvas / 角落辉光视差 / 磁吸按钮 /
   页间绿幕转场 / 声音引擎（WebAudio 合成 blip·泄压·环境音床，localStorage 记忆）
   触屏、prefers-reduced-motion、无 JS 全部自动降级。
   （原自研十字准星光标段已删：光标回归旧站纸飞机原生 cursor:url 方案，
     纯 CSS 在 30-fx.css 尾部；模板里的 data-cursor 属性无害保留。）
   ============================================================ */
(function () {
  var d = document, w = window;
  var reduced = w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch = w.matchMedia("(pointer: coarse)").matches;
  var laserEmit = null; /* 代码火箭尾焰注入点（rocket.js 经 w.fx.emit 消费），canvas 块内赋值 */

  /* ---------- AMB-REACT · 音频驱动背景（2026-11） ----------
     数据源是 radio.js ensureGraph 已接好的那条 AnalyserNode（挂在 tape.audio 上，
     createMediaElementSource 一台媒体元素只能挂一次，所以由 radio.js 经
     w.fx.setAudio(an) 递过来，这里绝不另起炉灶）。每帧 getByteFrequencyData
     切三段真频段：BASS(bin1-5)/MID(6-22)/TREBLE(23-64)，能量 RMS 加权；
     平滑走 core.js 飞轮手感——快起(0.45)慢落(0.06)，音乐一停 1s 内回落静止。
      R5 调档：原始读数先过整形曲线 pow(v,1.4)×0.8——响曲峰值落回 ~0.7、
      安静段压得更低，动态从「全程拉满」变「该冲才冲」；再叠按卡增益
      （deck.js 换卡调 w.fx.ambCard：04 电台 1.0 / 01 hero 0.85 / 06 作品 0.8 /
      文字重的卡 0.6），增益 ~0.4s 平滑插值，切卡不跳变。
     写进根节点 --bass/--rms/--pulse 三个自定义属性给 CSS 层消费
     （辉光呼吸/地板低音拱起/噪点变粗/暗角收放），canvas 三件套（激光线/
     尘点/星座网）读同一组数——一个声源驱动整机，不是各演各的。
     诚实降级：没手势没建过 AudioContext → 读数恒 0，CSS 里 var(x,0) 兜底
     回今天的静态样子；reduced 时 frame 不跑，什么都不写；
     ≤720 窄屏振幅乘 AMP=0.55，防小屏过闪。 */
  var anA = null, fdA = null, RB = { b: 0, m: 0, t: 0, r: 0 }, pulseE = 0;
  var cardK = 1, cardKT = 1;                    /* R5 按卡增益：当前值/目标值 */
  function shape(v) { if (v > 1) v = 1; return Math.pow(v, 1.4) * 0.8; }
  var AMP = w.matchMedia("(max-width: 720px)").matches ? 0.55 : 1;
  try {
    w.matchMedia("(max-width: 720px)").addEventListener("change", function (e) { AMP = e.matches ? 0.55 : 1; });
  } catch (e) {}
  function audioRead() {
    if (anA && fdA) {
      anA.getByteFrequencyData(fdA);
      var n = fdA.length, i, s;
      s = 0; for (i = 1; i <= 5 && i < n; i++) s += fdA[i]; var b = s / (5 * 255);
      s = 0; for (i = 6; i <= 22 && i < n; i++) s += fdA[i]; var m = s / ((Math.min(22, n - 1) - 5) * 255);
      s = 0; for (i = 23; i <= 64 && i < n; i++) s += fdA[i]; var t = s / ((Math.min(64, n - 1) - 22) * 255);
      var r = Math.sqrt((b * b + m * m + t * t) / 3) * 1.7;
      cardK += (cardKT - cardK) * 0.04;         /* R5 按卡增益插值(~0.4s 到位) */
      var g = shape(b) * cardK; RB.b += (g - RB.b) * (g > RB.b ? 0.45 : 0.06);
      g = shape(m) * cardK; RB.m += (g - RB.m) * (g > RB.m ? 0.45 : 0.08);
      g = shape(t) * cardK; RB.t += (g - RB.t) * (g > RB.t ? 0.5 : 0.1);
      g = shape(r) * cardK; RB.r += (g - RB.r) * (g > RB.r ? 0.4 : 0.07);
    } else { RB.b = RB.m = RB.t = RB.r = 0; }
    pulseE *= 0.9; if (pulseE < 0.002) pulseE = 0;
    var st = d.documentElement.style;
    st.setProperty("--bass", (RB.b * AMP).toFixed(3));
    st.setProperty("--rms", (RB.r * AMP).toFixed(3));
    st.setProperty("--pulse", pulseE.toFixed(3));
  }

  /* ---------- 激光线 + 粒子 canvas ---------- */
  var canvas = d.getElementById("laser");
  if (canvas && canvas.getContext) {
    var g = canvas.getContext("2d"), W = 0, H = 0;
    var DPR = Math.min(w.devicePixelRatio || 1, 2);
    function size() {
      W = innerWidth; H = innerHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      g.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    size();
    var lines = [], parts = [], i;
    for (i = 0; i < 3; i++) lines.push({ x: Math.random(), sp: 0.000018 + Math.random() * 0.00003, tilt: -0.42 - Math.random() * 0.16 });
    for (i = 0; i < 34; i++) parts.push({
      x: Math.random(), y: Math.random(), s: 0.6 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.00035, vy: -0.00022 - Math.random() * 0.0004,
      a: 0.06 + Math.random() * 0.24
    });
    var run = true, t0 = w.performance.now();

    /* ---------- 环境层②：星座节点网络 ----------
       并入 #laser 同一 canvas、同一 rAF 帧循环（全站只允许这一个 canvas 的红线不破）。
       36 个漂移点（归一化坐标，速度极低 ~0.03%/s，边界回绕），成对距离 <130px
       连线：alpha .05~.10 随距离线性衰减；节点画 1px 点 alpha .18。
       鼠标 0.3× 视差（目标偏移在 pointermove 里记，逐帧 .03 缓动，与角落辉光同手感）。
       触屏（pointer:coarse）不建点、不监听、不绘制；reduced 沿用现状——run=false
       时 frame 早退，整块 canvas（激光/尘点/星座）一起不画。
       注意 .laser 层有 CSS opacity .55，下面的 alpha 都按 /0.55 预补偿，
       落屏可见值才是设计值（点 .18、线 .05~.10）。 */
    var cst = [], CI = 36, CD = 130, CD2 = CD * CD;
    var cmx = 0, cmy = 0, cox = 0, coy = 0; /* 视差：目标/当前（CSS px） */
    if (!touch) {
      for (i = 0; i < CI; i++) cst.push({
        x: Math.random(), y: Math.random(),
        vx: (Math.random() - 0.5) * 0.00006, vy: (Math.random() - 0.5) * 0.00006,
        px: 0, py: 0 /* 每帧换算的屏幕坐标，连线复用时免二次乘 */
      });
      d.addEventListener("pointermove", function (e) {
        cmx = (e.clientX / innerWidth - 0.5) * 24 * 0.3;
        cmy = (e.clientY / innerHeight - 0.5) * 24 * 0.3;
      }, { passive: true });
    }
    function drawConstellation(now) {
      if (!cst.length) return;
      cox += (cmx - cox) * 0.03; coy += (cmy - coy) * 0.03;
      /* AMB-REACT：低音把连线阈值撑到最多 2.2 倍（网随音乐涨缩），节点被低音
         抖出 ±7px 正弦颤（用帧时做相位，确定性，不是随机色块） */
      var k = 1 + RB.b * 1.2, CD2e = CD2 * k * k, CDe = CD * k;
      var n, m, A, B, dx, dy, d2, t;
      for (n = 0; n < CI; n++) {
        A = cst[n];
        A.x += A.vx * (1 + RB.m * 2); A.y += A.vy * (1 + RB.m * 2);
        if (A.x < 0) A.x += 1; else if (A.x > 1) A.x -= 1;
        if (A.y < 0) A.y += 1; else if (A.y > 1) A.y -= 1;
        A.px = A.x * W + cox + Math.sin(now * 0.006 + n * 2.3) * RB.b * 7;
        A.py = A.y * H + coy + Math.cos(now * 0.005 + n * 1.7) * RB.b * 7;
      }
      g.lineWidth = 1;
      for (n = 0; n < CI; n++) for (m = n + 1; m < CI; m++) {
        A = cst[n]; B = cst[m];
        dx = A.px - B.px; dy = A.py - B.py;
        d2 = dx * dx + dy * dy;
        if (d2 > CD2e) continue;
        t = 1 - Math.sqrt(d2) / CDe; /* 0~1：越近越亮 */
        g.strokeStyle = "rgba(58,227,92," + (((0.05 + t * 0.05) * (1 + RB.r * 2.4)) / 0.55).toFixed(3) + ")";
        g.beginPath(); g.moveTo(A.px, A.py); g.lineTo(B.px, B.py); g.stroke();
      }
      g.fillStyle = "rgba(58,227,92," + (0.33 * (1 + RB.r * 1.4)).toFixed(3) + ")"; /* .18/.55 预补偿 */
      for (n = 0; n < CI; n++) { A = cst[n]; g.fillRect(A.px, A.py, 1, 1); }
    }

    /* ---------- 代码火箭尾焰（2026-11，rocket.js 消费）：单字形代码字符
       从箭尾喷出、下坠散逸淡出，画进 #laser 同一 frame 循环（单 canvas 红线不破）。
       emit(x, y, power)：视口坐标 + 推力 0~1（调用方传真实速度比，越猛越密越亮）。
       字形 JetBrains Mono fillText；alpha 同环境层按 /0.55 预补偿；上限 140 粒，
       到期自摘。reduced 时 run=false、frame 不跑，emit 直接空返，无需调用方再判。 */
    var exh = [], EX_CAP = 140, exhLast = 0;
    var EXCH = ["<", ">", "/", "{", "}", ";", "=", "(", ")", "[", "*", "+"];
    function emit(x, y, power) {
      if (!run) return;
      power = Math.max(0, Math.min(1, power || 0));
      var n = 1 + Math.round(power * 2);
      for (var q = 0; q < n && exh.length < EX_CAP; q++) {
        exh.push({
          ch: EXCH[(Math.random() * EXCH.length) | 0],
          x: x + (Math.random() - 0.5) * 12,
          y: y + Math.random() * 4,
          vx: (Math.random() - 0.5) * 40,   /* px/s 横向散逸 */
          vy: 70 + Math.random() * 150,      /* px/s 尾焰下坠 */
          a: 0.3 + power * 0.35 + Math.random() * 0.2,
          s: 9 + Math.random() * 6,
          rot: (Math.random() - 0.5) * 1.1,
          vr: (Math.random() - 0.5) * 2.4,   /* rad/s */
          t: 0, life: 420 + Math.random() * 260
        });
      }
    }
    laserEmit = emit;
    function exhaustStep(now) {
      var dt = (exhLast ? Math.min(now - exhLast, 50) : 16) / 1000;
      exhLast = now;
      g.textAlign = "center"; g.textBaseline = "middle";
      for (var k = exh.length - 1; k >= 0; k--) {
        var P = exh[k];
        P.t += dt * 1000;
        if (P.t >= P.life) { exh.splice(k, 1); continue; }
        P.x += P.vx * dt; P.y += P.vy * dt;
        var a = Math.min(P.a * (1 - P.t / P.life) / 0.55, 1);
        g.save();
        g.translate(P.x, P.y);
        g.rotate(P.rot + P.vr * P.t / 1000);
        g.font = P.s.toFixed(1) + "px 'JetBrains Mono', ui-monospace, monospace";
        g.fillStyle = "rgba(58,227,92," + a.toFixed(3) + ")";
        g.fillText(P.ch, 0, 0);
        g.restore();
      }
    }

    function frame(now) {
      if (!run) return;
      var t = now - t0;
      if (!reduced) audioRead(); /* AMB-REACT：先取数，本帧所有层用同一组读数 */
      g.clearRect(0, 0, W, H);
      g.lineWidth = 1;
      for (var j = 0; j < lines.length; j++) {
        var L = lines[j], p = ((L.x + t * L.sp) % 1.5) - 0.25;
        /* 激光线：低音抬亮度、脉冲闪一下；中频给倾角一点微颤（有因果的抖，不是随机） */
        g.strokeStyle = "rgba(58,227,92," + Math.min(0.14 + RB.b * 0.26 + pulseE * 0.18, 0.62).toFixed(3) + ")";
        g.beginPath();
        g.moveTo(p * W, -10);
        g.lineTo(p * W + (L.tilt + RB.m * 0.1 * Math.sin(t * 0.003 + j)) * H, H + 10);
        g.stroke();
      }
      for (j = 0; j < parts.length; j++) {
        var P = parts[j];
        P.x += P.vx * 16 * (1 + RB.m * 2.2); P.y += P.vy * 16 * (1 + RB.m * 2.2);
        if (P.y < -0.04) { P.y = 1.04; P.x = Math.random(); }
        if (P.x < -0.04) P.x = 1.04; else if (P.x > 1.04) P.x = -0.04;
        g.fillStyle = "rgba(242,245,243," + Math.min(P.a * (1 + RB.t * 1.7), 0.6).toFixed(3) + ")";
        g.fillRect(P.x * W, P.y * H, P.s, P.s);
      }
      /* 星座画在尘点之后、显影粒子之前：显影聚拢时盖过环境网，落位消散后网回落为背景 */
      drawConstellation(now);
      if (exh.length) exhaustStep(now);
      if (rv) revealStep(now);
      requestAnimationFrame(frame);
    }
    if (reduced) { run = false; frame(t0); }
    else requestAnimationFrame(frame);
    d.addEventListener("visibilitychange", function () {
      run = !d.hidden;
      if (run && !reduced) { t0 = w.performance.now(); requestAnimationFrame(frame); }
    });
    var rs;
    w.addEventListener("resize", function () { clearTimeout(rs); rs = setTimeout(function () { size(); if (reduced) frame(t0); }, 180); });

    /* ---------- 粒子显影（第三批）：01 卡三行大标题聚拢成型 ----------
       不新建显示 canvas——离屏那张只做一次性栅格化采样，像素全部画进上面
       #laser 的同一个 frame 循环（revealStep 由 frame 逐帧调）。
       流程：扫描光带起跳那一刻（deck:sweep / __deckSweep，兜底 deck:boot-done）
       → 采样前 await fonts.ready（Anton 是 webfont，早采样会按 fallback 字形飞）。
       每行按宽度取 120–200 点、全场 ≤600；随机近处出发，easeOut ~0.7s，
       行间错峰 80ms + 行内抖动；全员落位瞬间摘 pz-hold 让 .rv 原生 transition
       淡入 DOM 文字，粒子同步 420ms 淡出消散。
       触屏 / prefers-reduced-motion / 非首页 / deck-particle 已置位：全程不碰，
       文字走正常进场。sessionStorage 写失败也不让 hold 卡住文字（见 catch）。 */
    var heroLines = d.querySelector(".hero-lines");
    var pRun = !!heroLines && !reduced && !touch && d.body.classList.contains("is-home");
    try { if (pRun && sessionStorage.getItem("deck-particle")) pRun = false; } catch (e) { pRun = false; }
    if (pRun) heroLines.classList.add("pz-hold");
    var rv = null;

    function revealStep(now) {
      var age = now - rv.t0;
      if (age >= rv.endAt && !rv.released) {
        rv.released = true;
        heroLines.classList.remove("pz-hold");
      }
      if (age >= rv.endAt + 460) { rv = null; if (w.fx) w.fx._reveal = null; return; }
      var fade = Math.min(Math.max((age - rv.endAt) / 420, 0), 1);
      var items = rv.items;
      for (var k = 0; k < items.length; k++) {
        var it = items[k];
        var p = Math.min(Math.max((age - it.d) / it.dur, 0), 1);
        var e = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
        var a = it.a * (0.25 + 0.75 * p) * (1 - fade);
        g.fillStyle = "rgba(" + it.c + "," + a.toFixed(3) + ")";
        g.fillRect(it.x0 + (it.tx - it.x0) * e, it.y0 + (it.ty - it.y0) * e, it.s, it.s);
      }
    }

    function buildReveal() {
      var spans = heroLines.querySelectorAll(".display");
      var items = [], CAP = 600;
      for (var li = 0; li < spans.length && items.length < CAP; li++) {
        var el = spans[li], r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        var st = w.getComputedStyle(el);
        var text = (el.textContent || "").toUpperCase(); /* CSS uppercase，canvas 自己补 */
        var CW = Math.ceil(r.width), CH = Math.ceil(r.height);
        var oc = d.createElement("canvas"); /* 离屏采样器，不进 DOM 不显示 */
        oc.width = CW; oc.height = CH;
        var og = oc.getContext("2d", { willReadFrequently: true });
        og.font = st.fontWeight + " " + st.fontSize + " " + st.fontFamily;
        og.textBaseline = "alphabetic";
        try { og.letterSpacing = st.letterSpacing; } catch (e) {} /* 不认就按默认字距，采样点位差几 px 无所谓 */
        og.fillStyle = "#fff";
        var m = og.measureText(text);
        var asc = m.actualBoundingBoxAscent || CH * 0.7, desc = m.actualBoundingBoxDescent || CH * 0.05;
        og.fillText(text, 0, CH / 2 + (asc - desc) / 2); /* 墨迹包围盒对齐行框中线 */
        var data;
        try { data = og.getImageData(0, 0, CW, CH).data; } catch (e) { continue; }
        var cands = [], sy, sx;
        for (sy = 0; sy < CH; sy += 2) for (sx = 0; sx < CW; sx += 2)
          if (data[(sy * CW + sx) * 4 + 3] > 140) cands.push(sx, sy);
        if (!cands.length) continue;
        var col = el.classList.contains("solid") ? "242,245,243" : "58,227,92";
        var want = Math.min(200, Math.max(120, Math.round(CW / 7)));
        var take = Math.min(want, cands.length >> 1, CAP - items.length);
        /* 行间错峰：这一版不再按「光带自上而下扫」对齐，而是按 CRT 炸开的几何——
           10-base.css 的 crt-open 从屏幕中线向上下撑开（160ms→320ms 满 100dvh），
           三行标题在视口 26%~52%，离中线越近越早通电，所以顺序整个反过来，
           并让到炸开段之后（+130ms，按 2.2s 总预算倒推：最晚落位 130+120+580+80≈910ms，摘 hold 后还有 .5s 淡入），粒子是从那一屏闪光里显影出来的，不是排队进场。 */
        var base = 130 + (spans.length - 1 - li) * 55;
        for (var n = 0; n < take; n++) {
          var q = ((Math.random() * (cands.length >> 1)) | 0) * 2;
          var tx = r.left + cands[q], ty = r.top + cands[q + 1];
          var ang = Math.random() * 6.2832, dist = W * (0.1 + Math.random() * 0.3);
          items.push({
            tx: tx, ty: ty,
            x0: tx + Math.cos(ang) * dist, y0: ty + Math.sin(ang) * dist,
            s: 1.2 + Math.random() * 1.6, a: 0.5 + Math.random() * 0.5,
            dur: 470 + Math.random() * 110, d: base + Math.random() * 120,
            c: col
          });
        }
      }
      if (!items.length) { heroLines.classList.remove("pz-hold"); return; }
      var endAt = 0;
      for (var j = 0; j < items.length; j++)
        endAt = Math.max(endAt, items[j].d + items[j].dur);
      rv = { items: items, t0: w.performance.now(), endAt: endAt + 80, released: false };
      if (w.fx) w.fx._reveal = rv; /* 验收探针：帧数与落位时刻，业务代码不消费 */
    }

    function armReveal() {
      if (!pRun) return;
      pRun = false; /* 一次性：boot-done 理论上只发一次，双保险 */
      try { sessionStorage.setItem("deck-particle", "1"); } catch (e) {}
      var go = function () {
        try { buildReveal(); }
        catch (e) { heroLines.classList.remove("pz-hold"); } /* 采样任何意外都不能把标题永久扣住 */
      };
      if (d.fonts && d.fonts.ready && d.fonts.ready.then) d.fonts.ready.then(go, go);
      else go();
    }
    if (pRun) {
      /* 显影骑在扫描光带上起跑（deck:sweep），不等 boot-done——
         等 boot-done 会让标题晚 1s 才亮，光带与显影断成两件事。
         boot-done 仍作兜底：reduced / 无门会话下 sweep 可能不发。 */
      if (w.__deckSweep || w.__deckBootDone) armReveal();
      else {
        d.addEventListener("deck:sweep", armReveal, { once: true });
        d.addEventListener("deck:boot-done", armReveal, { once: true });
      }
    }
  }

  /* ---------- 角落辉光视差 + 滚动交叉轨道 ---------- */
  var ga = d.querySelector(".glow-a"), gb = d.querySelector(".glow-b");
  if (ga && gb && !reduced) {
    var tx = 0, ty = 0, cx = 0, cy = 0;
    if (!touch) d.addEventListener("pointermove", function (e) {
      tx = (e.clientX / innerWidth - 0.5) * 34;
      ty = (e.clientY / innerHeight - 0.5) * 22;
    }, { passive: true });
    var dk = d.getElementById("deck");
    (function loop() {
      cx += (tx - cx) * 0.035; cy += (ty - cy) * 0.035;
      /* 交叉轨道：两团辉光随阅读进度对穿（a 往右下、b 往左上）——构图不再固定
         对角，辉光位置由「读到哪」决定（真值 scrollTop），触屏也吃这条 */
      var pr = 0;
      if (dk) {
        var mx = dk.scrollHeight - dk.clientHeight;
        pr = mx > 0 ? Math.min(Math.max(dk.scrollTop / mx, 0), 1) : 0;
      }
      var ox = (pr - 0.5) * innerWidth * 0.16, oy = (pr - 0.5) * innerHeight * 0.14;
      ga.style.translate = (cx + ox).toFixed(2) + "px " + (cy + oy).toFixed(2) + "px";
      gb.style.translate = (-cx - ox).toFixed(2) + "px " + (-cy - oy).toFixed(2) + "px";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 磁吸按钮 ---------- */
  if (!reduced && !touch) {
    [].forEach.call(d.querySelectorAll("[data-magnet]"), function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px," +
          ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- COPY 按钮：[data-copy] 点击复制 ---------- */
  d.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("[data-copy]") : null;
    if (!b) return;
    var txt = b.getAttribute("data-copy");
    var orig = b.textContent; /* 保留按钮原标签（COPY YAML 之类），成功提示后还原 */
    function ok() {
      b.textContent = "OK!";
      setTimeout(function () { b.textContent = orig; }, 1200);
    }
    function fallback() {
      var ta = d.createElement("textarea");
      ta.value = txt;
      d.body.appendChild(ta);
      ta.select();
      try { d.execCommand("copy"); ok(); } catch (err) {}
      d.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      /* 权限被拒/文档失焦时 writeText 会 reject：走 execCommand 兜底，
         别把用户引到静默失败（按钮无反馈=以为站点坏了） */
      navigator.clipboard.writeText(txt).then(ok, fallback);
    } else {
      fallback();
    }
  });

  /* ---------- 声音：开关 + 微 blip + 环境音床 ---------- */
  var snd = { on: false, ctx: null };
  try { snd.on = localStorage.getItem("deck-snd") === "1"; } catch (e) {}
  var btn = d.getElementById("sound-btn");
  function paint() {
    if (!btn) return;
    btn.setAttribute("aria-pressed", snd.on ? "true" : "false");
    var s = btn.querySelector(".snd-state");
    if (s) s.textContent = snd.on ? "ON" : "OFF";
  }
  paint();
  function ensureCtx() {
    snd.ctx = snd.ctx || new (w.AudioContext || w.webkitAudioContext)();
    return snd.ctx;
  }
  /* ---------- 声音引擎（2026-11 重写）----------
     旧的四种 blip 是同一个方波只换频率——那就是"90 年代游戏机"味的来源。
     现在每种交互独立预设，机械硬件感，三段合成：
     T 瞬态噪声（颗粒/干脆度）+ B 振荡体带音高下坠（实体感）+ 短衰减。
     click=thock 键底声 / hover=几乎无声的 tick / up=锁扣两连击 /
     tune=翻页 swish 收尾轻点。调用签名 blip(kind) 不变，
     未知 kind 归入 click（与旧版"默认 660"同位置）。
     噪声缓冲全站一次性建（半秒白噪循环取随机段，不复读同一相位）；
     每个节点走 onended disconnect，与 hiss 同一纪律。 */
  var nbuf = null;
  function noiseBuf(c) {
    if (!nbuf) {
      nbuf = c.createBuffer(1, Math.floor(c.sampleRate * 0.5), c.sampleRate);
      var ch = nbuf.getChannelData(0);
      for (var i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    }
    return nbuf;
  }
  /* 噪声瞬态 / 扫气：t 起 dur 秒，type 滤别，f0→f1 频率滑（等频即不滑） */
  function burst(c, t, dur, type, f0, f1, peak, q, atk) {
    var s = c.createBufferSource(); s.buffer = noiseBuf(c);
    var fl = c.createBiquadFilter(); fl.type = type; fl.Q.value = q || 1;
    var g = c.createGain();
    fl.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + Math.min(atk || 0.003, dur * 0.5));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(c.destination);
    s.onended = function () { try { s.disconnect(); fl.disconnect(); g.disconnect(); } catch (e) {} };
    s.start(t, Math.random() * 0.3); s.stop(t + dur + 0.01);
  }
  /* 振荡体：wave 波形，f0→f1 音高下坠（下坠 = "沉下去的物理声"，方波平鸣 = 电子哔） */
  function body(c, t, dur, wave, f0, f1, peak) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = wave;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur * 0.8);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.onended = function () { try { o.disconnect(); g.disconnect(); } catch (e) {} };
    o.start(t); o.stop(t + dur + 0.01);
  }
  var BLIPS = {
    /* thock：8ms 高频瞬态给"脆"，三角体 210→130Hz 90ms 下坠给"实"——键到底 */
    click: function (c, t) {
      burst(c, t, 0.012, "bandpass", 3200, 2200, 0.035, 1.4);
      body(c, t, 0.09, "triangle", 210, 130, 0.045);
    },
    /* tick：只剩 8ms 极高频颗粒，音量压在原来的 hover 之下——近乎无声的确认 */
    hover: function (c, t) {
      burst(c, t, 0.008, "highpass", 6200, 6200, 0.012, 0.8);
    },
    /* 锁扣：先一记击锤瞬态，45ms 后更低的"咚"落闩——两连击，开关到位的手感 */
    up: function (c, t) {
      burst(c, t, 0.01, "bandpass", 2400, 1800, 0.03, 1.2);
      body(c, t, 0.05, "triangle", 340, 220, 0.03);
      body(c, t + 0.045, 0.09, "sine", 150, 90, 0.04);
    },
    /* 换挡/翻页：140ms 频带由低向高扫的 swish，收尾一记轻点像纸过刃 */
    tune: function (c, t) {
      burst(c, t, 0.14, "bandpass", 700, 1900, 0.018, 1, 0.03);
      burst(c, t + 0.12, 0.012, "bandpass", 2600, 2000, 0.025, 1.4);
    }
  };
  function blip(kind) {
    if (!snd.on) return;
    try {
      var c = ensureCtx();
      (BLIPS[kind] || BLIPS.click)(c, c.currentTime);
    } catch (e) {}
  }
  /* 泄压白噪（档3 Stage D）：气闸开那一记 0.35s「嗞——」。照搬 radio.js 调谐噪音的链路
     （白噪 BufferSource → bandpass Q1.2 → gain → destination），但这里是一次性短窗：
     频率 2600→700Hz 往下滑，听感像气从窄缝里挤出后散掉；gain 起 20ms 攻击、其余衰减。
     复用 blip 同一个 ctx（不另起炉灶，Chrome 限额 6 个），只在 deck-snd 开着时响。
     reduce 档照响——声音不是动效，而「我按到了」的确认正是该档唯一保留的反馈通道。 */
  function hiss(dur, from, to) {
    if (!snd.on) return;
    try {
      var c = ensureCtx();
      dur = dur || 0.35;
      var len = Math.max(1, Math.floor(c.sampleRate * dur));
      var buf = c.createBuffer(1, len, c.sampleRate);
      var ch = buf.getChannelData(0);
      for (var i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = c.createBufferSource(); src.buffer = buf;
      var bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.2;
      var g = c.createGain();
      var t = c.currentTime;
      bp.frequency.setValueAtTime(from || 2600, t);
      bp.frequency.exponentialRampToValueAtTime(to || 700, t + dur * 0.85);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.055, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(bp); bp.connect(g); g.connect(c.destination);
      src.onended = function () { try { src.disconnect(); bp.disconnect(); g.disconnect(); } catch (e) {} };
      src.start(t); src.stop(t + dur + 0.02);
    } catch (e) {}
  }

  /* ---------- 环境音（ambient）：SND=ON 时的轻床 + 成调拨弦 ----------
     床：55Hz + 110Hz(+9 音分微失谐) 正弦，0.009+0.007=0.016 合计，
     0.15Hz LFO 调制 bed 增益 ±20% → 峰值 0.0192 ≤ 0.02 总闸；
     拨弦（2026-11 重做，旧版是随机 1200~2400Hz 纯正弦——电梯到铃/微波炉味，
     且两声之间不成调）：A 小调五声音阶 A3~C5 随机取音，三角波基音长衰减
     + 二次谐波泛音快衰减（拨弦的"亮"先走、"肉"留下），触弦一记极短噪声
     颗粒；峰值仍 ≤0.03 总闸。床是 A1/A2，取音全在 A minor pentatonic 上，
     任意两声相继都协和，听感像远处风铃。
     走 onended 自摘（数组剔除 + disconnect），不 leak oscillator。
     开：master 0→1 用 1.2s linear ramp（power-on hum 渐起）；
     关：master 0.5s ramp 到 0，0.6s 时 osc.stop、0.7s 后 disconnect 全链。
     首次启动必须落在用户手势里（localStorage 记着 ON 也只挂一次性
     pointerdown/keydown 等真实手势），之后复用同一个 ctx，与 blip 共存。
     页面隐藏 ctx.suspend，回来按开关状态 resume。
     window.fx._amb：当前环境音节点束（null=未开），供自动化验收。 */
  var amb = null;
  /* A 小调五声（A3 C4 D4 E4 G4 A4 C5）——全音落在 55/110Hz 低音床的调上 */
  var PENTA = [220, 261.63, 293.66, 329.63, 392, 440, 523.25];
  function ambPing(a) {
    if (amb !== a) return;
    a.timer = setTimeout(function () { ambPing(a); }, 9000 + Math.random() * 9000);
    try {
      var c = a.ctx, t = c.currentTime;
      var f = PENTA[(Math.random() * PENTA.length) | 0];
      /* 基音：三角波（比正弦多一点泛音），4ms 快起音 + ~0.8s 长衰减 */
      var o1 = c.createOscillator(), g1 = c.createGain();
      o1.type = "triangle"; o1.frequency.value = f;
      g1.gain.setValueAtTime(0.0001, t);
      g1.gain.exponentialRampToValueAtTime(0.024, t + 0.004);
      g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      o1.connect(g1); g1.connect(a.master);
      /* 二次谐波泛音：正弦、+6 音分微失谐（弦感）、0.22s 先走完——
         拨弦的亮度快速收掉、"肉"留下，不是铃那种全程等亮 */
      var o2 = c.createOscillator(), g2 = c.createGain();
      o2.type = "sine"; o2.frequency.value = f * 2; o2.detune.value = 6;
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.exponentialRampToValueAtTime(0.01, t + 0.003);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o2.connect(g2); g2.connect(a.master);
      /* 触弦颗粒：12ms 高通噪声经 master 走（受开关包线管，不直连总线） */
      var s = c.createBufferSource(); s.buffer = noiseBuf(c);
      var hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2400;
      var gs = c.createGain();
      gs.gain.setValueAtTime(0.012, t);
      gs.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
      s.connect(hp); hp.connect(gs); gs.connect(a.master);
      var P = { oscs: [o1, o2, s] };
      P.stop = function (at) {
        for (var i = 0; i < P.oscs.length; i++) { try { P.oscs[i].stop(at); } catch (e) {} }
      };
      a.pings.push(P);
      o1.onended = function () {
        var k = a.pings.indexOf(P);
        if (k > -1) a.pings.splice(k, 1);
        try { o1.disconnect(); g1.disconnect(); o2.disconnect(); g2.disconnect(); s.disconnect(); hp.disconnect(); gs.disconnect(); } catch (e) {}
      };
      o1.start(t); o1.stop(t + 0.85);
      o2.start(t); o2.stop(t + 0.27);
      s.start(t, Math.random() * 0.3); s.stop(t + 0.02);
    } catch (e) {}
  }
  function ambStart() {
    if (amb) return;
    var c;
    try { c = ensureCtx(); } catch (e) { return; }
    var t = c.currentTime;
    var master = c.createGain();
    master.gain.setValueAtTime(0, t);
    master.gain.linearRampToValueAtTime(1, t + 1.2); /* power-on 渐起 */
    master.connect(c.destination);
    var bed = c.createGain();
    bed.gain.setValueAtTime(1, t);
    bed.connect(master);
    var o1 = c.createOscillator(), o2 = c.createOscillator();
    var g1 = c.createGain(), g2 = c.createGain();
    o1.type = "sine"; o1.frequency.value = 55; g1.gain.value = 0.009;
    o2.type = "sine"; o2.frequency.value = 110; o2.detune.value = 9; g2.gain.value = 0.007;
    o1.connect(g1); g1.connect(bed);
    o2.connect(g2); g2.connect(bed);
    var lfo = c.createOscillator(), lg = c.createGain();
    lfo.type = "sine"; lfo.frequency.value = 0.15; lg.gain.value = 0.2;
    lfo.connect(lg); lg.connect(bed.gain);
    o1.start(t); o2.start(t); lfo.start(t);
    if (c.state === "suspended" && c.resume) c.resume().catch(function () {});
    amb = { ctx: c, master: master, bed: bed, oscs: [o1, o2, lfo], pings: [], timer: 0 };
    amb.timer = setTimeout(function () { ambPing(amb); }, 9000 + Math.random() * 9000);
    if (w.fx) w.fx._amb = amb;
  }
  function ambStop() {
    if (!amb) return;
    var a = amb;
    amb = null;
    if (w.fx) w.fx._amb = null;
    clearTimeout(a.timer);
    try {
      var c = a.ctx, t = c.currentTime;
      var v = a.master.gain.value;
      a.master.gain.cancelScheduledValues(t);
      a.master.gain.setValueAtTime(v, t);
      a.master.gain.linearRampToValueAtTime(0, t + 0.5);
      for (var i = 0; i < a.oscs.length; i++) { try { a.oscs[i].stop(t + 0.6); } catch (e) {} }
      for (i = 0; i < a.pings.length; i++) { try { a.pings[i].stop(t + 0.05); } catch (e) {} }
      setTimeout(function () {
        try { a.bed.disconnect(); a.master.disconnect(); } catch (e) {}
      }, 700);
    } catch (e) {}
  }
  function ambArmGesture() {
    if (amb || !snd.on) return;
    var kick = function () {
      d.removeEventListener("pointerdown", kick, true);
      w.removeEventListener("keydown", kick);
      if (snd.on && !amb) ambStart();
    };
    d.addEventListener("pointerdown", kick, true);
    w.addEventListener("keydown", kick);
  }
  /* 上次会话记着 ON：不在这里建 ctx（无手势会吃 autoplay 警告），等首次真实手势 */
  if (snd.on) ambArmGesture();
  d.addEventListener("visibilitychange", function () {
    if (!amb) return;
    try {
      if (d.hidden) { if (amb.ctx.suspend) amb.ctx.suspend().catch(function () {}); }
      else if (snd.on && amb.ctx.resume) amb.ctx.resume().catch(function () {});
    } catch (e) {}
  });
  if (btn) btn.addEventListener("click", function () {
    snd.on = !snd.on;
    try { localStorage.setItem("deck-snd", snd.on ? "1" : "0"); } catch (e) {}
    paint();
    if (snd.on) { blip("up"); ambStart(); }
    else ambStop();
  });
  d.addEventListener("click", function (e) {
    /* 播放器自己的按钮（sig-card / tape）由 tape.js 显式 blip，这里跳过防双响 */
    if (e.target && e.target.closest && e.target.closest("a,button") &&
        !e.target.closest(".sig-card, .tape")) blip("click");
  }, true);
  w.fx = {
    blip: blip, hiss: hiss, snd: snd, _amb: null,
    emit: function (x, y, p) { if (laserEmit) laserEmit(x, y, p); },
    /* AMB-REACT 对外两口：setAudio 收 radio.js 的既有 AnalyserNode（不二次挂
       createMediaElementSource）；pulse 是换卡泄压脉冲，JS 侧指数衰减写 --pulse，
       reduced 时 no-op（frame 不跑，写了也没人消费） */
    setAudio: function (a) { try { anA = a; fdA = new Uint8Array(a.frequencyBinCount); } catch (e) {} },
    pulse: function (p) { if (!reduced) pulseE = Math.max(pulseE, Math.min(1, p || 0)); },
    ambCard: function (k) { cardKT = Math.max(0, Math.min(1.2, k == null ? 1 : k)); }
  };

  /* ---------- 子页返回件：落回上次停留的那张卡 ----------
     chrome 的 HOME 胶囊与 /resume/ 的 BACK HOME 带 data-home-spot，href 里写死的
     #c-home 只是兜底。deck.js 在离开首页时把 active 卡 id 存进 sessionStorage，
     这里在「页间绿幕转场」之前（同一个 click、更早注册）把尾部换成那个 id，
     转场处理器随后读到的就是改写后的地址。触屏/键盘/新标签无记录 → 原样回顶部。 */
  d.addEventListener("click", function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest("[data-home-spot]") : null;
    if (!a || d.getElementById("deck")) return; /* 首页上没有返回件，别把停留位往回翻 */
    var spot = "";
    try { spot = sessionStorage.getItem("deck-spot") || ""; } catch (err) {}
    if (!/^c-[a-z0-9-]+$/i.test(spot)) return;
    var href = a.getAttribute("href") || "";
    if (/#c-home$/.test(href)) a.setAttribute("href", href.replace(/#c-home$/, "#" + spot));
  });

  /* ---------- 页间绿幕转场 ---------- */
  d.addEventListener("click", function (e) {
    if (reduced || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || a.target === "_blank" || a.hasAttribute("download")) return;
    if (/^([a-z]+:)?\/\//i.test(href) && a.host !== location.host) return;
    e.preventDefault();
    /* 留标记给下一幕：新页首绘前由 head 内联脚本挂 html.wipeout，把这块绿幕整体拉下 */
    try { sessionStorage.setItem("deck-wipe", "1"); } catch (err) {}
    d.body.classList.add("wiping");
    /* 幕布走完才走人：实测末格（delay .138s + 420ms）在 608ms 才到 scaleY(1)，
       580 会露一条底边，所以给到 640。dr 同理——幕布盖满之后才做 DOM 交换，
       交换途中观众看到的是幕布，不是半透页面。 */
    setTimeout(function () { location.href = a.href; }, 640);
  });
  w.addEventListener("pageshow", function (e) {
    if (e.persisted) d.body.classList.remove("wiping");
  });
})();
