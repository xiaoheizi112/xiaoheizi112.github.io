// 命令面板（⌘K / Ctrl+K）：一个输入框干三件事——搜站内文章、跳站内页面、执行命令（切换主题/语言）。
// 设计目标是"键盘优先"：全键盘可操作，回车即达，Esc 即走。Turbo 换页后自动重挂，不重复绑定。
// 无依赖；JS 失效时不影响任何已有导航。索引懒加载（首次打开才取），不拖首屏。
(() => {
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 构建面板 DOM（一次，挂到 <html> 下，Turbo 换 body 不丢） ----------
  let overlay, panel, input, listEl;
  function ensureDom() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "pal";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "命令面板");
    overlay.innerHTML =
      '<div class="pal-panel">' +
        '<div class="pal-input-row">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>' +
          '<input class="pal-input" type="text" placeholder="搜索文章、跳转页面、执行命令…" aria-label="搜索" autocomplete="off" spellcheck="false" />' +
          '<span class="pal-esc">Esc</span>' +
        '</div>' +
        '<ul class="pal-list" role="listbox" aria-label="结果"></ul>' +
        '<div class="pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>↵</kbd> 打开</span><span class="sp">慢公子 · 命令面板</span></div>' +
      '</div>';
    document.documentElement.appendChild(overlay);
    panel = overlay.querySelector(".pal-panel");
    input = overlay.querySelector(".pal-input");
    listEl = overlay.querySelector(".pal-list");

    overlay.addEventListener("mousedown", (e) => { if (!panel.contains(e.target)) closePal(); });
    input.addEventListener("input", render);
    input.addEventListener("keydown", onKey);
    listEl.addEventListener("mousemove", (e) => {
      const li = e.target.closest(".pal-item");
      if (li) select(Number(li.dataset.i));
    });
    listEl.addEventListener("click", (e) => {
      const li = e.target.closest(".pal-item");
      if (li) run(items[Number(li.dataset.i)]);
    });
  }

  // ---------- 数据：页面/命令（静态）+ 文章（索引懒加载） ----------
  const base = (document.documentElement.dataset.baseurl || "/").replace(/\/+$/, "");
  const PAGES = [
    { icon: "◆", title: "首页", sub: "Home", href: "/" },
    { icon: "✎", title: "文章", sub: "All posts", href: "/posts/" },
    { icon: "◇", title: "归档", sub: "Archive", href: "/archives/" },
    { icon: "⌗", title: "标签", sub: "Tags", href: "/tags/" },
    { icon: "▤", title: "相册", sub: "Photos", href: "/photos/" },
    { icon: "✦", title: "路线", sub: "Learning tracks", href: "/tracks/" },
    { icon: "◎", title: "要事", sub: "Focus / Eisenhower", href: "/todo/" },
    { icon: "▣", title: "简历", sub: "Resume / CV", href: "/resume/" },
    { icon: "✉", title: "关于", sub: "About", href: "/about/" },
  ]
    // 简历板块隐藏时（导航里没有 a.resume）命令面板也不给入口
    .filter((p) => p.href !== "/resume/" || !!document.querySelector("a.resume"))
    .map((p) => ({ ...p, kind: "page", href: base + p.href }));

  let posts = null; // 懒加载缓存
  let loadingIndex = false;
  function loadIndex() {
    if (posts || loadingIndex) return;
    loadingIndex = true;
    fetch(base + "/index.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        posts = data.map((p) => ({
          icon: "¶",
          title: p.title || "(无标题)",
          sub: (p.summary || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 70),
          href: p.permalink || "#",
          kind: "post",
          external: /^https?:/.test(p.permalink || ""),
          hay: ((p.title || "") + " " + (p.summary || "") + " " + (p.content || "")).toLowerCase(),
        }));
        if (overlay.classList.contains("open")) render();
      })
      .catch(() => { posts = []; });
  }

  function commands() {
    const dark = document.documentElement.dataset.theme === "dark";
    const out = [
      { icon: dark ? "☀" : "☾", title: dark ? "切换到浅色" : "切换到深色", sub: "Toggle theme", kind: "cmd", run: () => window.__palToggleTheme && window.__palToggleTheme() },
    ];
    if (document.querySelector(".lang-btn")) {
      const en = document.documentElement.dataset.lang === "en";
      out.push({ icon: "文", title: en ? "切换到中文" : "Switch to English", sub: "Toggle language", kind: "cmd", run: () => document.querySelector(".lang-btn").click() });
    }
    if (document.getElementById("todo-edit")) {
      out.push({ icon: "✎", title: "编辑要事", sub: "Toggle focus edit", kind: "cmd", run: () => document.getElementById("todo-edit").click() });
    }
    if (document.querySelector(".tape-reel-btn") || document.getElementById("tape")) {
      out.push({ icon: "♪", title: "播放 / 暂停音乐", sub: "Toggle music", kind: "cmd", run: () => { const b = document.querySelector(".tape-reel-btn") || document.querySelector(".tape-pp"); b && b.click(); } });
    }
    out.push({ icon: "↑", title: "回到顶部", sub: "Scroll to top", kind: "cmd", run: () => scrollTo({ top: 0, behavior: reduce() ? "auto" : "smooth" }) });
    return out;
  }

  // ---------- 搜索与排序 ----------
  let items = [], sel = 0;
  function score(it, q) {
    if (!q) return 0;
    const hay = (it.hay || (it.title + " " + (it.sub || "")).toLowerCase());
    const t = it.title.toLowerCase();
    let s = 0;
    if (t.startsWith(q)) s += 40;
    if (t.includes(q)) s += 24;
    if (hay.includes(q)) s += 8;
    return s;
  }
  function render() {
    const q = input.value.trim().toLowerCase();
    // 空查询：先给命令 + 页面（常用动作在前），文章只在输入后进结果，避免一屏全是标题
    let pool = [...commands(), ...PAGES];
    if (q && posts) pool = pool.concat(posts);
    const scored = pool
      .map((it) => ({ it, s: score(it, q) }))
      .filter((x) => !q || x.s > 0)
      .sort((a, b) => b.s - a.s);
    items = scored.map((x) => x.it).slice(0, 40);
    sel = 0;
    draw(q);
  }
  function draw(q) {
    if (!items.length) {
      const empty = q && !posts ? "正在载入文章索引…" : "没有匹配的结果";
      listEl.innerHTML = '<li class="pal-empty"><span class="big">' + (q ? "🫧" : "⌘") + "</span>" + empty + "</li>";
      return;
    }
    let html = "", lastKind = "";
    items.forEach((it, i) => {
      const g = it.kind === "cmd" ? "命令" : it.kind === "page" ? "页面" : "文章";
      if (g !== lastKind) { html += '<li class="pal-group">' + g + "</li>"; lastKind = g; }
      html +=
        '<li class="pal-item" role="option" data-i="' + i + '" aria-selected="' + (i === sel) + '">' +
          '<span class="pal-ico">' + it.icon + "</span>" +
          '<span class="pal-main"><span class="pal-title">' + hl(it.title, q) + "</span>" +
          (it.sub ? '<span class="pal-sub">' + esc(it.sub) + "</span>" : "") + "</span>" +
          '<span class="pal-go"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></span>' +
        "</li>";
    });
    listEl.innerHTML = html;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function hl(title, q) {
    const t = esc(title);
    if (!q) return t;
    const i = title.toLowerCase().indexOf(q);
    if (i < 0) return t;
    return esc(title.slice(0, i)) + "<mark>" + esc(title.slice(i, i + q.length)) + "</mark>" + esc(title.slice(i + q.length));
  }

  function select(i) {
    if (i < 0 || i >= items.length) return;
    sel = i;
    listEl.querySelectorAll(".pal-item").forEach((el) => el.setAttribute("aria-selected", String(Number(el.dataset.i) === i)));
    const el = listEl.querySelector('.pal-item[data-i="' + i + '"]');
    if (el) el.scrollIntoView({ block: "nearest" });
  }
  function move(d) {
    if (!items.length) return;
    let i = sel + d;
    if (i < 0) i = items.length - 1;
    if (i >= items.length) i = 0;
    select(i);
  }

  function run(it) {
    if (!it) return;
    if (it.kind === "cmd") { closePal(); setTimeout(it.run, 60); return; }
    if (it.external) { window.open(it.href, "_blank", "noopener"); closePal(); return; }
    closePal();
    if (window.Turbo && Turbo.visit) Turbo.visit(it.href); else location.href = it.href;
  }

  function onKey(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Home") { e.preventDefault(); select(0); }
    else if (e.key === "End") { e.preventDefault(); select(items.length - 1); }
    else if (e.key === "Enter") { e.preventDefault(); run(items[sel]); }
    else if (e.key === "Escape") { e.preventDefault(); closePal(); }
  }

  // ---------- 开关 ----------
  function openPal() {
    ensureDom();
    loadIndex();
    overlay.classList.add("open");
    document.documentElement.style.overflow = "hidden";
    render();
    requestAnimationFrame(() => input.focus());
  }
  function closePal() {
    if (!overlay) return;
    overlay.classList.remove("open");
    document.documentElement.style.overflow = "";
    input.value = "";
  }
  function toggle() { ensureDom(); overlay.classList.contains("open") ? closePal() : openPal(); }

  // 暴露给主题切换命令与外部触发
  window.__palOpen = open;
  window.__palClose = close;

  // ---------- 键盘：⌘K / Ctrl+K 开合，/ 在非输入态也可唤起 ----------
  addEventListener("keydown", (e) => {
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && (e.key === "k" || e.key === "K")) { e.preventDefault(); toggle(); }
  }, { passive: false });

  // 触发按钮（各导航里的 .pal-trigger）：事件委托，Turbo 换页后无需重绑
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-pal-trigger]");
    if (t) { e.preventDefault(); openPal(); }
  });
})();