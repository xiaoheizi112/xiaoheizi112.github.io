// 相册页交互：瀑布流按视觉顺序错峰进场 + 地点筛选淡切重排。无依赖，与 lightbox.js 独立。
(() => {
  const items = [...document.querySelectorAll(".photo-item")];
  if (!items.length) return;
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 进场：IntersectionObserver 触发，同一批进入视口的按"上→下、左→右"错开 70ms
  const io = new IntersectionObserver((es) => {
    const batch = es.filter((e) => e.isIntersecting).map((e) => e.target);
    if (!batch.length) return;
    if (reduce()) { batch.forEach((el) => el.classList.add("in")); return; }
    const r = (el) => el.getBoundingClientRect();
    batch.sort((a, b) => r(a).top - r(b).top || r(a).left - r(b).left);
    batch.forEach((el, i) => {
      el.style.transitionDelay = i * 70 + "ms";
      el.classList.add("in");
    });
  }, { threshold: 0.08 });
  items.forEach((el) => io.observe(el));

  // 进场结束后清掉 transition-delay，否则 hover 浮起也要等
  document.getElementById("main").addEventListener("transitionend", (e) => {
    if (e.propertyName === "opacity") e.target.style.transitionDelay = "";
  });

  // 地点筛选：切可见性后，对留下的图重放一次错峰淡入（FLIP 太贵，淡切够用）
  const chips = [...document.querySelectorAll(".chip")];
  chips.forEach((ch) => ch.addEventListener("click", () => {
    if (ch.classList.contains("on")) return;
    chips.forEach((c) => c.classList.toggle("on", c === ch));
    const f = ch.dataset.f;
    const shown = [];
    items.forEach((p) => {
      p.hidden = !!f && p.dataset.place !== f;
      if (!p.hidden) shown.push(p);
    });
    document.querySelectorAll(".year-sec").forEach((s) => {
      s.hidden = [...s.querySelectorAll(".photo-item")].every((p) => p.hidden);
    });
    if (reduce()) return;
    shown.forEach((el) => el.classList.remove("in"));
    requestAnimationFrame(() => {
      const r = (el) => el.getBoundingClientRect();
      shown.sort((a, b) => r(a).top - r(b).top || r(a).left - r(b).left);
      shown.forEach((el, i) => {
        el.style.transitionDelay = Math.min(i, 12) * 50 + "ms";
        el.classList.add("in");
      });
    });
  }));
})();

/* 锚点进入（#p-N）：进场动画的 translateY 会让 rect 漂（追着动目标滚不到位），
   用 offsetTop 链取布局位置定稿；懒加载补高再校准几轮，用户一滚轮立即交还控制权。 */
(() => {
  if (!/^#p-\d+$/.test(location.hash)) return;
  const el = document.getElementById(location.hash.slice(1));
  if (!el) return;
  const layoutTop = () => { let v = 0, n = el; while (n) { v += n.offsetTop; n = n.offsetParent; } return v; };
  const go = () => scrollTo({ top: layoutTop() - 88, behavior: "instant" });
  let userMoved = false, stable = 0, ticks = 0;
  addEventListener("wheel", () => { userMoved = true; }, { passive: true, once: true });
  go();
  const iv = setInterval(() => {
    if (userMoved || ++ticks > 16) return clearInterval(iv);
    if (Math.abs(el.getBoundingClientRect().top - 88) > 2) { go(); stable = 0; }
    else if (++stable > 2) clearInterval(iv);
  }, 250);
})();
