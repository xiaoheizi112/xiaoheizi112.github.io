// 首页交互：导航底色、滚动淡入、数字滚动。无依赖。
(() => {
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 24);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { threshold: 0.12 });
  document.querySelectorAll(".rv").forEach((el) => io.observe(el));

  // 数字滚动：进入视口后 ~900ms 递增到 data-count 值
  const co = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      co.unobserve(e.target);
      const end = +e.target.dataset.count || 0;
      const t0 = performance.now();
      (function tick(t) {
        const p = Math.min((t - t0) / 900, 1);
        e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach((el) => co.observe(el));
})();
