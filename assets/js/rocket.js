/* ============================================================
   rocket.js —— 09 CONTACT 卡组件「代码火箭」（五代：A 精线工程稿 + M1 两段起飞）
   站主 2026-11 四轮：①下拉蓄力松手回顶 ②2D 动态模型 ③全息扫描线箭体 +
   平台 LED + hold-down 点火 ④做成 09 板块组件（停靠卡内、随卡纵深淡入淡出，
   整组下移 50px）+ 越拉越抖 ⑤R5=试验田手法9 定稿进站：箭体 96×192 原生 1:1
   （stroke 1px，鼻锥肩缝/舱段环缝/舷窗十字标线/后掠翼内筋/钟形喷管，待机焰
   全灭）；起飞弃 easeOutExpo（前 30% 时间走 87% 行程=主角失踪），改
   bez(.52,.02,.80,.88) 数值求值两段起飞——缓慢离台→加速冲出，焰长/倾角吃
   真实速度比，起飞段低频横摆（JS 逐帧解曲线，CSS 不用裸 cubic-bezier）。
   因果链：火箭是 #c-contact 卡内 absolute 组件——0.88 进度门退役，可见性=
   卡片可见性（deck.js 纵深 op/sc 天然带它淡入淡出）；按住箭体下拉蓄力
   （CHG=拖拽真比例；震颤每帧连续写、幅度 ∝ chg^1.7 越拉越疯，满蓄 ±3.5px；
   焰三层 grow、LED 行按蓄力点亮、过刻度 blip 升调、字粒预喷吃焰尖真位置）→
   松手进 hold-down 点火台（IGNITION 读数、震颤×1.6 拉满档以上、满焰、LED
   全亮，140ms）→ 到点起飞瞬间【脱坞】到 body 做视口级飞行（不跟着卡沉下去
   变暗——飞行是离开这个板块的动作）：爆闪+冲击环+沿地线冲击波 .fire，
   箭体 --fly 与 deck.scrollTop 同一条 M1 曲线（数值求值）同步到顶（VEL=真实 px/s，
   尾焰 fx.emit 吃真实速度比，LED 随推力衰减）→ 落地【回坞】09 卡（此刻卡
   在文档底部屏外，--fly=1 无跳变；顶页不留火箭由「卡不在视野」天然保证），
   520ms 后静默复位待机。
   轻点/键盘（Enter/Space）= 满推力走同一 hold-down；蓄力 <15% 松手 =
   ABORT·LOW 弹簧回位，绝不假装发射。reduced 不挂 hold 不接管拖拽（一键
   scrollTo auto 瞬回）。触屏/窄屏/矮视口/reduced 降级样式在 90。
   样式契约在 48-rocket.css；焰尖公式 = 132 + 52×1.5×chg（外焰 path 顶点
   y=184、scaleY 系数 1.5，与 48 的 .rk-fl-o 两处同步改）。
   教训（历代）：release() 先存 power 再清零；bail 监听挂 window capture；
   land 保持 --fly=1 再复位防顶页残留；viaPointer 防 pointerdown+click 双发。
   ============================================================ */
