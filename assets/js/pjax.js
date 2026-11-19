/* ============================================================
   pjax.js —— 同文档导航层（2026-11-18 站主令「我不想要卡顿」，原方案 B）
   背景：方案 A（常驻播放器+deck-tape 恢复）消掉了「断乐」，消不掉「文档重建的
   缺口」——整页导航那 0.3~1s 里 <audio> 是被销毁再恢复的。本层把站内子页导航
   改成 fetch + DOM 换台，首页 deck 与 <audio> 从头到尾活着，音乐零缺口。
   双模式：
     Mode H（本文档=首页，deck 引擎在跑）：子页装进 .pjax-veil 固定覆层（盖住
       deck、垫在 chrome/tape/幕布之下）；回首页 = 摘 veil，deck 停留位天然保住。
     Mode S（本文档=子页，直链/深链进来的）：子页互切原地换 #main；
       切回首页不接管——交给 fx.js 老幕布路径整页导航（deck-tape 恢复兜底，
       deck 引擎是一次性 IIFE，重跑会双绑 document 监听器，不值当）。
   幕布编排复用 fx.js 的件（10-base.css .wipe）：起跑 body.wiping 与 fetch 并行，
   640ms 盖满 + 货到位才换台（观众全程只见幕布，darkroom 纪律），换完挂
   html.wipeout 揭幕、LIFT 后摘类。fetch 失败 = 幕布盖着走老整页路径。
   giscus：innerHTML 插 <script> 不执行——activate() 里 runScripts() 逐条重建
   节点才跑得起来；节点树带身份缓存（stash/activate 整树搬进搬出），
   back/forward 复用同一棵子树，脚本不重跑、iframe 不重建、讨论区不闪。
   历史：成功换台 pushState({pjax:1})；popstate 一律读 location 重新走台
   （state 只当「这是我装的」标记）；首页 base 条目不碰。
   注册顺序：本文件必须排在 fx.js 之前——点击处理器同层（bubble）按注册序跑，
   先 preventDefault，fx 的幕布处理器见 defaultPrevented 即让位，零改动。
   ES5 风格（禁 const/let/arrow）；Promise/fetch/DOMParser 是 API 不是语法。
   ============================================================ */
