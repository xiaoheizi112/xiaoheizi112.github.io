// 首页交互：导航底色、滚动淡入、数字滚动。无依赖。
(() => {
  const nav = document.getElementById("nav");
  if (nav) { // 相册等页面没有这个 id，缺 guard 会让后面的淡入逻辑整个不执行
    const onScroll = () => nav.classList.toggle("scrolled", scrollY > 24);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // 滚动主题长背景：哪个板块占据视口中线，body 就切到对应氛围层
  const themeOf = { home: "morning", about: "morning", posts: "ink", music: "sound", photos: "sea", contact: "hello" };
  const ao = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) document.body.dataset.theme = themeOf[e.target.id];
  }, { rootMargin: "-45% 0px -45% 0px" });
  document.querySelectorAll("#home,#about,#posts,#music,#photos,#contact").forEach((s) => ao.observe(s));

  // 视差量：--sy 每帧写一次，图标按各自 --px 系数反向漂移，制造长图跟手感
  let syRaf = 0;
  addEventListener("scroll", () => {
    if (syRaf) return;
    syRaf = requestAnimationFrame(() => { syRaf = 0; document.documentElement.style.setProperty("--sy", scrollY); });
  }, { passive: true });

  // 返回顶部：滚过一屏才浮现，避开右下角播放器的高度
  const toTop = document.getElementById("to-top");
  if (toTop) {
    const chk = () => toTop.classList.toggle("show", scrollY > innerHeight * .8);
    addEventListener("scroll", chk, { passive: true });
    chk();
    toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  }

  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { threshold: 0.12 });
  // 同板块内多个 .rv 错峰进场：每个比前一个晚 90ms
  document.querySelectorAll("section .rv").forEach((el) => {
    const sibs = [...el.parentElement.querySelectorAll(":scope > .rv")];
    el.style.transitionDelay = sibs.indexOf(el) * 90 + "ms";
  });
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

  // 联系板块复制按钮：写入剪贴板，按钮变"已复制"1.2s 后还原
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      try { await navigator.clipboard.writeText(text); }
      catch (e) { // http/旧内核降级：临时 textarea + execCommand
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e2) {}
        ta.remove();
      }
      btn.classList.add("ok"); btn.textContent = "已复制";
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { btn.classList.remove("ok"); btn.textContent = "复制"; }, 1200);
    });
  });

  // 音乐卡片点击 → 转发给右下角胶卷播放器对应曲目
  document.querySelectorAll("#music .track").forEach((el, i) => {
    el.addEventListener("click", () => window.tape && window.tape.play(i));
  });
})();

// 点格纸光标透镜：鼠标附近格点被轻微推开、放大、压成褐金铅笔色，停下即淡出。仅精确指针 + 允许动效时启用。
(() => {
  const cv = document.getElementById("dot-lens");
  if (!cv) return;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = cv.getContext("2d");
  const GAP = 26, R = 120; // GAP 与 body 点阵 background-size 一致
  let w = 0, h = 0, mx = -1e4, my = -1e4, s = 0, raf = 0, lastMove = 0;

  function resize() {
    const d = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    cv.width = w * d; cv.height = h * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  function frame() {
    raf = 0;
    if (document.hidden) { s = 0; return; }
    ctx.clearRect(0, 0, w, h);
    if (s > 0.01) {
      // 透镜中心墨晕
      const g = ctx.createRadialGradient(mx, my, 0, mx, my, R * .45);
      g.addColorStop(0, `rgba(122,104,73,${.05 * s})`);
      g.addColorStop(1, "rgba(122,104,73,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(mx, my, R * .45, 0, 7); ctx.fill();
      // 范围内的格点：径向推开 + 放大 + 上色。CSS 点阵在 26px 瓦片中心（偏移 13），
      // body 背景随文档滚动，反算回视口坐标：x=13+26k，y=13-scrollY+26k，保证逐像素同相位
      const ox = 13, oy = ((13 - scrollY) % GAP + GAP) % GAP;
      for (let x = ox + Math.ceil((mx - R - ox) / GAP) * GAP; x <= mx + R; x += GAP) {
        for (let y = oy + Math.ceil((my - R - oy) / GAP) * GAP; y <= my + R; y += GAP) {
          const dx = x - mx, dy = y - my, d = Math.hypot(dx, dy);
          if (d > R || (dx === 0 && dy === 0)) continue;
          const k = (1 - d / R) ** 2 * s;
          const off = 7 * k;
          ctx.fillStyle = `rgba(122,104,73,${(.06 + .3 * k) * s})`;
          ctx.beginPath();
          ctx.arc(x + dx / d * off, y + dy / d * off, 1.1 + 2.4 * k, 0, 7);
          ctx.fill();
        }
      }
      s *= performance.now() - lastMove < 120 ? .97 : .88; // 移动中基本维持，停下约 0.3s 淡出
      loop();
    } else { s = 0; ctx.clearRect(0, 0, w, h); }
  }
  function loop() { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); }
  function wake(x, y) { mx = x; my = y; lastMove = performance.now(); s = Math.min(1, s + .12); loop(); }

  addEventListener("mousemove", (e) => wake(e.clientX, e.clientY), { passive: true });
  addEventListener("scroll", loop, { passive: true });
  addEventListener("resize", () => { resize(); loop(); });
  addEventListener("visibilitychange", () => { if (!document.hidden) { s = 0; resize(); } });
  resize();
})();
