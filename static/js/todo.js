// 要事四象限：本机编辑（localStorage）+ 拖拽换象限 + 导出 YAML。
// 编辑入口在顶部导航（id=todo-edit），Shift+E 亦可。
// 真相源仍是仓库里的 data/todo.yml：页面上的改动只存这台浏览器，
// 要发布就点「复制 YAML」粘回那个文件再提交。无 JS 时页面照常显示服务端渲染的种子内容。
(() => {
  const KEY = " mangozi-todo-v1 ".trim();
  const seedEl = document.getElementById("todo-seed");
  if (!seedEl) return;
  let seed;
  try { seed = JSON.parse(seedEl.textContent); } catch (e) { return; }
  if (!seed || !Array.isArray(seed.quadrants)) return;

  const matrix = document.getElementById("matrix");
  const editBtn = document.getElementById("todo-edit");
  const localBadge = document.getElementById("todo-local");
  const tools = document.getElementById("todo-tools");
  const hint = document.getElementById("todo-publish-hint");
  // 编辑按钮只在 hugo.IsServer（本地测试）下渲染；线上没有它 => 整页只读，也不合并本机草稿。
  const LOCAL = !!editBtn;
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // ---------- 状态：种子 + 本机覆盖 ----------
  let stored = null;
  if (LOCAL) try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      // 结构对不上（比如 yml 增删了象限）就当没有，避免渲染出半截数据
      if (p && Array.isArray(p.quadrants) && p.quadrants.length === seed.quadrants.length &&
          p.quadrants.every((q) => seed.quadrants.some((s) => s.id === q.id))) stored = p;
    }
  } catch (e) {}
  let state = stored ? clone(stored) : clone(seed);
  // 旧版本机数据没有 motto/examples：从种子补齐，避免导出 YAML 时丢字段
  state.quadrants.forEach((q) => {
    const s = seed.quadrants.find((x) => x.id === q.id);
    if (!s) return;
    ["title", "hint", "icon", "motto", "examples"].forEach((k) => {
      if (q[k] == null || q[k] === "") q[k] = s[k];
    });
  });

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    if (localBadge) localBadge.hidden = false;
  }
  function clearLocal() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    stored = null;
    state = clone(seed);
    if (localBadge) localBadge.hidden = true;
  }

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const STATUS = { todo: "待办", doing: "进行中", done: "已完成" };
  const NEXT = { todo: "doing", doing: "done", done: "todo" };

  // ---------- 渲染 ----------
  function taskHTML(t) {
    const st = STATUS[t.status] ? t.status : "todo";
    return '<li class="task st-' + st + '" draggable="false" data-note="' + esc(t.note || "") + '">' +
      '<button class="st-chip" type="button" data-act="status" aria-label="状态" disabled>' + STATUS[st] + "</button>" +
      '<div class="task-body">' +
        '<p class="task-text">' + esc(t.text) + "</p>" +
        (t.note ? '<p class="task-note">' + esc(t.note) + "</p>" : "") +
      "</div>" +
      '<button class="task-del" type="button" data-act="del" aria-label="删除这件事" title="删除">×</button>' +
      '<span class="task-grip" aria-hidden="true"></span>' +
    "</li>";
  }

  function render() {
    state.quadrants.forEach((q) => {
      const sec = matrix.querySelector('.quad[data-qid="' + q.id + '"]');
      if (!sec) return;
      const list = sec.querySelector(".tasks");
      const cnt = sec.querySelector(".quad-count");
      if (cnt) cnt.textContent = q.tasks.length;
      list.innerHTML = q.tasks.length
        ? q.tasks.map(taskHTML).join("")
        : '<li class="task-empty">这一格空着，也挺好</li>';
    });
    // 十字轴要盖在卡片之下、底色之上：渲染后不动它，DOM 里已在末尾
    if (document.body.classList.contains("editing")) applyEditable();
  }

  // 从 DOM 把当前编辑结果收回 state（拖拽/改字后调用，保证两者一致）。
  // 这里只落库、不重绘：重绘会换掉正在编辑的节点，键盘 Tab 和状态徽标点击都会失效。
  function syncFromDOM() {
    state.quadrants.forEach((q) => {
      const sec = matrix.querySelector('.quad[data-qid="' + q.id + '"]');
      if (!sec) return;
      q.tasks = [...sec.querySelectorAll("li.task")].map((li) => ({
        text: (li.querySelector(".task-text") || {}).textContent || "",
        note: li.dataset.note || "",
        status: (li.className.match(/st-(todo|doing|done)/) || [, "todo"])[1],
      })).filter((t) => t.text.trim());
    });
    save();
  }

  // ---------- 轻提示 ----------
  let toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "todo-toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  // ---------- 编辑模式 ----------
  let editing = false;
  function applyEditable() {
    matrix.querySelectorAll("li.task").forEach((li) => {
      li.setAttribute("draggable", "true");
      const txt = li.querySelector(".task-text");
      if (txt) txt.setAttribute("contenteditable", "true");
      const chip = li.querySelector(".st-chip");
      if (chip) chip.disabled = false;
    });
  }
  function setEditing(on) {
    if (!LOCAL) return;
    editing = on;
    document.body.classList.toggle("editing", on);
    editBtn.setAttribute("aria-pressed", String(on));
    editBtn.classList.toggle("on", on);
    editBtn.setAttribute("data-tip", on ? "退出编辑" : "编辑要事");
    const label = editBtn.querySelector(".todo-edit-label");
    if (label) label.textContent = on ? "编辑中" : "编辑";
    tools.hidden = !on;
    hint.hidden = !on;
    if (on) {
      applyEditable();
      matrix.querySelectorAll("li.task").forEach((li) => li.querySelectorAll("button,.task-grip").forEach((n) => n.hidden = false));
    } else {
      matrix.querySelectorAll("li.task").forEach((li) => {
        li.setAttribute("draggable", "false");
        const txt = li.querySelector(".task-text");
        if (txt) { txt.removeAttribute("contenteditable"); txt.blur(); }
        const chip = li.querySelector(".st-chip");
        if (chip) chip.disabled = true;
      });
      syncFromDOM();
    }
  }

  // 编辑入口常驻在顶部导航里；Shift+E 仍作为快捷键（仅本地测试）
  if (LOCAL) addEventListener("keydown", (e) => {
    if (e.shiftKey && (e.key === "E" || e.key === "e") && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
      e.preventDefault(); setEditing(!editing);
    }
  });
  if (LOCAL) editBtn.addEventListener("click", () => setEditing(!editing));

  // ---------- 事件委托：状态 / 新增 / 删除 ----------
  matrix.addEventListener("click", (e) => {
    const act = e.target.dataset && e.target.dataset.act;
    const li = e.target.closest("li.task");
    if (act === "status" && li && editing) {
      const st = (li.className.match(/st-(todo|doing|done)/) || [, "todo"])[1];
      li.className = "task st-" + NEXT[st];
      e.target.textContent = STATUS[NEXT[st]];
      const q = li.closest(".tasks").dataset.qid;
      const idx = [...li.parentNode.querySelectorAll("li.task")].indexOf(li);
      state.quadrants.find((x) => x.id === q).tasks[idx].status = NEXT[st];
      save();
      return;
    }
    if (act === "add") {
      const qid = e.target.closest(".quad").dataset.qid;
      const q = state.quadrants.find((x) => x.id === qid);
      q.tasks.push({ text: "新的一件事", note: "", status: "todo" });
      save(); render();
      const list = matrix.querySelector('.quad[data-qid="' + qid + '"] .tasks');
      const last = list && list.lastElementChild;
      if (last) {
        const t = last.querySelector(".task-text");
        if (t) { t.focus(); document.getSelection().selectAllChildren(t); }
      }
      return;
    }
    if (act === "del" && li && editing) {
      const btn = e.target.closest(".task-del");
      // 两段式删除：第一次点变成「删?」，2.6 秒内再点才真删，避免误触
      if (btn && !btn.classList.contains("armed")) {
        btn.classList.add("armed");
        btn.textContent = "删?";
        clearTimeout(btn._t);
        btn._t = setTimeout(() => { btn.classList.remove("armed"); btn.textContent = "×"; }, 2600);
        return;
      }
      const qid = li.closest(".tasks").dataset.qid;
      const idx = [...li.parentNode.querySelectorAll("li.task")].indexOf(li);
      state.quadrants.find((x) => x.id === qid).tasks.splice(idx, 1);
      save(); render();
      toast("已删除");
    }
  });

  // 文字编辑：失焦即落库。清空文字视为删除，需要重绘一次把空卡收掉
  matrix.addEventListener("focusout", (e) => {
    if (!editing || !e.target.classList.contains("task-text")) return;
    const emptied = !e.target.textContent.trim();
    syncFromDOM();
    if (emptied) render();
  });
  matrix.addEventListener("keydown", (e) => {
    if (!editing) return;
    const li = e.target.closest("li.task");
    if (!li) return;
    // Alt+↑/↓ 键盘调序（拖拽的无障碍替代）
    if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      const sib = e.key === "ArrowUp" ? li.previousElementSibling : li.nextElementSibling;
      if (!sib || !sib.classList.contains("task")) return;
      e.key === "ArrowUp" ? li.parentNode.insertBefore(li, sib) : li.parentNode.insertBefore(sib, li);
      syncFromDOM();
      return;
    }
    // 编辑文字时回车=提交，不换行
    if (e.key === "Enter" && e.target.classList.contains("task-text")) { e.preventDefault(); e.target.blur(); }
  });

  // ---------- 拖拽换象限（HTML5 DnD，落点实时插位） ----------
  let dragging = null;
  matrix.addEventListener("dragstart", (e) => {
    const li = e.target.closest("li.task");
    if (!li || !editing) { e.preventDefault(); return; }
    dragging = li;
    li.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", ""); } catch (err) {}
  });
  matrix.addEventListener("dragend", () => {
    if (!dragging) return;
    dragging.classList.remove("dragging");
    dragging = null;
    matrix.querySelectorAll(".quad.drop-on").forEach((q) => q.classList.remove("drop-on"));
    syncFromDOM();
  });
  function afterElement(container, y) {
    const els = [...container.querySelectorAll("li.task:not(.dragging)")];
    let best = { off: -Infinity, el: null };
    els.forEach((child) => {
      const box = child.getBoundingClientRect();
      const off = y - box.top - box.height / 2;
      if (off < 0 && off > best.off) best = { off, el: child };
    });
    return best.el;
  }
  matrix.addEventListener("dragover", (e) => {
    if (!dragging) return;
    const list = e.target.closest(".tasks");
    if (!list) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const empty = list.querySelector(".task-empty");
    if (empty) empty.remove();
    const after = afterElement(list, e.clientY);
    if (after == null) list.appendChild(dragging); else list.insertBefore(dragging, after);
    matrix.querySelectorAll(".quad").forEach((q) => q.classList.toggle("drop-on", q.contains(dragging)));
  });

  // ---------- 导出 YAML：粘回 data/todo.yml 即发布 ----------
  // 表头与仓库里的 data/todo.yml 保持一致：整份替换过去时不会把字段说明弄丢。
  const YAML_HEADER = [
    "# 「要事」四象限（Eisenhower 矩阵）种子内容。",
    "# 这里是访客看到的已发布版本；页面上的编辑只存在你本机浏览器，",
    "# 想发布就用页里的「复制 YAML」把结果粘回本文件再提交。",
    "#",
    "# status 三选一：todo（待办）/ doing（进行中）/ done（已完成）",
    "# note 可留空。四象限的 id 固定为 do / schedule / delegate / drop，不要改名。",
    "# motto 是卡片上的行动语，examples 是参考四象限图的示例说明（只展示，不参与任务列表）。",
  ].join("\n") + "\n";
  // 用本机日期而不是 toISOString：后者是 UTC，东八区凌晨导出会写成昨天。
  function today() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }
  function toYAML() {
    const q1 = (s) => '"' + String(s || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
    let out = YAML_HEADER + "\n";
    out += 'updated: "' + today() + '"\n\nquadrants:\n';
    state.quadrants.forEach((q) => {
      out += '  - id: ' + q.id + "\n";
      out += "    title: " + q1(q.title) + "\n";
      out += "    hint: " + q1(q.hint) + "\n";
      out += "    icon: " + q1(q.icon) + "\n";
      if (q.motto) out += "    motto: " + q1(q.motto) + "\n";
      if (q.examples) out += "    examples: " + q1(q.examples) + "\n";
      out += q.tasks.length ? "    tasks:\n" : "    tasks: []\n";
      q.tasks.forEach((t) => {
        out += "      - { text: " + q1(t.text);
        if (t.note) out += ", note: " + q1(t.note);
        out += ", status: " + (STATUS[t.status] ? t.status : "todo") + " }\n";
      });
      out += "\n";
    });
    return out.trimEnd() + "\n";
  }
  function copyYAML() {
    const y = toYAML();
    const done = () => toast("YAML 已复制，粘到 data/todo.yml 提交即发布");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(y).then(done, () => fallback(y, done));
    else fallback(y, done);
  }
  function fallback(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    ta.remove();
    if (ok) { done(); return; }
    // 最后兜底：弹窗让人手动 Ctrl+C，别承诺做不到的「下载」
    window.prompt("自动复制失败，请按 Ctrl+C 复制下面的内容：", text);
    toast("自动复制失败，已弹出文本框供手动复制");
  }

  if (LOCAL) tools.addEventListener("click", (e) => {
    const act = e.target.dataset && e.target.dataset.act;
    if (act === "yaml") copyYAML();
    else if (act === "reset") {
      // 先退出编辑（这一步会 syncFromDOM 落一次盘），再清本地覆盖，
      // 顺序反了会被随后的保存又写回去，等于没重置。
      setEditing(false);
      clearLocal();
      render();
      toast("已回到已发布版本");
    }
    else if (act === "exit") setEditing(false);
  });

  // ---------- hover 晨光跟随（与首页卡片同款质感） ----------
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    matrix.addEventListener("pointermove", (e) => {
      const li = e.target.closest("li.task");
      if (!li) return;
      const r = li.getBoundingClientRect();
      li.style.setProperty("--gx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      li.style.setProperty("--gy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    }, { passive: true });
  }

  // ---------- 进场：与全站 .rv 一致的错峰 ----------
  (function reveal() {
    const secs = [...matrix.querySelectorAll(".quad")];
    if (!secs.length) return;
    if (reduce()) return;
    secs.forEach((el, i) => { el.classList.add("rv"); el.style.transitionDelay = i * 90 + "ms"; });
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }, { threshold: 0.08 });
    secs.forEach((el) => io.observe(el));
  })();

  // 首屏统一由 JS 重绘一次：
  // 1) 服务端骨架没有 data-note，直接编辑会把备注写丢；
  // 2) 本机有覆盖时按本机版本渲染，并亮出提示。
  if (stored && localBadge) localBadge.hidden = false;
  render();
})();
