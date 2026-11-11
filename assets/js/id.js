/* 03 ABOUT ME · 全息工牌引擎（2026-11 站主选型 B壳+A魂；卡 id 随 02/03 对调由 c-identity 改 c-about）
   三件事：① 开机认证状态机 pending→scanning→locked（CSS 默认态=完成态，reduce/无 JS 不接管）；
   ② 鼠标倾角+生物准星——只写 --bx/--by/--rx/--ry 自定义属性，绝不写 style.transform（deck.js:208 tilt 覆写契约）；
   ③ CONF 0.00→0.98 手搓计数（deck.js 的 [data-count] 只吃整数，这里要两位小数）。 */
(function () {
  var card = document.getElementById("c-about");
  if (!card || window.__idBooted) return;
  window.__idBooted = true;

  var badge = card.querySelector(".id-badge"),
      stage = card.querySelector(".id-stage"),
      ret = card.querySelector(".id-ret"),
      status = document.getElementById("id-status"),
      conf = document.getElementById("id-conf-n");
  if (!badge) return;

  var reduce = matchMedia("(prefers-reduced-motion: reduce)"),
      fine = matchMedia("(hover:hover) and (pointer:fine)");

  /* ---- ① 状态机 ---- */
  var booted = false;
  function boot() {
    if (booted || reduce.matches) return;
    booted = true;
    card.classList.add("id-pending");
    if (status) status.textContent = "STANDBY";
    setTimeout(function () {
      card.classList.remove("id-pending");
      card.classList.add("id-scanning");
      if (status) status.textContent = "SCANNING";
      countConf();
    }, 450);
    setTimeout(function () {
      card.classList.remove("id-scanning");
      card.classList.add("id-locked");
      if (status) status.textContent = "ONLINE";
      if (conf) conf.textContent = "0.98";
      if (fine.matches && stage) {
        stage.addEventListener("pointermove", move);
        stage.addEventListener("pointerleave", reset);
      }
    }, 2500);
  }
  function countConf() {
    if (!conf) return;
    var t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / 1200);
      conf.textContent = (0.98 * (1 - Math.pow(1 - p, 3))).toFixed(2);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- ② 倾角 + 准星（只写自定义属性） ---- */
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  function tick() {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    if (Math.abs(tx - cx) < 0.002 && Math.abs(ty - cy) < 0.002) { cx = tx; cy = ty; raf = 0; }
    else raf = requestAnimationFrame(tick);
    badge.style.setProperty("--bx", cx.toFixed(3));
    badge.style.setProperty("--by", cy.toFixed(3));
  }
  function move(e) {
    var r = badge.getBoundingClientRect();
    if (!r.width) return;
    var u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
    tx = Math.max(-1, Math.min(1, (u - 0.5) * 2));
    ty = Math.max(-1, Math.min(1, (v - 0.5) * 2));
    if (ret) {
      ret.style.setProperty("--rx", (Math.max(0, Math.min(1, u)) * 100).toFixed(1));
      ret.style.setProperty("--ry", (Math.max(0, Math.min(1, v)) * 100).toFixed(1));
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function reset() {
    tx = 0; ty = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  /* ---- 首次入屏才开机 ---- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) {
        if (es[i].isIntersecting) { boot(); io.disconnect(); }
      }
    }, { threshold: 0.35 });
    io.observe(card);
  } else boot();
})();