(function () {
  "use strict";
  var d = document, w = window, L = w.location;
  var reduced = w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var modeH = d.body.classList.contains("is-home"); /* 首页文档=覆层模式；否则就地换台 */
  var COVER = 640;   /* 幕布盖满时点：与 fx.js 的 setTimeout(…,640) 同步改 */
  var LIFT = 700;    /* 揭幕 wipe-out .52s + 末格 delay .138s ≈ .66s，留 40ms 余量 */
  var busy = false;
  var veil = null;
  var cur = null;    /* 当前装载 {page, box}：换台前整树搬回 page.host 缓存 */
  var homeTitle = d.title;
  var cache = {};    /* key -> {title, host(离树节点堆), live} */
  /* 当前展台页面的键，popstate 判「纯 hash 往返」用。
     注意：location 在 popstate 前就已更新，拿 keyOf(location) 自比恒真，必须有这个变量。 */
  var shownKey = L.pathname + L.search;

  function mkA(href) { var a = d.createElement("a"); a.href = href; return a; }
  function keyOf(u) { return u.pathname + u.search; }
  function hrefOf(u) { return keyOf(u) + (u.hash || ""); }

  /* ---------- 取页：网络 → DOMParser → 把 #main 的子树整棵摘进离线 host。
     搬节点而不是搬 innerHTML：保留节点身份，回访时原样再挂——
     giscus 的 iframe 和它背后的 client.js 观察链都活着一份，不重建。 ---------- */
  function getPage(key) {
    if (cache[key]) return Promise.resolve(cache[key]);
    return fetch(key, { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("pjax " + res.status + " " + key);
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var m = doc.getElementById("main");
        if (!m || !m.firstChild) throw new Error("pjax no #main: " + key);
        var host = d.createElement("div");
        while (m.firstChild) host.appendChild(m.firstChild);
        var page = { title: doc.title, host: host, live: false };
        cache[key] = page;
        return page;
      });
  }

  /* innerHTML/insertAdjacent 插进去的 <script> 是«惰性节点»不会执行（HTML 规范），
     giscus client.js 就装在这一层——逐条 createElement 复制属性再换进去才真跑。
     只在页面第一次激活时做一次；之后树是「活」的，搬进搬出不重跑。 */
  function runScripts(box) {
    [].slice.call(box.querySelectorAll("script")).forEach(function (s) {
      var n = d.createElement("script");
      [].forEach.call(s.attributes, function (at) { n.setAttribute(at.name, at.value); });
      n.text = s.text;
      s.parentNode.replaceChild(n, s);
    });
  }

  /* ---------- 装载模型：page.host 是仓库，box（veil 或 #main）是展台。
     activate = 仓库→展台 + （首访）点火脚本；stash = 展台→仓库。 ---------- */
  function activate(page, box) {
    while (page.host.firstChild) box.appendChild(page.host.firstChild);
    if (!page.live) { page.live = true; runScripts(box); }
    cur = { page: page, box: box };
  }
  function stash() {
    if (!cur) return;
    while (cur.box.firstChild) cur.page.host.appendChild(cur.box.firstChild);
    cur = null;
  }

  function ensureVeil() {
    if (veil) return veil;
    veil = d.createElement("div");
    veil.className = "pjax-veil";
    veil.setAttribute("role", "region");
    veil.setAttribute("aria-label", "子页");
    d.body.appendChild(veil);
    return veil;
  }
  function openVeil(page) {
    var v = ensureVeil();
    /* 同一页再开（纯 hash 往返回到本页）：树已在展台，什么都不搬——
       尤其不 reset scrollTop，浏览器自己的片段回滚交还给用户 */
    if (cur && cur.page === page && v.classList.contains("on")) return;
    stash();
    v.scrollTop = 0;
    activate(page, v);
    d.body.classList.add("pjax-open");
    v.classList.add("on");
  }
  function closeVeil() {
    stash();
    if (veil) veil.classList.remove("on");
    d.body.classList.remove("pjax-open");
  }

  /* 回首页落点：back-line 的 /#c-xxx —— hash 是卡 id 就走 deck.go（引擎还活着，
     平滑滚动照常）；不是卡 id（理论不会发生）退成 scrollIntoView。 */
  function gotoHash(hash) {
    if (!hash || hash.length < 2) return;
    var id = hash.slice(1);
    var cards = w.deck && w.deck.cards;
    if (cards) {
      for (var i = 0; i < cards.length; i++) {
        if (cards[i].id === id) { w.deck.go(i); return; }
      }
    }
    var el = d.getElementById(id);
    if (el) el.scrollIntoView();
  }

  /* ---------- 换台编排：幕布与取货并行，两样都到位才动手 ---------- */
  function transition(job, done, failHref) {
    if (busy) return;
    busy = true;
    var cover;
    if (reduced) {
      cover = Promise.resolve();
    } else {
      d.body.classList.add("wiping");
      cover = new Promise(function (r) { w.setTimeout(r, COVER); });
    }
    Promise.all([job, cover]).then(function (rs) {
      done(rs[0]);
      busy = false;
      if (reduced) return;
      d.body.classList.remove("wiping");
      /* 到达侧揭幕：与整页路径同一个 html.wipeout（那头的挂法见 head.html 内联） */
      d.documentElement.classList.add("wipeout");
      w.setTimeout(function () { d.documentElement.classList.remove("wipeout"); }, LIFT);
    }, function () {
      /* 取货失败（404/断网/结构不对）：此刻幕布要么没起要么盖满，
         交还整页导航——老路径的样子，用户看不出两次尝试。 */
      busy = false;
      L.href = failHref;
    });
  }

  /* Mode H：子页开 veil；首页（含 /#c-xxx 落点）摘 veil。 */
  function navigate(u, push) {
    var home = u.pathname === "/";
    transition(home ? Promise.resolve("home") : getPage(keyOf(u)), function (what) {
      if (what === "home") {
        closeVeil();
        document.title = homeTitle;
        gotoHash(u.hash);
      } else {
        openVeil(what);
        document.title = what.title;
      }
      shownKey = keyOf(u);
      if (push) history.pushState({ pjax: 1 }, "", hrefOf(u));
    }, hrefOf(u));
  }

  /* Mode S：子页就地换 #main。回首页不在这里发生（click 层已让给 fx 老路径）。 */
  function swapMain(u, push) {
    transition(getPage(keyOf(u)), function (page) {
      var m = d.getElementById("main");
      if (!cur) {
        /* Mode S 首换：文档自带的 #main 树不在装载模型里，stash 会空转、
           activate 只 append——旧树留在展台（实测 A 稿下面长出 B 稿）。
           先把它按当前地址登记成「来过」的页：搬进仓库、进缓存，
           back/forward 回来时原树复用不重 fetch。 */
        var host0 = d.createElement("div");
        while (m.firstChild) host0.appendChild(m.firstChild);
        var p0 = { title: document.title, host: host0, live: true };
        cur = { page: p0, box: m };
        if (!cache[shownKey]) cache[shownKey] = p0;
      }
      stash();
      activate(page, m);
      w.scrollTo(0, 0);
      document.title = page.title;
      shownKey = keyOf(u);
      if (push) history.pushState({ pjax: 1 }, "", hrefOf(u));
    }, hrefOf(u));
  }

  /* ---------- 链接裁决 ----------
     过滤条件抄 fx.js 幕布处理器（769–784），一边一个都会漏。
     data-home-spot（Mode S 的 HOME 胶囊）显式不接管：fx 会把 href 改写成
     停留位再整页导航，pjax 抢先吞掉反而丢落点语义。 */
  function pick(e) {
    if (e.defaultPrevented || e.button !== 0 ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a || a.hasAttribute("data-home-spot")) return null;
    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || a.target === "_blank" || a.hasAttribute("download")) return null;
    if (/^([a-z]+:)?\/\//i.test(href) && a.host !== L.host) return null;
    var u = mkA(a.href);
    if (u.protocol !== L.protocol || u.host !== L.host) return null;
    return u;
  }

  d.addEventListener("click", function (e) {
    /* 幕布下落/取货途中：吞掉一切链接点击——既不重跑一轮 transition，
       也绝不能放行给 fx.js 老路径（那会在 pjax 换台半途排进 location.href） */
    if (busy) {
      if (e.target && e.target.closest && e.target.closest("a")) e.preventDefault();
      return;
    }
    var veilOn = !!(veil && veil.classList.contains("on"));

    /* chrome 常驻的 CONTACT 胶囊（data-scroll）：deck.js 在捕获层已 preventDefault
       并把 deck 滚过去；veil 开着时我们只差把它摘掉，让滚动露出来。
       摘 veil 是瞬时视觉切换——首页内部锚点本来就没有幕布，保持一致。 */
    if (e.target && e.target.closest && e.target.closest("[data-scroll]")) {
      if (modeH && veilOn) {
        closeVeil();
        document.title = homeTitle;
        history.pushState({ pjax: 1 }, "", "/");
      }
      return;
    }

    var u = pick(e);
    if (!u) return;

    if (!modeH) {
      /* Mode S：回首页让位给 fx 老路径（整页导航 + deck-tape 恢复） */
      if (u.pathname === "/") return;
      e.preventDefault();
      if (keyOf(u) === keyOf(L)) return; /* 已在此页：原地刷新没意义 */
      swapMain(u, true);
      return;
    }

    e.preventDefault();
    /* 首页文档点首页（无 veil）：无事可做 */
    if (u.pathname === "/" && !veilOn) return;
    navigate(u, true);
  });

  /* ---------- back / forward：一律以 location 为准重新走台。
     popstate 不 push（条目本来就在那）；幕布照走（换向的视觉反馈）。 ---------- */
  w.addEventListener("popstate", function () {
    var u = mkA(L.href);
    /* 纯 hash 往返（post-toc 之类）：键没变，浏览器自己滚片段，别换台 */
    if (keyOf(u) === shownKey && u.pathname !== "/") return;
    if (modeH) { navigate(u, false); return; }
    if (u.pathname === "/") { L.reload(); return; } /* Mode S 回到首页 base 条目：重建文档 */
    swapMain(u, false);
  });

  /* Mode S 的 base 条目补个标记，popstate 判定「我装的」时不认它也没差——
     统一 replace 一下，条目形状与 Mode H 推出来的对齐。 */
  if (!modeH && !history.state) {
    try { history.replaceState({ pjax: 1 }, "", L.href); } catch (err) {}
  }
})();
