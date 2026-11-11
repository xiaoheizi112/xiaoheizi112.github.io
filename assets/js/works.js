/* ============================================================
 * works.js — 05 WORKS 行增强：从 GitHub API 拉实时仓库数据
 *   给每条 .work-row 补 ★star / ⑂fork / 语言 / 最近 push，
 *   顺带把 UPDATED 字段换成 API 的真实时间（数据文件只是兜底）。
 * 约定：行 markup 里 .wr-name 的文本 = 仓库名；API 失败静默，
 * 页面保持数据文件里的静态文案。60 req/h IP 限流，3 仓无压力。
 * ============================================================ */
(function () {
  "use strict";
  var OWNER = "xiaoheizi112";
  var rows = document.querySelectorAll("#c-works .work-row");
  if (!rows.length) return;
  var proto = location.protocol;
  if (proto !== "http:" && proto !== "https:") return; // file:// 预览不请求

  function fmtN(n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
  }
  function fmtD(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  rows.forEach(function (row) {
    var nameEl = row.querySelector(".wr-name");
    if (!nameEl) return;
    var name = nameEl.textContent.trim();

    var box = document.createElement("span");
    box.className = "wr-stats mono";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = '<span class="ws-skel"></span>';
    var tags = row.querySelector(".wr-tags");
    if (tags) tags.appendChild(box);

    fetch("https://api.github.com/repos/" + OWNER + "/" + encodeURIComponent(name), {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || typeof j.stargazers_count !== "number") { box.innerHTML = ""; return; }
        var bits = [];
        bits.push('<span class="ws-star" title="Star">&#9733; ' + fmtN(j.stargazers_count) + "</span>");
        if (j.forks_count) bits.push('<span class="ws-fork" title="Fork">&#9099; ' + fmtN(j.forks_count) + "</span>");
        if (j.language) bits.push('<span class="ws-lang"><i class="ws-dot"></i>' + j.language + "</span>");
        box.innerHTML = bits.join("");
        var pushEl = row.querySelector(".wr-updated");
        if (pushEl && j.pushed_at) pushEl.textContent = "UPDATED " + fmtD(j.pushed_at);
      })
      .catch(function () { box.innerHTML = ""; });
  });
})();
