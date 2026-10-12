// 首页交互：导航底色、滚动淡入、数字滚动。无依赖。
(() => {
  const nav = document.getElementById("nav");
  if (nav) { // 相册等页面没有这个 id，缺 guard 会让后面的淡入逻辑整个不执行
    const onScroll = () => nav.classList.toggle("scrolled", scrollY > 24);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // 滚动主题长背景：哪个板块占据视口中线，body 就切到对应氛围层；同步高亮导航里对应的栏目
  const themeOf = { home: "morning", about: "morning", posts: "ink", music: "sound", photos: "sea", interests: "play", contact: "hello" };
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const setActive = (sel) => {
    navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === sel));
  };
  const ao = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) {
      document.body.dataset.theme = themeOf[e.target.id];
      setActive("#" + e.target.id);
    }
  }, { rootMargin: "-45% 0px -45% 0px" });
  document.querySelectorAll("#home,#about,#posts,#music,#photos,#interests,#contact").forEach((s) => ao.observe(s));
  // 滚回顶部（hero 区）时清掉高亮
  addEventListener("scroll", () => { if (scrollY < innerHeight * 0.5) setActive(""); }, { passive: true });

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
  // .rv 观察器已接上，index.html 的首帧兜底脚本据此放弃强制显示
  window.__homeReady = true;

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

  // 联系板块复制按钮：写入剪贴板，按钮变"已复制"1.2s 后还原（文案随当前语言）。
  // 文案在 .copy-label 子节点上（带 data-zh/data-en 挂点），不能直接改按钮 textContent，否则会把挂点抹掉。
  const isEn = () => document.documentElement.dataset.lang === "en";
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      const label = btn.querySelector(".copy-label") || btn;
      try { await navigator.clipboard.writeText(text); }
      catch (e) { // http/旧内核降级：临时 textarea + execCommand
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e2) {}
        ta.remove();
      }
      btn.classList.add("ok"); label.textContent = isEn() ? "Copied" : "已复制";
      clearTimeout(btn._t);
      btn._t = setTimeout(() => {
        btn.classList.remove("ok");
        label.textContent = isEn() ? (label.getAttribute("data-en") || "Copy") : (label.getAttribute("data-zh") || "复制");
      }, 1200);
    });
  });

  // 音乐卡片点击 → 转发给右下角胶卷播放器对应曲目
  document.querySelectorAll("#music .track").forEach((el, i) => {
    el.addEventListener("click", () => window.tape && window.tape.play(i));
  });

  // 播放状态同步给音乐区：#tape.playing → #music.playing，耳机猫的尾巴跟着摆。
  // 注意 #tape 由 extend_footer 在 home.js 之后才挂进 DOM，直接 getElementById 会是 null，
  // 用一次性 MutationObserver 等它出现再挂钩子。
  const musicSec = document.getElementById("music");
  if (musicSec) {
    const hook = (tape) => {
      const syncPlaying = () => musicSec.classList.toggle("playing", tape.classList.contains("playing"));
      syncPlaying();
      new MutationObserver(syncPlaying).observe(tape, { attributes: true, attributeFilter: ["class"] });
    };
    const existing = document.getElementById("tape");
    if (existing) hook(existing);
    else {
      const wait = new MutationObserver(() => {
        const t = document.getElementById("tape");
        if (t) { wait.disconnect(); hook(t); }
      });
      wait.observe(document.documentElement, { childList: true, subtree: true });
    }
  }
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

