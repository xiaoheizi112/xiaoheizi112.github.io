// 相册点击放大：←/→ 或按钮切换，ESC/点背景/Enter 关闭，View Transitions 原位缩放（不支持或减弱动效则直开直关）。无依赖。
(() => {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const img = lb.querySelector(".lb-img");
  const closeBtn = lb.querySelector(".lb-close");
  const items = [...document.querySelectorAll("[data-lb]")].sort((a, b) => a.dataset.lb - b.dataset.lb);
  let cur = null; // 当前查看的缩略图
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canVT = () => document.startViewTransition && !reduce();

  const vis = () => items.filter((el) => !el.closest(".photo-item").hidden);
  const step = (d) => {
    const v = vis();
    const next = v[(v.indexOf(cur) + d + v.length) % v.length];
    cur = next;
    img.src = next.src;
    img.classList.remove("lb-swap"); void img.offsetWidth; img.classList.add("lb-swap");
    preload();
  };
  // 邻图预取：切换时不再白屏等待（缩略图与大图为同一文件，浏览器缓存直接命中）
  const preload = () => {
    const v = vis(), i = v.indexOf(cur);
    [-1, 1].forEach((d) => { new Image().src = v[(i + d + v.length) % v.length].src; });
  };

  // 打开时让灯箱以外的内容不可聚焦（Tab 不会穿到遮罩后面）
  const setInert = (on) => {
    for (const n of document.body.children) if (n.nodeType === 1 && n !== lb) n.inert = on;
  };
  const open = (el) => {
    cur = el;
    img.src = el.src;
    lb.hidden = false;
    setInert(true);
    const se = document.documentElement;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = window.innerWidth - se.clientWidth + "px"; // 锁滚动时补偿滚动条宽度，防页面横跳
    preload();
    closeBtn.focus();
  };
  const close = () => {
    lb.hidden = true;
    setInert(false);
    img.style.viewTransitionName = "";
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    const back = cur;
    if (back) back.focus({ preventScroll: true });
  };

  items.forEach((el) => {
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    el.addEventListener("click", () => show(el));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(el); }
    });
  });

  function show(el) {
    if (!canVT()) { open(el); return; }
    // 旧状态：缩略图命名 "lb"；回调里摘掉、改挂到 lb-img → 形态从缩略图放大到灯箱
    el.style.viewTransitionName = "lb";
    const t = document.startViewTransition(() => {
      el.style.viewTransitionName = "";
      img.style.viewTransitionName = "lb";
      open(el);
    });
    t.aborted.then(() => { el.style.viewTransitionName = ""; });
  }

  function hide() {
    if (!canVT() || !cur) { close(); return; }
    // 旧状态：lb-img 仍命名 "lb"；回调里摘掉、还给缩略图 → 反向收回原位
    const back = cur;
    const t = document.startViewTransition(() => {
      img.style.viewTransitionName = "";
      back.style.viewTransitionName = "lb";
      close();
    });
    t.finished.finally(() => { back.style.viewTransitionName = ""; });
  }

  lb.querySelector(".lb-close").onclick = hide;
  lb.querySelector(".lb-prev").onclick = () => step(-1);
  lb.querySelector(".lb-next").onclick = () => step(1);
  lb.addEventListener("click", (e) => { if (e.target === lb) hide(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") hide();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });
})();
