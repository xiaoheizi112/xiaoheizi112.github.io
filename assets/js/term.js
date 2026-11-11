/* 08 CONTACT 终端会话（2026-11 站主选型方案 A）
   契约：#c-contact 的 .hair-list 被整表搬进 .term-log 逐行「开机」——
   命令行（.t-cmd，由 li[data-cmd] 生成）逐字打出，输出行（.t-out）落定，
   COPY/OPEN 按钮随输出行出现；复制成功在回执位打 ✓ VERIFIED（复制本身
   仍归 fx.js 的 [data-copy] 全局处理）。末尾追加 guest 提示符 + 光标。
   桌面（hover:hover）且非 reduced-motion 时提示符可真键盘输入：
   help / copy wechat|qq / open github / clear / replay。
   触屏与 reduced-motion：不接管、不自动播放，静态列表原样即成品。
   数据零新增：全部来自模板渲染好的 DOM。 */
(function (w, d) {
  "use strict";
  var card = d.getElementById("c-contact");
  if (!card) return;
  var list = card.querySelector(".hair-list");
  var foot = card.querySelector(".foot");
  if (!list || !foot || !list.children.length) return;
  var reduce = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hoverable = w.matchMedia && w.matchMedia("(hover: hover)").matches;
  if (reduce || !hoverable) return; /* 渐进增强失败路径：静态兜底 */
  if (w.__termBooted) return;      /* 防重复接管（脚本被重复求值时） */
  w.__termBooted = true;

  var fx = w.fx || {};
  function blip(k) { if (fx.blip) { try { fx.blip(k); } catch (e) {} } }

  /* ---------- 装配终端外壳：整表搬入 .term-log，行本身被复用（零复制） ---------- */
  var win = d.createElement("div");
  win.className = "term rv";
  win.style.setProperty("--i", "2");
  win.innerHTML =
    '<div class="term-bar" aria-hidden="true">' +
      '<span class="tb-dot"></span><span class="tb-dot"></span><span class="tb-dot"></span>' +
      '<span class="tb-t">guest@slowgongzi — contact.sh</span>' +
      '<span class="tb-r">bash · UTF-8</span>' +
    "</div>" +
    '<div class="term-log" id="term-log" role="log" aria-label="联系方式终端"></div>';
  var log = win.querySelector(".term-log");
  (list.parentElement || card).replaceChild(win, list); /* 对着真实父级换，别假设是 card */
  list.className = "hair-list term-adopted";
  list.setAttribute("aria-hidden", "true");
  log.appendChild(list);
  var cursor = d.createElement("span");
  cursor.className = "term-cursor";
  cursor.setAttribute("aria-hidden", "true");

  /* li → 命令/输出两行一组；data-cmd 由模板给（wechat/qq/github 稳定别名） */
  var items = [];
  Array.prototype.forEach.call(list.children, function (li) {
    var k = li.querySelector(".k");
    var v = li.querySelector(".v");
    if (!k || !v) return;
    var cmd = d.createElement("div");
    cmd.className = "t-cmd";
    cmd.innerHTML = '<span class="t-prompt">$</span><span class="t-typed"></span>';
    var out = d.createElement("div");
    out.className = "t-out";
    out.style.display = "none";
    var val = v.querySelector(".t-val");
    var ctl = v.querySelector("a, [data-copy]");
    if (ctl && ctl.tagName === "A") {
      out.appendChild(ctl);            /* 链接行：值就是 <a> 本身，别重复铺文本 */
    } else {
      out.textContent = (val ? val.textContent : v.textContent).trim() + "  ";
      if (ctl) out.appendChild(ctl);
    }
    var rc = d.createElement("span");
    rc.className = "t-receipt";
    out.appendChild(rc);
    li.replaceChildren(cmd, out);
    li.style.display = "block";
    li.className = "t-pair";
    items.push({
      alias: (li.getAttribute("data-cmd") || "").toLowerCase(),
      label: (k.textContent || "").trim(),
      cmdText: "contact " + (li.getAttribute("data-cmd") || k.textContent || "").trim().toLowerCase(),
      cmdEl: cmd.querySelector(".t-typed"),
      out: out,
      rc: rc,
      ctl: ctl,
      row: li,
    });
  });

  /* ---------- 打字机 ---------- */
  var CPS = 34;               /* 命令字符/秒 */
  function sleep(ms) { return new w.Promise(function (r) { w.setTimeout(r, ms); }); }
  async function typeInto(el, text) {
    el.textContent = "";
    for (var i = 0; i < text.length; i++) {
      el.textContent += text.charAt(i);
      if (i % 2 === 0) blip("hover");
      await sleep(1000 / CPS);
    }
  }
  var banner = d.createElement("div");
  banner.className = "t-sys";
  banner.textContent = "contact.sh — " + items.length + " channels online. type \u201Chelp\u201D.";
  var bootLine = d.createElement("div");
  bootLine.className = "t-pair";
  bootLine.appendChild(banner);
  list.prepend(bootLine);

  var running = false;
  async function boot() {
    if (running) return;
    running = true;
    /* 复位全部行（clear/replay 后重打）并保证顺序：行都住在 ul 里 */
    if (list.parentElement !== log) log.appendChild(list);
    list.prepend(bootLine);
    items.forEach(function (it) {
      it.cmdEl.textContent = "";
      it.cmdEl.classList.remove("done");
      it.out.style.display = "none";
      it.out.classList.remove("on");
      list.appendChild(it.row);
    });
    await sleep(420);
    banner.classList.add("on");
    await sleep(260);
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      await typeInto(it.cmdEl, it.cmdText);
      it.cmdEl.classList.add("done"); /* 打完收掉行尾光标，只留输入行那颗 */
      blip("click");
      await sleep(160);
      it.out.style.display = "";
      it.out.classList.add("on");
      await sleep(340);
    }
    log.appendChild(inputRow());
    running = false;
  }

  /* ---------- 交互提示符（桌面） ---------- */
  var inputWrap = null;
  function inputRow() {
    if (inputWrap) return inputWrap;
    inputWrap = d.createElement("div");
    inputWrap.className = "t-input-row";
    inputWrap.innerHTML = '<span class="t-prompt">$</span>';
    var input = d.createElement("input");
    input.className = "t-input";
    input.type = "text";
    input.setAttribute("autocomplete", "off");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("aria-label", "terminal input");
    inputWrap.appendChild(input);
    /* 镜像量字宽：输入框宽度 = 已输入文本的真实渲染宽（含中文全角），
       块光标是流内兄弟节点，自然紧贴文本尾——空输入时贴最左侧 */
    var mirror = d.createElement("span");
    mirror.className = "t-mirror";
    mirror.setAttribute("aria-hidden", "true");
    inputWrap.appendChild(mirror);
    function syncW() {
      mirror.textContent = input.value;
      input.style.width = mirror.offsetWidth + "px";
    }
    input.addEventListener("input", syncW);
    input.addEventListener("compositionupdate", syncW);
    input.addEventListener("compositionend", syncW);
    inputWrap.addEventListener("click", function (e) { if (e.target === inputWrap) input.focus(); });
    input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var cmd = input.value.trim();
      input.value = ""; /* 命令行执行完即清空，像真终端 */
      syncW();
      run(cmd);
    });
    inputWrap.appendChild(cursor); /* 光标跟在输入行尾 */
    syncW();                       /* 初始 0 宽：光标贴 $ 右侧 */
    return inputWrap;
  }
  function echo(text, cls) {
    var line = d.createElement("div");
    line.className = "t-sys on" + (cls ? " " + cls : "");
    line.textContent = text;
    log.insertBefore(line, inputWrap);
    return line;
  }
  /* help 行：命令原文 + 行尾 # 中文注释（脚本味，一眼看懂） */
  function echoHelp(cmdText, zh) {
    var line = echo(cmdText + "  #");
    var cmt = d.createElement("span");
    cmt.className = "t-cmt";
    cmt.textContent = " " + zh;
    line.appendChild(cmt);
    return line;
  }
  function findItem(alias) {
    for (var i = 0; i < items.length; i++) if (items[i].alias === alias) return items[i];
    return null;
  }
  function run(raw) {
    if (!raw) return;
    var parts = raw.toLowerCase().split(/\s+/);
    var head = parts[0];
    var it = findItem(parts[1]);
    if (!it && head !== "help" && head !== "clear" && head !== "replay" && head !== "contact" && head !== "copy" && head !== "open" && head !== "link") {
      it = findItem(head);
      if (it) head = "contact";
    }
    if (head === "help") {
      echoHelp("help", "显示本清单");
      echoHelp("contact <wechat|qq|github>", "查看某个联系方式");
      echoHelp("copy <wechat|qq>", "复制账号到剪贴板，等同点 COPY");
      echoHelp("open github", "新标签打开仓库");
      echoHelp("clear / replay", "清屏 / 重新播放");
      return;
    }
    if (head === "clear") {
      Array.prototype.slice.call(log.children).forEach(function (n) {
        if (n !== inputWrap) n.remove();
      });
      return; /* 行节点仅从 log 摘走，replay 会复位并重排 */
    }
    if (head === "replay") { boot(); return; }
    if ((head === "contact" || head === "link") && it) {
      it.out.style.display = "";
      it.out.classList.add("on");
      blip("click");
      return;
    }
    if (head === "copy" && it) {
      if (it.ctl && it.ctl.hasAttribute("data-copy")) { it.ctl.click(); blip("up"); }
      else echo("channel has no clipboard id", "t-err");
      return;
    }
    if (head === "open" && it) {
      if (it.ctl && it.ctl.tagName === "A") w.open(it.ctl.href, "_blank", "noopener");
      else echo("channel has no link", "t-err");
      return;
    }
    echo("command not found: " + raw + " \u2014 try \u201Chelp\u201D", "t-err");
  }

  /* ---------- 复制回执：✓ VERIFIED 打在输出行尾（复制动作本身归 fx.js） ---------- */
  function receipt(it, ok) {
    if (!it) return;
    it.rc.textContent = ok ? "\u2713 VERIFIED" : "\u2717 FAILED";
    it.rc.classList.add("on", ok ? "ok" : "err");
    w.setTimeout(function () { it.rc.classList.remove("on"); }, 2400);
  }
  d.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest(".t-out [data-copy]") : null;
    if (!b) return;
    var it = null;
    for (var i = 0; i < items.length; i++) if (items[i].ctl === b) it = items[i];
    var ok = !!(navigator.clipboard && navigator.clipboard.writeText);
    receipt(it, ok);
    if (ok) blip("up");
  });

  /* ---------- 进场触发：首次入屏 boot 一次 ---------- */
  if ("IntersectionObserver" in w) {
    var io = new w.IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { io.disconnect(); boot(); }
      });
    }, { threshold: 0.35 });
    io.observe(card);
  } else {
    boot();
  }
})(window, document);
