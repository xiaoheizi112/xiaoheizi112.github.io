// 相册点击放大：←/→ 或按钮切换，ESC/点背景关闭。无依赖。
(() => {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const img = lb.querySelector(".lb-img");
  const items = [...document.querySelectorAll("[data-lb]")].sort((a, b) => a.dataset.lb - b.dataset.lb);
  let cur = null;

  const show = (el) => {
    cur = el;
    img.src = el.src;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  };
  const hide = () => { lb.hidden = true; document.body.style.overflow = ""; };
  // 只在当前可见（未被地点筛选隐藏）的照片间切换
  const step = (d) => {
    const vis = items.filter((el) => !el.closest(".photo-item").hidden);
    show(vis[(vis.indexOf(cur) + d + vis.length) % vis.length]);
  };

  items.forEach((el) => el.addEventListener("click", () => show(el)));
  lb.querySelector(".lb-close").onclick = hide;
  lb.querySelector(".lb-prev").onclick = () => step(-1);
  lb.querySelector(".lb-next").onclick = () => step(1);
  lb.addEventListener("click", (e) => { if (e.target === lb) hide(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") hide();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
})();