// 卡片 3D 微倾斜：鼠标在卡片上移动时，卡片随指针位置做极小幅度的透视倾斜（最大 4deg），移开回正。
// 位移量走 rAF 缓动（无 CSS transition 依赖，故 .col-row 这类无 transform 过渡的卡片也能顺滑回正）。
// 仅精确指针 + 允许动效时启用；.tilt 由 JS 在悬停期间挂上，配合 CSS 合成旋转并复刻原有 hover 抬升。
(() => {
  const cards = document.querySelectorAll(".hobby-card, .post-card, .prod-card, .col-row");
  if (!cards.length) return;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const MAX = 4; // 最大倾角（度），克制不喧宾夺主

  cards.forEach((el) => {
    let inside = false, cx = 0, cy = 0;      // 指针状态
    let rx = 0, ry = 0, tRX = 0, tRY = 0;    // 当前/目标倾角
    let raf = 0;

    function step() {
      raf = 0;
      const r = el.getBoundingClientRect();
      if (inside && r.width && r.height) {
        // 指针相对卡片中心归一化到 -0.5..0.5，再放大到 ±MAX
        const nx = (cx - r.left) / r.width - 0.5;
        const ny = (cy - r.top) / r.height - 0.5;
        tRY = Math.max(-MAX, Math.min(MAX, nx * 2 * MAX));  // 水平移动 → rotateY
        tRX = Math.max(-MAX, Math.min(MAX, -ny * 2 * MAX)); // 垂直移动 → rotateX
      } else { tRX = 0; tRY = 0; }
      rx += (tRX - rx) * 0.18;
      ry += (tRY - ry) * 0.18;
      if (Math.abs(tRX - rx) < 0.03 && Math.abs(tRY - ry) < 0.03) { rx = tRX; ry = tRY; }
      el.style.setProperty("--tx", rx.toFixed(2) + "deg");
      el.style.setProperty("--ty", ry.toFixed(2) + "deg");
      if (!inside && rx === 0 && ry === 0) { // 已回正且指针离开：卸下 .tilt，交还 CSS
        el.classList.remove("tilt");
        el.style.removeProperty("--tx");
        el.style.removeProperty("--ty");
        return;
      }
      schedule();
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(step); }

    el.addEventListener("pointermove", (e) => {
      if (!inside) { inside = true; el.classList.add("tilt"); }
      cx = e.clientX; cy = e.clientY; schedule();
    }, { passive: true });
    el.addEventListener("pointerleave", () => { inside = false; schedule(); });
  });
})();

// 右下「此刻」挂件：小圆显示当前 HH:MM，点它冒一句随机「摸鱼/慢生活」小语，3.6s 后自动收起。
// 位置在返回顶部（right26/bottom88）之上，不与播放器（bottom18）和右上水印重叠。
(() => {
  const PHRASES_ZH = [
    "有空多睡觉，没空少看书。",
    "慢慢来，比较快。",
    "摸鱼，是工作的标点符号。",
    "晒太阳这事，不用急着做完。",
    "风把云吹走，也把烦恼吹走。",
    "今天先这样，其实也很好。",
    "发呆五分钟，给脑子放个假。",
    "走得慢的人，才看得见路边的花。"
  ];
  const PHRASES_EN = [
    "Sleep more when free, read less when busy.",
    "Go slow — it's the faster way.",
    "Slacking off is the punctuation of work.",
    "Sunbathing is not a task to finish.",
    "The wind takes the clouds, and the worries too.",
    "That's it for today — and that's fine.",
    "Five minutes of spacing out: a holiday for the brain.",
    "Only those who walk slowly see the flowers by the road."
  ];
  const el = document.createElement("div");
  el.className = "now-widget";
  el.innerHTML =
    '<button class="now-btn" type="button" aria-label="此刻">' +
      '<span class="now-time">--:--</span>' +
    '</button>' +
    '<div class="now-bubble" role="status" aria-live="polite"></div>';
  document.body.appendChild(el);

  const timeEl = el.querySelector(".now-time");
  const bubble = el.querySelector(".now-bubble");
  const btn = el.querySelector(".now-btn");

  // 时间：只写变化，避免每帧动 DOM
  const pad = (n) => (n < 10 ? "0" : "") + n;
  let lastT = "";
  function tick() {
    const d = new Date();
    const t = pad(d.getHours()) + ":" + pad(d.getMinutes());
    if (t !== lastT) { lastT = t; timeEl.textContent = t; }
  }
  tick();
  setInterval(tick, 1000);

  // 点击：按当前语言随机取一句（尽量不连续重复），冒泡 3.6s
  let last = -1, hideT = 0;
  btn.addEventListener("click", () => {
    const list = document.documentElement.dataset.lang === "en" ? PHRASES_EN : PHRASES_ZH;
    let i = (Math.random() * list.length) | 0;
    if (list.length > 1 && i === last) i = (i + 1) % list.length;
    last = i;
    bubble.textContent = list[i];
    el.classList.add("show");
    clearTimeout(hideT);
    hideT = setTimeout(() => el.classList.remove("show"), 3600);
  });
})();

