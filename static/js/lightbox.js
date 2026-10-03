// 通用灯箱：照片墙 img[data-lb] 与文章正文 .post-content img 共用一套。
// 委托到 document/window + 遮罩用到时才建：Turbo 把 body 整个换掉后监听仍活着，无需重绑。
// 交互：点图原位放大（不支持 VT 或减弱动效则直开直关），←/→ 组内循环，ESC/点背景关闭。
(() => {
  if (window.__lb) return; // 照片墙与 extend_footer 都会带这份脚本，只跑一次
  window.__lb = true;
  const SEL = "img[data-lb], .post-content img";
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canVT = () => document.startViewTransition && !reduce();
  let lb = null, img = null, cur = null, items = [], pos = 0;

  // 成组：照片墙按可见项（年份筛选会 hidden 掉整卡），文章按正文顺序
  const group = (el) => el.dataset.lb !== undefined
    ? [...document.querySelectorAll("img[data-lb]")].filter(i => !i.closest(".photo-item")?.hidden)
    : [...el.closest(".post-content").querySelectorAll("img")];

  const setInert = (on) => { for (const n of document.body.children) if (n.nodeType === 1 && n !== lb) n.inert = on; };
  const preload = () => [-1, 1].forEach(d => {
    const nx = items[(pos + d + items.length) % items.length];
    if (nx) new Image().src = nx.src;
  });
  const step = (d) => {
    pos = (pos + d + items.length) % items.length;
    cur = items[pos];
    img.src = cur.src;
    img.classList.remove("lb-swap"); void img.offsetWidth; img.classList.add("lb-swap");
    preload();
  };
  // 遮罩用到才建：Turbo 换页后旧的没了，再点开时重建一份
  function ensure() {
    if (lb && document.body.contains(lb)) return;
    lb = document.createElement("div");
    lb.id = "lightbox"; lb.hidden = true;
    lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "图片查看器");
    lb.innerHTML = '<button class="lb-close" aria-label="关闭">✕</button>'
      + '<button class="lb-prev" aria-label="上一张">←</button>'
      + '<img class="lb-img" alt="" />'
      + '<button class="lb-next" aria-label="下一张">→</button>';
    document.body.appendChild(lb);
    img = lb.querySelector(".lb-img");
    lb.querySelector(".lb-close").onclick = hide;
    lb.querySelector(".lb-prev").onclick = () => step(-1);
    lb.querySelector(".lb-next").onclick = () => step(1);
    lb.addEventListener("click", (e) => { if (e.target === lb) hide(); });
  }
  function open(el) {
    ensure();
    items = group(el); pos = Math.max(0, items.indexOf(el)); cur = el;
    img.src = el.src;
    lb.hidden = false;
    setInert(true);
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = window.innerWidth - document.documentElement.clientWidth + "px"; // 锁滚动补滚动条宽，防页面横跳
    preload();
    lb.querySelector(".lb-close").focus();
  }
  function close() {
    lb.hidden = true;
    setInert(false);
    img.style.viewTransitionName = "";
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    if (cur) cur.focus({ preventScroll: true });
  }
  function show(el) {
    ensure(); // 遮罩/内层 img 先备好——VT 回调里就要用
    if (!canVT()) { open(el); return; }
    el.style.viewTransitionName = "lb";
    const t = document.startViewTransition(() => {
      el.style.viewTransitionName = "";
      img.style.viewTransitionName = "lb";
      open(el);
    });
    // finished 被 abort 时会 reject，清掉命名防止图卡住"变形中"状态
    t.finished.catch(() => {}).finally(() => { el.style.viewTransitionName = ""; });
  }
  function hide() {
    if (!canVT() || !cur) { close(); return; }
    const back = cur;
    const t = document.startViewTransition(() => {
      img.style.viewTransitionName = "";
      back.style.viewTransitionName = "lb";
      close();
    });
    t.finished.finally(() => { back.style.viewTransitionName = ""; });
  }

  document.addEventListener("click", (e) => {
    if (lb && !lb.hidden) return; // 灯箱内交互归它自己的监听管
    const el = e.target.closest(SEL);
    if (!el || el.closest("a")) return; // 包了链接的图让链接赢
    e.preventDefault();
    show(el);
  });
  addEventListener("keydown", (e) => {
    if (!lb || lb.hidden) return;
    if (e.key === "Escape") hide();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });
  // 照片缩略图键盘可达：Turbo 换列表后补 tabindex，Enter/空格等同点击
  const tag = () => document.querySelectorAll("img[data-lb]:not([tabindex])").forEach(el => {
    el.setAttribute("tabindex", "0"); el.setAttribute("role", "button");
  });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches?.("img[data-lb]")) { e.preventDefault(); show(e.target); }
  });
  addEventListener("turbo:load", tag); addEventListener("turbo:render", tag); tag();
})();
