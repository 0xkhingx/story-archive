import fs from "node:fs";
import path from "node:path";

/**
 * Exact port of NeuformIsolatedEffects' threeUIIntro definition +
 * buildFocusedDocument. Assembles the sandboxed srcDoc for the Intro Text
 * variant, with the introWordmark channel playing the first authored beat
 * once (chromatic assembly, 0 → 1.7s) and holding — no loop, no logo disc,
 * larger type. Kept in a plain .ts module (not .astro frontmatter) so
 * tooling never HTML-parses the embedded document strings.
 */

export const WORDMARK_TITLE = "ThreeUI chromatic wordmark intro";

const TARGETS = [{ selector: "#stage", role: "background" }];
const HIDDEN_TARGETS = [".sr"];

const THREEUI_MARK_SVG =
  `<svg viewBox="0 0 512 512" aria-hidden="true">\n` +
  `  <defs>\n` +
  `    <mask id="threeui-intro-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">\n` +
  `      <rect width="512" height="512" fill="#000"/>\n` +
  `      <circle cx="256" cy="256" r="208" fill="#fff"/>\n` +
  `      <g fill="none" stroke="#000" stroke-linecap="round" stroke-width="28">\n` +
  `        <path d="M36 178C112 252 184 264 260 196C336 128 404 114 482 180"/>\n` +
  `        <path d="M36 292C112 366 184 378 260 310C336 242 404 228 482 294"/>\n` +
  `      </g>\n` +
  `    </mask>\n` +
  `  </defs>\n` +
  `  <rect width="512" height="512" fill="#f5f5f7" mask="url(#threeui-intro-cut)"/>\n` +
  `</svg>`;

export type WordmarkMode = "dark" | "light";

export interface WordmarkOptions {
  mode: WordmarkMode;
  /** Wordmark text set into the authored assembly. Default: exact authored value. */
  text?: string;
}

export function wordmarkBackground(mode: WordmarkMode): string {
  // threeUIIntro theme: nativeMode dark; configured mode dark → no invert
  return mode === "light" ? "#f4f7fb" : "#000000";
}