// 滚动彩蛋：小橘猫偶尔从视口底边探出头瞄一眼。滚过一屏半后，每次滚动停下 0.6s 触发观察，
// 距上次至少 28s 才真的冒头，冒 2.2s 缩回去。仅首页、允许动效时启用。
(() => {
  if (!document.getElementById("home")) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = document.createElement("div");
  el.className = "cat-peeker";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML =
    '<svg viewBox="0 0 60 34" class="cat" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M19.5 10.5 L21 21.5 L27.5 18.5 Z" fill="var(--sun)" /><path d="M40.5 10.5 L39 21.5 L32.5 18.5 Z" fill="var(--sun)" />' +
    '<circle cx="30" cy="31" r="14" fill="var(--sun)" />' +
    '<ellipse cx="22" cy="34" rx="3.8" ry="2.3" fill="var(--sun)" />' +
    '<ellipse cx="38" cy="34" rx="3.8" ry="2.3" fill="var(--sun)" />' +
    '<g fill="none" stroke="var(--sun-deep)" stroke-width="1.5" stroke-linecap="round" opacity=".5">' +
    '<path d="M25.6 18.6 q2 -1.2 4.4 0"/><path d="M31.5 18.7 q2 -1.2 4.4 0"/></g>' +
    '<g class="eyes-closed" fill="none" stroke="var(--ink)" stroke-width="1.5" stroke-linecap="round">' +
    '<path d="M23.4 26 q2.2 1.9 4.4 0"/><path d="M32.2 26 q2.2 1.9 4.4 0"/></g>' +
    '<g class="eyes-open" fill="#2b3a42">' +
    '<ellipse cx="25.6" cy="26.2" rx="1.7" ry="2"/><ellipse cx="34.4" cy="26.2" rx="1.7" ry="2"/></g>' +
    '<path d="M28.9 28.6 h2.2 l-1.1 1.5 z" fill="var(--sun-deep)" /></svg>';
  document.body.appendChild(el);

  let last = 0, timer = 0;
  function peek() {
    last = Date.now();
    el.classList.add("up");
    setTimeout(() => el.classList.remove("up"), 2200);
  }
  addEventListener("scroll", () => {
    if (scrollY < innerHeight * 1.5 || Date.now() - last < 28000) return;
    clearTimeout(timer);
    timer = setTimeout(() => { if (Date.now() - last >= 28000) peek(); }, 700);
  }, { passive: true });
  // 首屏进来 12s 后也给一次机会（没滚动的读者也能遇到）
  setTimeout(() => { if (!last && scrollY >= innerHeight * 1.5) peek(); }, 12000);
})();

// 首页中英切换：改 html[data-lang]，把所有 [data-zh]/[data-en] 元素的文本换成当前语言，
// 记忆到 localStorage.lang（与深浅色同理，跨访问保留）。仅首页有这些元素，其它页面无副作用。
(() => {
  const btn = document.querySelector(".lang-btn");
  if (!btn) return;
  const cur = btn.querySelector(".lang-cur");
  const apply = (lang) => {
    document.documentElement.dataset.lang = lang;
    document.querySelectorAll("[data-zh][data-en]").forEach((el) => {
      const v = el.getAttribute(lang === "en" ? "data-en" : "data-zh");
      if (v != null) el.textContent = v;
    });
    // 带提示的气泡也跟随（data-zh-tip / data-en-tip）
    document.querySelectorAll("[data-zh-tip][data-en-tip]").forEach((el) => {
      el.setAttribute("data-tip", el.getAttribute(lang === "en" ? "data-en-tip" : "data-zh-tip"));
    });
    // 按钮显示"可切换到"的目标语言：中文时显示 EN，英文时显示 中
    if (cur) cur.textContent = lang === "en" ? "中" : "EN";
    btn.setAttribute("aria-label", lang === "en" ? "Switch to Chinese" : "切换中英文");
  };
  let lang = "zh";
  try { lang = localStorage.getItem("lang") === "en" ? "en" : "zh"; } catch (e) {}
  apply(lang);
  btn.addEventListener("click", () => {
    lang = document.documentElement.dataset.lang === "en" ? "zh" : "en";
    try { localStorage.setItem("lang", lang); } catch (e) {}
    apply(lang);
  });
})();