(function (w, d) {
  'use strict';
  if (!d.body || !d.body.classList.contains('is-home')) return;
  var deck = d.getElementById('deck');
  if (!deck) return;
  var host = d.getElementById('c-contact');   /* 09 卡：火箭的坞 */
  if (!host) return;

  var reduced = w.matchMedia('(prefers-reduced-motion: reduce)');
  var MINCHG = 0.15;    /* 低于此蓄力 = 中止 */
  var SHAKE = 7;        /* 满蓄震颤幅度 px（±SHAKE/2；曲线 chg^1.7，试验田标定） */
  var HOLD_MS = 140;    /* hold-down 点火延迟：松手先按住点火台再起飞 */
  var TRAVEL_FALLBACK = 160;
  /* ---- M1 两段起飞（试验田手法9 定稿）：bez(.52,.02,.80,.88) 前 ~20% 时间
     缓慢离台→中段加速→平尾自然出画。JS 逐帧数值求值（CSS 裸 cubic-bezier
     禁令只管 transition，这里不吃 CSS）。SMAX=曲线斜率峰值（64 点采样），
     焰长/倾角吃归一化真实速度比。 ---- */
  var FULL_DUR = 780;   /* 满推力飞行时长 ms（低推力线性放长到 ~1134） */
  var SWAY = 2.2, SWAY_HZ = 0.7, TILT = 1.8;   /* 横摆 px / 频率 Hz / 最大倾角 deg */
  var FL_MAX = 1.5;     /* 满焰倍率（与 48 .rk-fl-o scaleY 系数、flameTipPx 三处同步） */
  function bez(x1, y1, x2, y2) {
    var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    var cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    function sx(t) { return ((ax * t + bx) * t + cx) * t; }
    function sy(t) { return ((ay * t + by) * t + cy) * t; }
    function dx(t) { return (3 * ax * t + 2 * bx) * t + cx; }
    return function (x) {
      if (x <= 0) return { y: 0, d: dx(0) > 0 ? sy(0.0001) / sx(0.0001) : 0 };
      if (x >= 1) return { y: 1, d: 0 };
      var t = x, i, err, dv;
      for (i = 0; i < 8; i++) {
        err = sx(t) - x;
        if (w.Math.abs(err) < 1e-5) break;
        dv = dx(t);
        if (w.Math.abs(dv) < 1e-6) break;
        t -= err / dv;
      }
      if (t < 0) t = 0; if (t > 1) t = 1;
      var dsv = dx(t);
      return { y: sy(t), d: dsv > 1e-6 ? ((3 * ay * t + 2 * by) * t + cy) / dsv : 0 };
    };
  }
  var CURVE = bez(0.52, 0.02, 0.80, 0.88);
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  var SMAX = (function () {           /* 斜率峰值：归一化速度比的分母 */
    var m = 0.001, i, c;
    for (i = 0; i <= 64; i++) { c = CURVE(i / 64); if (c.d > m) m = c.d; }
    return m;
  })();

  /* ---------- DOM：注入 09 卡（absolute 停靠） ---------- */
  var box = d.createElement('div');
  box.className = 'rk';
  box.innerHTML =
    '<div class="rk-pad">' +
      '<button class="rk-btn" type="button" aria-label="火箭回顶：下拉蓄力，松手点火发射" title="下拉蓄力 · 松手发射">' +
        '<svg class="rk-svg" viewBox="0 0 96 192" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<defs>' +
            '<pattern id="rk-scan" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3H6" stroke="currentColor" stroke-width="1" opacity=".28"/></pattern>' +
            '<filter id="rk-turb" x="-60%" y="-30%" width="220%" height="180%"><feTurbulence type="fractalNoise" baseFrequency="0.09 0.06" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>' +
          '</defs>' +
          '<g class="rk-body">' +
            '<path d="M48 10C40.5 18 33 32 33 52L33 118L63 118L63 52C63 32 55.5 18 48 10Z" fill="var(--d-card)"/>' +
            '<path d="M48 10C40.5 18 33 32 33 52L33 118L63 118L63 52C63 32 55.5 18 48 10Z" fill="url(#rk-scan)" stroke="none"/>' +
            '<path d="M33 52L63 52M33 57L63 57" opacity=".8"/>' +
            '<path d="M33 96L63 96" opacity=".5"/>' +
            '<circle cx="48" cy="74" r="8.5"/>' +
            '<path d="M48 65.5L48 68.5M48 82.5L48 79.5M39.5 74L42.5 74M56.5 74L53.5 74"/>' +
            '<circle cx="48" cy="74" r="1.3" fill="currentColor" stroke="none" opacity=".85"/>' +
            '<path d="M33 96L12 132L33 118" fill="var(--d-card)"/>' +
            '<path d="M63 96L84 132L63 118" fill="var(--d-card)"/>' +
            '<path d="M31 102L20 126M65 102L76 126" opacity=".45"/>' +
            '<path d="M33 118L42 124M63 118L54 124"/>' +
            '<path d="M42 124C40 127 38.5 130 38 132L58 132C57.5 130 56 127 54 124Z" fill="var(--d-card)"/>' +
            '<path d="M42 124L54 124" opacity=".6"/>' +
          '</g>' +
          '<g filter="url(#rk-turb)">' +
            '<g class="rk-fl rk-fl-o"><path d="M38 132C38 152 42 166 48 184C54 166 58 152 58 132C52 135 44 135 38 132Z" fill="var(--d-acid)" stroke="none"/></g>' +
            '<g class="rk-fl rk-fl-m"><path d="M41.5 132C41.5 148 44.5 158 48 172C51.5 158 54.5 148 54.5 132C50.5 134 45.5 134 41.5 132Z" fill="var(--d-acid)" stroke="none"/></g>' +
            '<g class="rk-fl rk-fl-i"><path d="M44 132C44 144 45.8 150 48 160C50.2 150 52 144 52 132C49.5 133.5 46.5 133.5 44 132Z" fill="var(--d-white)" stroke="none"/>' +
            '<path d="M46.2 137L48 144.5L49.8 137Z" fill="var(--d-acid)" stroke="none" opacity=".8"/></g>' +
          '</g>' +
        '</svg>' +
      '</button>' +
      '<svg class="rk-pads" viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true">' +
        '<path d="M22 0 L44 0 M76 0 L98 0"/>' +
        '<path d="M22 0 L14 40 M98 0 L106 40"/>' +
        '<path d="M18 20 L102 20"/>' +
        '<path d="M6 40 L114 40"/>' +
        '<path d="M12 48 L20 40 M24 48 L32 40 M36 48 L44 40 M48 48 L56 40 M60 48 L68 40 M72 48 L80 40 M84 48 L92 40 M96 48 L104 40"/>' +
        '<circle class="rk-led" cx="30" cy="50" r="2.2"/><circle class="rk-led" cx="45" cy="50" r="2.2"/><circle class="rk-led" cx="60" cy="50" r="2.2"/><circle class="rk-led" cx="75" cy="50" r="2.2"/><circle class="rk-led" cx="90" cy="50" r="2.2"/>' +
        '<text x="112" y="56" font-size="9" fill="#97a49e" stroke="none" text-anchor="end" font-family="JetBrains Mono, ui-monospace, monospace">PAD-01</text>' +
      '</svg>' +
      '<span class="rk-mz"></span><span class="rk-rg"></span><span class="rk-sw"></span>' +
    '</div>' +
    '<div class="rk-read">RDY</div>';
  host.appendChild(box);

  var btn = box.querySelector('.rk-btn');
  var read = box.querySelector('.rk-read');
  var leds = box.querySelectorAll('.rk-led');

  /* ---------- 读数与状态 ---------- */
  function travel() {
    var v = parseFloat(w.getComputedStyle(box).getPropertyValue('--rk-travel'));
    return isFinite(v) && v > 0 ? v : TRAVEL_FALLBACK;
  }

  var flying = false, dragging = false, viaPointer = false, holding = false;
  var chg = 0, pull = 0;

  /* ---------- 坞位：默认停 09 卡内；发射瞬间脱坞到 body 做视口级飞行 ---------- */
  function dock() {
    if (box.parentNode === host) return;
    box.classList.remove('detached');
    box.style.top = box.style.left = box.style.right = '';
    box.style.translate = '';
    host.appendChild(box);
  }
  function detach() {
    if (box.parentNode !== host) return;
    var r = box.getBoundingClientRect();
    box.classList.add('detached');
    box.style.top = r.top + 'px';
    box.style.left = r.left + 'px';
    box.style.right = 'auto';
    box.style.translate = '0 0';
    d.body.appendChild(box);
  }

  /* ---------- 蓄力写值：--chg 驱动焰/LED/辉光；震颤归 dragStep/holdStep 专属 ---------- */
  function chgNow() {
    var v = parseFloat(box.style.getPropertyValue('--chg'));
    return isFinite(v) ? v : 0;
  }
  /* 焰尖 y（px，相对 .rk-btn 顶）：viewBox 喷口 y=132、外焰最长至 184（52 单位，
     1:1 渲染不乘倍），scaleY = chg×1.5（48-rocket.css .rk-fl-o，与 FL_MAX 三处同步）。
     chg=0 时焰长为 0——待机全灭，点火才生长。 */
  function flameTipPx() { return 132 + 52 * FL_MAX * chgNow(); }

  function setCharge(v) {
    chg = v < 0 ? 0 : v > 1 ? 1 : v;
    box.style.setProperty('--chg', chg.toFixed(3));
  }
  function zeroShake() {
    box.style.setProperty('--sx', '0px');
    box.style.setProperty('--sy', '0px');
    box.style.setProperty('--rz', '0deg');
  }
  function setPull(px) {
    pull = px;
    box.style.setProperty('--pull', px.toFixed(1) + 'px');
  }
  function setLEDs(v) {
    var n = w.Math.round((v < 0 ? 0 : v > 1 ? 1 : v) * 5);
    for (var i = 0; i < leds.length; i++) leds[i].classList.toggle('lit', i < n);
  }

  /* ---------- 拖拽链 ---------- */
  var startY = 0, moved = 0, lastMark = -1, preTimer = 0;
  var MARKS = [0.25, 0.5, 0.75, 1];
  var MARK_KIND = ['click', 'up', 'up', 'hover'];

  function blip(kind) { if (w.fx && w.fx.blip) w.fx.blip(kind); }

  /* 连续震颤：鼠标停也抖，幅度 ∝ chg^1.7（试验田标定：25%≈±0.35 无感、
     50%≈±0.9、75%≈±2.2、100%≈±3.5）；dragging=false 下一帧自然停 */
  function dragStep() {
    if (!dragging) return;
    var amp = SHAKE * w.Math.pow(chgNow(), 1.7);
    box.style.setProperty('--sx', ((w.Math.random() - 0.5) * amp).toFixed(2) + 'px');
    box.style.setProperty('--sy', ((w.Math.random() - 0.5) * amp * 0.7).toFixed(2) + 'px');
    w.requestAnimationFrame(dragStep);
  }

  btn.addEventListener('pointerdown', function (e) {
    if (flying || holding || reduced.matches) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragging = true; viaPointer = true;
    startY = e.clientY; moved = 0; lastMark = -1;
    box.classList.add('armed');
    box.classList.remove('low', 'land');
    read.textContent = 'CHG 000%';
    dragStep();
    try { btn.setPointerCapture(e.pointerId); } catch (err) {}
    e.preventDefault();
  });

  btn.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dy = e.clientY - startY;
    if (dy < 0) dy = 0;               /* 上推不蓄力 */
    if (dy > moved) moved = dy;
    var tv = travel();
    var v = dy / tv;
    setCharge(v);
    setPull(dy > tv ? tv : dy);       /* 超行程软顶 */
    setLEDs(v);
    read.textContent = 'CHG ' + String(w.Math.round(w.Math.min(v, 1) * 100)).padStart(3, '0') + '%';
    for (var i = 0; i < MARKS.length; i++) {
      if (v >= MARKS[i] && lastMark < i) { lastMark = i; blip(MARK_KIND[i]); }
    }
    /* 预喷字粒：chg>0.08 每 ~55ms 一发，打在焰尖（试验田增强档） */
    if (v > 0.08 && w.fx && w.fx.emit) {
      var now = performance.now();
      if (now - preTimer > 55) {
        preTimer = now;
        var r = btn.getBoundingClientRect();
        w.fx.emit(r.left + r.width / 2, r.top + flameTipPx(), v * 0.6);
      }
    }
  });

  function release(e) {
    if (!dragging) return;
    dragging = false;
    var power = chg;                                   /* 先存：setCharge(0) 会清零，判定必须用松手瞬间真值 */
    box.classList.remove('armed');
    setCharge(0);
    setPull(0);
    try { btn.releasePointerCapture(e.pointerId); } catch (err) {}
    if (moved < 6) { ignite(1); return; }              /* 轻点 = 满推力，同样过点火台 */
    if (power < MINCHG) { zeroShake(); setLEDs(0); abort(); return; } /* 低蓄力 = 中止，不假发射 */
    ignite(power);                                     /* 震颤由 holdStep 无缝接管 */
  }
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', function () {
    if (!dragging) return;
    dragging = false; viaPointer = false;
    box.classList.remove('armed');
    setCharge(0); zeroShake(); setPull(0); setLEDs(0);
  });

  function abort() {
    box.classList.add('low');
    read.textContent = 'ABORT · LOW';
    blip('click');
    w.setTimeout(function () {
      box.classList.remove('low');
      if (!flying && !dragging && !holding) read.textContent = 'RDY';
    }, 900);
  }

  /* ---------- hold-down 点火台：按住 140ms（震颤×1.6=拉满档以上、满焰、LED 全亮）才起飞 ---------- */
  function ignite(power) {
    if (reduced.matches) { launch(power); return; }    /* reduced 不挂 hold（拖拽本就不接管） */
    holding = true;
    box.classList.remove('low');
    box.classList.add('hold');
    read.textContent = 'IGNITION';
    blip('hover');                                     /* 「我按到了」即时确认 */
    setCharge(1);
    setLEDs(1);
    var t0 = performance.now();
    function holdStep(now) {
      if (!holding) return;
      var amp = SHAKE * 1.6;
      box.style.setProperty('--sx', ((w.Math.random() - 0.5) * amp).toFixed(2) + 'px');
      box.style.setProperty('--sy', ((w.Math.random() - 0.5) * amp * 0.7).toFixed(2) + 'px');
      if (now - t0 >= HOLD_MS) {
        holding = false;
        box.classList.remove('hold');
        launch(power);
        return;
      }
      w.requestAnimationFrame(holdStep);
    }
    w.requestAnimationFrame(holdStep);
  }

  /* ---------- 起飞：脱坞 → 爆闪+冲击环+冲击波 .fire，箭体 --fly 与 scrollTop 同曲线 ---------- */
  function launch(power) {
    if (power > 1) power = 1;
    var from = deck.scrollTop;
    if (from < 10) {
      zeroShake(); setLEDs(0);
      read.textContent = 'AT TOP';
      w.setTimeout(function () { if (!flying && !dragging && !holding) read.textContent = 'RDY'; }, 900);
      return;
    }
    flying = true;
    zeroShake();
    detach();                                          /* 飞行是视口级动作：不能跟着卡沉下去变暗 */
    box.classList.remove('low');
    box.classList.add('fly', 'fire');
    w.setTimeout(function () { box.classList.remove('fire'); }, 600); /* 三代 600ms：sw .34 + ring .42 全演完 */

    /* --rise = 视觉升程：当前位置窜出视口顶即止（与滚动距离 from 无关！） */
    var rect0 = btn.getBoundingClientRect();
    box.style.setProperty('--rise', (rect0.top + rect0.height + 40) + 'px');
    var dur = FULL_DUR + (1 - power) * 354;    /* 满推力 780ms，低推力冲量不足放长到 ~1134ms */
    var t0 = performance.now();
    var lastY = from, lastT = t0;

    function step(now) {
      if (!flying) return;
      var t = now - t0;
      var p = t / dur;
      if (p >= 1) p = 1;
      var c = CURVE(p);                          /* M1 两段起飞：~20% 时间缓慢离台→加速→平尾出画 */
      var vRel = clamp(c.d / SMAX);              /* 归一化曲线速度（斜率峰值=1） */
      var y = w.Math.round(from * (1 - c.y));
      deck.scrollTop = y;
      box.style.setProperty('--fly', c.y.toFixed(4));
      /* 姿态：起飞段低频横摆（离台最强、随升程衰减）+ 速度方向微倾（paddle 不跟倾） */
      var damp = w.Math.pow(1 - p, 1.3);
      var sx = SWAY * w.Math.sin(2 * w.Math.PI * SWAY_HZ * t / 1000) * damp;
      var sy = SWAY * 0.35 * w.Math.sin(2 * w.Math.PI * SWAY_HZ * 1.7 * t / 1000 + 1.3) * damp;
      box.style.setProperty('--sx', sx.toFixed(2) + 'px');
      box.style.setProperty('--sy', sy.toFixed(2) + 'px');
      box.style.setProperty('--rz', ((sx / SWAY) * TILT * (0.5 + 0.5 * vRel)).toFixed(2) + 'deg');
      /* 焰长吃真实速度比；头 240ms 为 hold 满焰的点火残温续燃（从 1 无缝衔接防断焰） */
      var chgv = w.Math.max(w.Math.max(0, 1 - t / 240), 0.25 + 0.75 * vRel);
      box.style.setProperty('--chg', chgv.toFixed(3));
      setLEDs(chgv);

      var dt = (now - lastT) / 1000;
      if (dt > 0) {
        var vel = w.Math.abs(lastY - y) / dt;
        read.textContent = 'VEL ' + String(w.Math.round(w.Math.min(9999, vel))).padStart(4, '0');
        if (w.fx && w.fx.emit) {
          var r = btn.getBoundingClientRect();
          w.fx.emit(r.left + r.width / 2, r.top + flameTipPx(), w.Math.min(3, vel > 3500 ? 1 : vel / 3500));
        }
        lastY = y; lastT = now;
      }
      if (p >= 1) { land(); return; }
      w.requestAnimationFrame(step);
    }
    w.requestAnimationFrame(step);
  }

  function land() {
    flying = false;
    deck.scrollTop = 0;
    box.classList.remove('fly');
    box.classList.add('land');
    setCharge(0);
    setPull(0);
    zeroShake();
    setLEDs(0);
    /* 保持 --fly=1 回坞：此刻 09 卡沉在文档底部屏外，火箭在卡内上移 rise
       仍处屏外——无跳变；顶页不留火箭由「卡不在视野」天然保证。
       520ms 后静默复位，下次滑回 09 见它好好停在坞位 */
    dock();
    read.textContent = 'TOUCHDOWN';
    blip('click');
    w.setTimeout(function () {
      box.style.setProperty('--fly', '0');
      box.style.setProperty('--rise', '0px');
      box.classList.remove('land');
    }, 520);
  }

  /* 飞行/点火中用户强行滚动 = 就地放弃（bail），不跟用户抢方向盘 */
  function bail() {
    if (holding) {
      holding = false;
      box.classList.remove('hold');
      setCharge(0); zeroShake(); setPull(0); setLEDs(0);
      read.textContent = 'ABORT · TAKEOVER';
      w.setTimeout(function () { if (!flying && !dragging && !holding) read.textContent = 'RDY'; }, 900);
      return;
    }
    if (!flying) return;
    flying = false;
    box.classList.remove('fly', 'fire');
    setCharge(0); zeroShake(); setPull(0); setLEDs(0);
    box.style.setProperty('--fly', '0');
    box.style.setProperty('--rise', '0px');
    dock();                                            /* 半途放弃也要回坞 */
    read.textContent = 'ABORT · TAKEOVER';
    w.setTimeout(function () { if (!flying && !dragging && !holding) read.textContent = 'RDY'; }, 900);
  }
  /* 监听挂 window capture：滚轮/触摸落在页面任何处都能收到 bail（历代教训，
     火箭改卡内组件后依然成立——事件路径不经 deck 也能兜住） */
  w.addEventListener('wheel', bail, { passive: true, capture: true });
  w.addEventListener('touchstart', bail, { passive: true, capture: true });

  /* 切后台：点火中直接起飞、飞行中直接送达，回来只见顶 */
  d.addEventListener('visibilitychange', function () {
    if (!d.hidden) return;
    if (holding) { holding = false; box.classList.remove('hold'); launch(1); return; }
    if (flying) { flying = false; land(); }
  });

  /* ---------- 键盘 / reduced / 轻点保底：click（viaPointer 防 pointerup 双发） ---------- */
  btn.addEventListener('click', function () {
    if (viaPointer) { viaPointer = false; return; }
    if (flying || dragging || holding) return;
    if (reduced.matches) {
      deck.scrollTo({ top: 0, behavior: 'auto' });
      box.classList.add('land');
      setLEDs(0);
      read.textContent = 'TOUCHDOWN';
      w.setTimeout(function () { box.classList.remove('land'); read.textContent = 'RDY'; }, 520);
      return;
    }
    ignite(1);
  });
  btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
})(window, document);
