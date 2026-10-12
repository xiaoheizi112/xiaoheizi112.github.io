// 阅读体验增强：文章页与列表页的沉浸感与交互（无依赖，Turbo 兼容）。
//  ① 结构化元素逐段进场（标题/引用/配图），IntersectionObserver 触发一次即止
//  ② 标题锚点点击 → 复制该节深链，弹出小提示
//  ③ 正文末尾落一枚「读完」小印记
//  ④ 每次 Turbo 换页后正文轻微淡入，制造路由过渡感
//  ⑤ 列表页卡片错峰进场
// 全部尊重 prefers-reduced-motion；JS 失效时内容照常可见（只在 html.js 下隐藏待进场元素，并有兜底显示）。
(() => {
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- ④ 路由过渡：只有 Turbo 真实换页才整页淡入；首次加载不做，避免白一下 ----------
  // 若浏览器支持原生 View Transitions（Turbo 8 的 meta 已开启），换页动画交给它，JS 不再叠加淡入，
  // 否则会出现"两次淡入"。不支持时才用这里的 JS 淡入作为降级。
  const hasVT = typeof document.startViewTransition === "function" && !!document.querySelector('meta[name="view-transition"]');
  function pageEnter() {
    if (hasVT) return;
    const main = document.querySelector(".main") || document.querySelector("main");
    if (!main || reduce()) return;
    main.classList.remove("page-enter");
    void main.offsetWidth; // 强制重排以重放动画
    main.classList.add("page-enter");
  }

  // ---------- ① 结构元素逐段进场 ----------
  function revealPost() {
    const root = document.querySelector(".post-content");
    if (!root) { window.__postReady = true; return; }
    const targets = [...root.querySelectorAll("h2, h3, blockquote, figure")];
    // 首段正文（摘要式开场）也纳入，读起来更连贯
    const firstP = root.querySelector(":scope > p");
    if (firstP) targets.unshift(firstP);
    if (!targets.length || reduce()) {
      targets.forEach((el) => el.classList.add("rv-post", "rv-in"));
      window.__postReady = true;
      return;
    }
    targets.forEach((el) => el.classList.add("rv-post"));
    // 首屏内的元素同步立即进场，不进观察器——保证首帧就有内容、不闪
    const vh = innerHeight;
    const rest = [];
    targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("rv-in");
      else rest.push(el);
    });
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add("rv-in"); io.unobserve(e.target); }
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
    rest.forEach((el) => io.observe(el));
    window.__postReady = true;
  }

  // ---------- ② 标题锚点：点击复制深链 ----------
  function headingAnchors() {
    document.querySelectorAll(".post-content :is(h1,h2,h3,h4) > a.anchor").forEach((a) => {
      if (a.dataset.enhanced) return;
      a.dataset.enhanced = "1";
      a.removeAttribute("hidden");
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const url = location.origin + location.pathname + a.getAttribute("href");
        const done = () => toast("已复制本节点链接");
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done);
        else done();
        history.replaceState(null, null, a.getAttribute("href"));
      });
    });
  }

  // 小提示
  let toastEl, toastT;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "read-toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 1600);
  }

  // ---------- ③ 正文末尾「读完」印记 ----------
  function endMark() {
    const root = document.querySelector(".post-content");
    if (!root || root.querySelector(".post-end")) return;
    const d = document.createElement("div");
    d.className = "post-end";
    d.setAttribute("aria-hidden", "true");
    d.innerHTML =
      '<svg viewBox="0 0 24 24" width="16" height="16"><ellipse cx="12" cy="15.8" rx="5" ry="4.1" fill="currentColor"/>' +
      '<circle cx="5.6" cy="10.6" r="2.1" fill="currentColor"/><circle cx="9.6" cy="7.6" r="2.2" fill="currentColor"/>' +
      '<circle cx="14.4" cy="7.6" r="2.2" fill="currentColor"/><circle cx="18.4" cy="10.6" r="2.1" fill="currentColor"/></svg>' +
      "<span>读到这里了</span>";
    root.appendChild(d);
  }

  // ---------- ⑤ 列表卡片错峰进场 ----------
  function revealList() {
    const cards = document.querySelectorAll(".post-entry");
    if (!cards.length) return;
    if (reduce()) return;
    cards.forEach((el, i) => {
      el.classList.add("rv-card");
      el.style.transitionDelay = Math.min(i, 8) * 60 + "ms";
    });
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add("rv-in"); io.unobserve(e.target); }
    }, { threshold: 0.06, rootMargin: "0px 0px -6% 0px" });
    cards.forEach((el) => io.observe(el));
  }

  function init(isTurboNav) {
    if (isTurboNav) pageEnter();
    revealPost();
    headingAnchors();
    endMark();
    revealList();
  }

  // 初次加载：DOMContentLoaded（或脚本晚到时直接跑），不做整页淡入
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", () => init(false));
  else init(false);
  // Turbo 换页：仅真实换页才淡入。Turbo 首次加载也会补派一次 turbo:load，用 turboSeen 忽略之，
  // 否则会和 DOMContentLoaded 的 init 叠加、首屏被误加淡入。
  let turboSeen = false;
  addEventListener("turbo:load", () => {
    if (!turboSeen) { turboSeen = true; return; }
    init(true);
  });
})();

// 兜底：若 1.2s 内进场观察器没能接上（脚本被拦/报错），强制显示，别让正文空白
addEventListener("load", () => {
  setTimeout(() => {
    if (!window.__postReady) document.documentElement.classList.add("rv-fallback");
  }, 1200);
});