export function buildWordmarkSrcDoc(options: WordmarkOptions): string {
  const safeMode: WordmarkMode = options.mode === "light" ? "light" : "dark";
  const text = options.text ?? "ThreeUI";
  const background = wordmarkBackground(safeMode);

  const introWordmark = {
    sceneSelector: "#comp .scene:first-child",
    text,
    fontSize: 210,
    endTime: 1.7,
    holdTime: 1.1,
    logoSvg: THREEUI_MARK_SVG,
  };

  const rawSource = fs.readFileSync(
    path.join(process.cwd(), "src/shaders/neuform-isolated/sources/creator-studio-intro.html"),
    "utf-8"
  );

  const targetJson = JSON.stringify(TARGETS).replace(/</g, "\\u003c");
  const hiddenTargetJson = JSON.stringify(HIDDEN_TARGETS).replace(/</g, "\\u003c");
  const introWordmarkJson = JSON.stringify(introWordmark).replace(/</g, "\\u003c");
  const modeJson = JSON.stringify(safeMode);
  const introWordmarkStyle = `${introWordmark.sceneSelector} .tx { font-size: ${introWordmark.fontSize}px !important; }`;

  const focusStyle =
    `<style data-threeui-focus>\n` +
    `html, body { width: 100% !important; height: 100% !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: ${background} !important; color-scheme: ${safeMode} !important; }\n` +
    `body { position: relative !important; display: flex !important; align-items: center !important; justify-content: center !important; }\n` +
    `body > * { visibility: hidden !important; }\n` +
    `body[data-threeui-ready] > [data-threeui-role] { visibility: visible !important; }\n` +
    `[data-threeui-residual] { display: none !important; }\n` +
    `[data-threeui-hidden] { display: none !important; }\n` +
    `[data-threeui-role="background"] { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important; max-width: none !important; max-height: none !important; z-index: 0 !important; opacity: 1 !important; pointer-events: none !important;  }\n` +
    `[data-threeui-role="background"][data-threeui-fit="contain-square"] { position: absolute !important; top: 50% !important; right: auto !important; bottom: auto !important; left: 50% !important; width: min(100vw, 100vh) !important; height: min(100vw, 100vh) !important; aspect-ratio: 1 / 1 !important; transform: translate(-50%, -50%) !important; }\n` +
    `[data-threeui-role="button"] { position: relative !important; z-index: 2 !important; opacity: 1 !important; flex: none !important; }\n` +
    `[data-threeui-role="button"]:not([data-threeui-preserve-transform]) { transform: none !important; }\n` +
    `[data-threeui-role="visual"] { position: relative !important; z-index: 1 !important; width: min(100%, 1040px) !important; max-width: 1040px !important; max-height: 100% !important; margin: auto !important; padding: 24px !important; overflow: auto !important; opacity: 1 !important; filter: none !important; }\n` +
    `[data-threeui-role="visual"]:not([data-threeui-preserve-transform]) { transform: none !important; }\n` +
    `[data-threeui-role="visual"][data-threeui-fit="contain-square"] { flex: none !important; width: min(calc(100vw - 32px), calc(100vh - 32px)) !important; max-width: none !important; height: min(calc(100vw - 32px), calc(100vh - 32px)) !important; max-height: none !important; aspect-ratio: 1 / 1 !important; padding: 0 !important; overflow: hidden !important; }\n` +
    `[data-threeui-role="visual"][data-threeui-fit="wide-wordmark"] { width: min(calc(100vw - 48px), 1180px) !important; max-width: calc(100vw - 48px) !important; height: auto !important; max-height: none !important; aspect-ratio: 16 / 3 !important; padding: 0 !important; overflow: hidden !important; }\n` +
    `[data-threeui-role="visual"][data-threeui-fit="portrait-stage"] { position: absolute !important; top: 50% !important; right: auto !important; bottom: auto !important; left: 50% !important; width: 1080px !important; max-width: none !important; height: 1350px !important; max-height: none !important; padding: 0 !important; overflow: hidden !important; transform-origin: center !important; }\n` +
    `${introWordmarkStyle}\n` +
    `</style>`;

  const focusScript =
    `<script data-threeui-focus>\n` +
    `(function () {\n` +
    `  document.documentElement.dataset.sfMode = ${modeJson};\n` +
    `  var isolated = false;\n` +
    `  function isolate() {\n` +
    `    if (isolated) return;\n` +
    `    var specs = ${targetJson};\n` +
    `    var hiddenSelectors = ${hiddenTargetJson};\n` +
    `    var introWordmark = ${introWordmarkJson};\n` +
    `    var roots = [];\n` +
    `    hiddenSelectors.forEach(function (selector) {\n` +
    `      document.querySelectorAll(selector).forEach(function (element) {\n` +
    `        element.setAttribute('data-threeui-hidden', '');\n` +
    `        element.setAttribute('aria-hidden', 'true');\n` +
    `        if ('inert' in element) element.inert = true;\n` +
    `      });\n` +
    `    });\n` +
    `    specs.forEach(function (spec) {\n` +
    `      var element = document.querySelector(spec.selector);\n` +
    `      if (!element) return;\n` +
    `      element.setAttribute('data-threeui-role', spec.role);\n` +
    `      if (spec.fit) element.setAttribute('data-threeui-fit', spec.fit);\n` +
    `      if (spec.preserveTransform) element.setAttribute('data-threeui-preserve-transform', '');\n` +
    `      if (!roots.some(function (root) { return root.contains(element); })) roots.push(element);\n` +
    `    });\n` +
    `    if (introWordmark) {\n` +
    `      var introScene = document.querySelector(introWordmark.sceneSelector);\n` +
    `      var introText = introScene && introScene.querySelector('.tx');\n` +
    `      var introMark = introText && introText.querySelector('.mark');\n` +
    `      if (introText && introMark) {\n` +
    `        introMark.style.display = 'none';\n` +
    `        var introCharacters = Array.from(introText.children).filter(function (element) { return element !== introMark; });\n` +
    `        introCharacters.forEach(function (element, index) {\n` +
    `          element.textContent = introWordmark.text[index] === ' ' ? '\\u00a0' : (introWordmark.text[index] || '');\n` +
    `          element.style.display = index < introWordmark.text.length ? 'inline-block' : 'none';\n` +
    `        });\n` +
    `      }\n` +
    `      /* assemble once from zero, then hold the assembled state — no loop */\n` +
    `      var introT0 = null;\n` +
    `      function renderIntroWordmarkOnce(now) {\n` +
    `        if (typeof window.__seek !== 'function') { requestAnimationFrame(renderIntroWordmarkOnce); return; }\n` +
    `        if (introT0 === null) introT0 = now;\n` +
    `        var t = (now - introT0) / 1000;\n` +
    `        if (t >= introWordmark.endTime) { window.__seek(introWordmark.endTime); return; }\n` +
    `        window.__seek(t);\n` +
    `        requestAnimationFrame(renderIntroWordmarkOnce);\n` +
    `      }\n` +
    `      requestAnimationFrame(renderIntroWordmarkOnce);\n` +
    `    }\n` +
    `    if (!roots.length) return;\n` +
    `    isolated = true;\n` +
    `    roots.forEach(function (root) {\n` +
    `      var placeholderLink = root.matches('a[href="#"]') ? root : root.querySelector('a[href="#"]');\n` +
    `      if (placeholderLink) placeholderLink.addEventListener('click', function (event) { event.preventDefault(); });\n` +
    `      document.body.appendChild(root);\n` +
    `    });\n` +
    `    Array.from(document.body.children).forEach(function (element) {\n` +
    `      if (roots.indexOf(element) !== -1) return;\n` +
    `      element.setAttribute('data-threeui-residual', '');\n` +
    `      element.setAttribute('aria-hidden', 'true');\n` +
    `      if ('inert' in element) element.inert = true;\n` +
    `    });\n` +
    `    document.body.setAttribute('data-threeui-ready', '');\n` +
    `    requestAnimationFrame(function () { window.dispatchEvent(new Event('resize')); });\n` +
    `  }\n` +
    `  function scheduleIsolation() { setTimeout(isolate, 100); }\n` +
    `  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleIsolation, { once: true });\n` +
    `  else scheduleIsolation();\n` +
    `  window.addEventListener('load', isolate, { once: true });\n` +
    `})();\n` +
    `</script>`;

  return rawSource
    .replace(/<\/head>/i, `${focusStyle}</head>`)
    .replace(/<\/body>/i, `${focusScript}</body>`);
}
