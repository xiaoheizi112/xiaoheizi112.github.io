#!/usr/bin/env node
/**
 * 生成简历 PDF：把 /resume/ 的打印版（@media print）导出成 A4 PDF。
 *
 * 用法：
 *   hugo server 跑着（localhost:1313）
 *   node scripts/gen_resume_pdf.mjs
 * 产物：
 *   static/files/resume-qt-heyujie.pdf（网页上的「下载 PDF 简历」指向它）
 *
 * 说明：
 * - 优先复用已开着的调试浏览器（127.0.0.1:9333，和 .zcode/cdp-*.mjs 同一套）；
 *   没有就自己拉一个无头 Edge（9334 端口，结束后关掉）。
 * - 强制浅色主题 + print 媒体，页边距/纸张由 resume.css 的 @page 决定。
 * - 改完 data/resume.yml 或页面样式，重跑本脚本即可更新 PDF。
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const URL_PAGE = process.env.RESUME_URL || "http://localhost:1313/resume/";
const OUT = path.join(ROOT, "static", "files", "resume-qt-heyujie.pdf");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probe(port) {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(1200) });
    return r.ok;
  } catch { return false; }
}

async function ensureBrowser() {
  if (await probe(9333)) return { port: 9333, spawned: null };
  const candidates = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  const exe = candidates.find((p) => fs.existsSync(p));
  if (!exe) throw new Error("找不到 Edge，请先手动开一个带 --remote-debugging-port=9333 的浏览器");
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "resume-pdf-"));
  const child = spawn(exe, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=9334", `--user-data-dir=${profile}`, "about:blank",
  ], { stdio: "ignore", detached: false });
  for (let i = 0; i < 30; i++) {
    if (await probe(9334)) return { port: 9334, spawned: { child, profile } };
    await sleep(500);
  }
  child.kill();
  throw new Error("无头 Edge 起不来（9334 一直没响应）");
}

async function checkServer() {
  try {
    const r = await fetch(URL_PAGE, { signal: AbortSignal.timeout(2000) });
    if (!r.ok) throw new Error(String(r.status));
  } catch {
    throw new Error(`本地站点没起来：${URL_PAGE}\n先在仓库根目录跑 hugo server --bind 127.0.0.1 --port 1313 --disableFastRender`);
  }
}

async function cdp(port) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pend = new Map(); let loadResolve = null;
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
    else if (m.method === "Page.loadEventFired" && loadResolve) loadResolve();
  };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJS = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300));
    return r.result.result.value;
  };
  await send("Page.enable"); await send("Runtime.enable");
  const waitLoad = () => new Promise((r) => (loadResolve = r));
  return { send, evalJS, waitLoad, close: () => ws.close(), targetId: target.id };
}

const { port, spawned } = await ensureBrowser();
await checkServer();
const { send, evalJS, waitLoad, close } = await cdp(port);

try {
  // 打印前强制浅色：深色主题下打印色会被变量带跑
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: "try { localStorage.setItem('pref-theme','light'); } catch (e) {}",
  });
  await send("Emulation.setDeviceMetricsOverride", { width: 900, height: 1200, deviceScaleFactor: 1, mobile: false });
  await send("Emulation.setEmulatedMedia", { media: "print" });

  const loaded = waitLoad();
  await send("Page.navigate", { url: URL_PAGE });
  await Promise.race([loaded, sleep(10000)]);
  await send("Emulation.setEmulatedMedia", { media: "print" });
  await evalJS("(async () => { if (document.fonts && document.fonts.ready) { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]); } return 1; })()");
  await sleep(600);

  const check = await evalJS(`(() => ({
    theme: document.documentElement.dataset.theme,
    projects: document.querySelectorAll(".res-proj").length,
    hiddenProjects: [...document.querySelectorAll('.res-proj[data-print="2"]')].filter(e => getComputedStyle(e).display === "none").length,
    navHidden: getComputedStyle(document.querySelector(".nav")).display === "none",
    badgeHidden: !document.getElementById("local-badge") || getComputedStyle(document.getElementById("local-badge")).display === "none",
    printFoot: !!document.querySelector(".res-print-foot") && getComputedStyle(document.querySelector(".res-print-foot")).display !== "none",
  }))()`);
  if (check.theme !== "light") console.warn("警告：打印时不是浅色主题");
  if (!check.navHidden) throw new Error("print 媒体没生效（导航还显示着）");

  const res = await send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
  });
  if (!res.result || !res.result.data) throw new Error("printToPDF 没返回数据");
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, Buffer.from(res.result.data, "base64"));

  const buf = fs.readFileSync(OUT);
  const pages = (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log(`OK  ${path.relative(ROOT, OUT)}`);
  console.log(`    大小 ${(buf.length / 1024).toFixed(0)} KB · 页数 ${pages || "?"}`);
  console.log(`    打印检查：项目卡 ${check.projects} 个（隐藏 ${check.hiddenProjects} 个）· 导航隐藏 ${check.navHidden} · 水印隐藏 ${check.badgeHidden} · 页脚 ${check.printFoot}`);
} finally {
  close();
  if (spawned) {
    spawned.child.kill();
    await sleep(300);
    try { fs.rmSync(spawned.profile, { recursive: true, force: true }); } catch {}
  }
}