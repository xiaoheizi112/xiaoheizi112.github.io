/* ============================================================
 * welcome.js —— 01 屏循环欢迎语（2026-11 形式 A：终端提示符款）
 * 契约：data-welcome 是 home.yml welcome 列表的 jsonify；
 *   打字 12 CPS → 停留 2.6s → 快删 26 CPS → 歇 0.5s → 下一句，循环。
 *   IntersectionObserver(01 卡 0.35) + visibilitychange 双门控，滚走不空转。
 *   reduced-motion / 无 JS：不接管，服务端直出的第一句即成品。
 * ============================================================ */
(function () {
  "use strict";
  var el = document.getElementById("hero-welcome");
  var card = document.getElementById("c-home");
  if (!el || !card) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var textEl = el.querySelector(".hw-text");
  var list;
  try { list = JSON.parse(el.getAttribute("data-welcome") || "[]"); } catch (e) { list = []; }
  if (!textEl || !list.length) return;

  var HOLD = 2600, GAP = 500, TYPE_MS = 1000 / 12, DEL_MS = 1000 / 26;
  var idx = 0, pos = 0, phase = "type";
  var timer = null, running = false, visible = false;

  textEl.textContent = ""; /* 接管后从空行打起，服务端直出的第一句只是兜底 */

  function tick() {
    if (!running) return;
    var s = list[idx];
    if (phase === "type") {
      pos++;
      textEl.textContent = s.slice(0, pos);
      if (pos >= s.length) { phase = "hold"; timer = setTimeout(tick, HOLD); return; }
      timer = setTimeout(tick, TYPE_MS);
    } else if (phase === "hold") {
      phase = "del";
      timer = setTimeout(tick, DEL_MS);
    } else {
      pos--;
      textEl.textContent = pos > 0 ? s.slice(0, pos) : "";
      if (pos <= 0) {
        idx = (idx + 1) % list.length;
        phase = "type";
        timer = setTimeout(tick, GAP);
        return;
      }
      timer = setTimeout(tick, DEL_MS);
    }
  }
  function start() {
    if (running) return;
    running = true;
    timer = setTimeout(tick, 600);
  }
  function stop() {
    running = false;
    clearTimeout(timer);
  }

  new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      visible = e.isIntersecting;
      if (visible) start(); else stop();
    });
  }, { threshold: 0.35 }).observe(card);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else if (visible) start();
  });
})();
