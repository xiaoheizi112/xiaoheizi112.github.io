// 相册点击放大：←/→ 或按钮切换，ESC/点背景关闭。无依赖。
(() => {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const img = lb.querySelector(".lb-img"), cap = lb.querySelector(".lb-cap");
  const items = [...document.querySelectorAll("[data-lb]")].sort((a, b) => a.dataset.lb - b.dataset.lb);
  let cur = -1;

  const show = (i) => {
    cur = (i + items.length) % items.length;
    img.src = items[cur].src;
    cap.textContent = items[cur].alt || "";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  };
  const hide = () => { lb.hidden = true; document.body.style.overflow = ""; };

  items.forEach((el, i) => el.addEventListener("click", () => show(i)));
  lb.querySelector(".lb-close").onclick = hide;
  lb.querySelector(".lb-prev").onclick = () => show(cur - 1);
  lb.querySelector(".lb-next").onclick = () => show(cur + 1);
  lb.addEventListener("click", (e) => { if (e.target === lb) hide(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") hide();
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
})();
