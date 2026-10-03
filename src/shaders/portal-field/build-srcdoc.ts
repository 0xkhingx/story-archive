import fs from "node:fs";
import path from "node:path";

/**
 * Exact port of NeuformBatchEffects' portalField definition +
 * buildFocusedDocument. Assembles the sandboxed srcDoc for the Portal Field
 * variant. Kept in a plain .ts module (not .astro frontmatter) so tooling
 * never HTML-parses the embedded document strings.
 */

export const PORTAL_BACKGROUND = "#05060a";
const TARGETS = [{ selector: "#webgl-container", role: "background" }];

/** WebGL1 GLSL ES requires float literals (10.0), not ints (10). */
function glslFloat(value: number, digits = 3) {
  const fixed = Number(value).toFixed(digits);
  return fixed.includes(".") ? fixed : `${fixed}.0`;
}

export interface PortalBakeKnobs {
  size: number;
  gap: number;
  length: number;
  density: number;
  strokeWidth: number;
}

export function buildPortalSrcDoc(knobs: PortalBakeKnobs): string {
  const rawSource = fs.readFileSync(
    path.join(process.cwd(), "src/shaders/neuform-isolated/sources/portal-field.html"),
    "utf-8"
  );

  // portalField.patch — baked geometry knobs
  const patchedSource = rawSource
    .replace(
      "float d1 = sdArc(st, center, 0.6, 0.02, 0.15);",
      `float d1 = sdArc(st, center, ${glslFloat(0.6 * knobs.length, 3)}, ${glslFloat(0.02 * knobs.size, 4)}, 0.15);`
    )
    .replace(
      "float d2 = sdArc(st, center, 0.65, 0.06, 0.2);",
      `float d2 = sdArc(st, center, ${glslFloat(0.65 * knobs.length, 3)}, ${glslFloat(0.06 * knobs.size, 4)}, 0.2);`
    );

  // Baked controls use defaults (speed 1, opacity 1); live values arrive via postMessage
  const controlsJson = JSON.stringify({
    mode: "dark",
    speed: 1,
    size: knobs.size,
    gap: knobs.gap,
    length: knobs.length,
    density: knobs.density,
    strokeWidth: knobs.strokeWidth,
    opacity: 1,
  }).replace(/</g, "\\u003c");
  const targetJson = JSON.stringify(TARGETS).replace(/</g, "\\u003c");

  const focusStyle =
    `<style data-threeui-focus>\n` +
    `html, body { width: 100% !important; height: 100% !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: ${PORTAL_BACKGROUND} !important; }\n` +
    `body { position: relative !important; display: flex !important; align-items: center !important; justify-content: center !important; }\n` +
    `body > * { visibility: hidden !important; }\n` +
    `body[data-threeui-ready] > [data-threeui-role] { visibility: visible !important; }\n` +
    `[data-threeui-residual] { display: none !important; }\n` +
    `[data-threeui-role="background"] { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important; max-width: none !important; max-height: none !important; z-index: 0 !important; opacity: 1 !important; pointer-events: none !important; }\n` +
    `[data-threeui-role="ui"] { position: relative !important; z-index: 1 !important; width: min(calc(100% - 32px), var(--threeui-target-width, 1040px)) !important; max-width: none !important; max-height: calc(100% - 32px) !important; margin: auto !important; overflow: auto !important; opacity: 1 !important; transform: none !important; filter: none !important; flex: none !important; box-sizing: border-box !important; }\n` +
    `</style>`;

  const controlScript =
    `<script data-threeui-controls>\n` +
    `(function () {\n` +
    `  var controls = ${controlsJson};\n` +
    `  window.__SF_CONTROLS = controls;\n` +
    `  var origin = performance.now();\n` +
    `  var virtual = 0;\n` +
    `  var last = origin;\n` +
    `  var performanceNow = performance.now.bind(performance);\n` +
    `  var dateNow = Date.now.bind(Date);\n` +
    `  var dateOrigin = dateNow();\n` +
    `  performance.now = function () {\n` +
    `    var real = performanceNow();\n` +
    `    virtual += (real - last) * (controls.speed || 1);\n` +
    `    last = real;\n` +
    `    return origin + virtual;\n` +
    `  };\n` +
    `  Date.now = function () {\n` +
    `    return dateOrigin + (performance.now() - origin);\n` +
    `  };\n` +
    `  var raf = window.requestAnimationFrame.bind(window);\n` +
    `  window.requestAnimationFrame = function (callback) {\n` +
    `    return raf(function () {\n` +
    `      callback(performance.now());\n` +
    `    });\n` +
    `  };\n` +
    `  function applyVisual() {\n` +
    `    var opacity = controls.opacity == null ? 1 : controls.opacity;\n` +
    `    var size = controls.size == null ? 1 : controls.size;\n` +
    `    Array.prototype.forEach.call(document.querySelectorAll('[data-threeui-role]'), function (element) {\n` +
    `      element.style.opacity = String(opacity);\n` +
    `      if (element.getAttribute('data-threeui-role') === 'ui') {\n` +
    `        element.style.transform = 'scale(' + size + ')';\n` +
    `        element.style.transformOrigin = 'center center';\n` +
    `      }\n` +
    `    });\n` +
    `  }\n` +
    `  window.addEventListener('message', function (event) {\n` +
    `    if (!event.data || event.data.type !== 'threeui-controls') return;\n` +
    `    var next = event.data.controls || {};\n` +
    `    Object.keys(next).forEach(function (key) { controls[key] = next[key]; });\n` +
    `    applyVisual();\n` +
    `  });\n` +
    `  window.__SF_APPLY_CONTROLS = applyVisual;\n` +
    `})();\n` +
    `</script>`;

  const focusScript =
    `<script data-threeui-focus>\n` +
    `(function () {\n` +
    `  var isolated = false;\n` +
    `  function isolate() {\n` +
    `    if (isolated) return;\n` +
    `    var specs = ${targetJson};\n` +
    `    var roots = [];\n` +
    `    specs.forEach(function (spec) {\n` +
    `      var element = document.querySelector(spec.selector);\n` +
    `      if (!element) return;\n` +
    `      element.setAttribute('data-threeui-role', spec.role);\n` +
    `      if (spec.width) element.style.setProperty('--threeui-target-width', spec.width);\n` +
    `      if (!roots.some(function (root) { return root.contains(element); })) roots.push(element);\n` +
    `    });\n` +
    `    if (!roots.length) return;\n` +
    `    isolated = true;\n` +
    `    roots.forEach(function (root) { document.body.appendChild(root); });\n` +
    `    Array.from(document.body.children).forEach(function (element) {\n` +
    `      if (roots.indexOf(element) !== -1) return;\n` +
    `      element.setAttribute('data-threeui-residual', '');\n` +
    `      element.setAttribute('aria-hidden', 'true');\n` +
    `      if ('inert' in element) element.inert = true;\n` +
    `    });\n` +
    `    document.body.setAttribute('data-threeui-ready', '');\n` +
    `    if (window.__SF_APPLY_CONTROLS) window.__SF_APPLY_CONTROLS();\n` +
    `    requestAnimationFrame(function () { window.dispatchEvent(new Event('resize')); });\n` +
    `  }\n` +
    `  function scheduleIsolation() { setTimeout(isolate, 100); }\n` +
    `  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleIsolation, { once: true });\n` +
    `  else scheduleIsolation();\n` +
    `  window.addEventListener('load', isolate, { once: true });\n` +
    `})();\n` +
    `</script>`;

  return patchedSource
    .replace(/<head([^>]*)>/i, `<head$1>${controlScript}${focusStyle}`)
    .replace(/<\/body>/i, `${focusScript}</body>`);
}
