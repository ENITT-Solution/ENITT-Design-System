/**
 * 디자인 토큰 빌드 스크립트
 *
 * src/primitives.json + src/semantic.json  ──▶  src/generated/tokens.css
 *                                          └──▶  src/generated/tokens.ts
 *
 * 의미 토큰의 "{color.blue.500}" 참조를 원시 토큰 값으로 해석하고,
 * light / dark 두 벌의 CSS 커스텀 프로퍼티를 뽑아낸다.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PREFIX = '--enitt';
const THEMES = /** @type {const} */ (['light', 'dark']);

const read = (p) => JSON.parse(readFileSync(resolve(ROOT, p), 'utf8'));
const readOptional = (p) => (existsSync(resolve(ROOT, p)) ? read(p) : null);

const primitives = read('src/primitives.json');
const semantic = read('src/semantic.json');
// 선택적 확장: 속성으로 켜는 토큰 프리셋. 도메인 팩이 이 파일만 추가하면 된다.
const presets = readOptional('src/presets.json');

/** `{color.blue.500}` 같은 참조를 원시 토큰에서 찾아 실제 값으로 바꾼다. */
function resolveRef(value, path) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{([^}]+)\}/g, (_, ref) => {
    const hit = ref.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), primitives);
    if (typeof hit !== 'string') {
      throw new Error(`토큰 참조를 해석할 수 없습니다: {${ref}} (${path.join('.')} 에서 참조)`);
    }
    return hit;
  });
}

/** 중첩 객체를 [세그먼트 배열, 값] 쌍으로 평탄화한다. $ 로 시작하는 메타 키는 건너뛴다. */
function* walk(node, path = []) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object') yield* walk(value, [...path, key]);
    else yield [[...path, key], value];
  }
}

/** ['color','bg','canvas'] → '--enitt-color-bg-canvas' */
const varName = (segments) => `${PREFIX}-${segments.join('-').replace(/\./g, '_')}`;

// ─────────────────────────────────────────────────────────────
// 1. 원시 토큰 — 테마와 무관하므로 :root 에 한 번만 선언한다.
// ─────────────────────────────────────────────────────────────
/** @type {Array<{ name: string, segments: string[], value: string }>} */
const paletteTokens = [];
/** @type {Array<{ name: string, segments: string[], value: string }>} */
const dimensionTokens = [];

for (const [segments, value] of walk(primitives)) {
  // color.* 는 팔레트로 이름을 바꿔 의미 토큰(--enitt-color-*)과 섞이지 않게 한다.
  const isColor = segments[0] === 'color';
  const renamed = isColor ? ['palette', ...segments.slice(1)] : segments;
  const entry = { name: varName(renamed), segments: segments.slice(isColor ? 1 : 0), value };
  (isColor ? paletteTokens : dimensionTokens).push(entry);
}

const paletteVars = paletteTokens.map((t) => [t.name, t.value]);
const dimensionVars = dimensionTokens.map((t) => [t.name, t.value]);

// ─────────────────────────────────────────────────────────────
// 2. 의미 토큰 — 테마별로 한 벌씩.
// ─────────────────────────────────────────────────────────────
/** @type {Record<string, Array<[string, string]>>} */
const themeVars = { light: [], dark: [] };
/** @type {Array<{ name: string, segments: string[] }>} */
const semanticTokens = [];

for (const [segments, value] of walk(semantic)) {
  const theme = segments.at(-1);
  if (!THEMES.includes(theme)) {
    throw new Error(`의미 토큰의 잎은 light/dark 여야 합니다: ${segments.join('.')}`);
  }
  const tokenPath = segments.slice(0, -1);
  const name = varName(tokenPath);
  themeVars[theme].push([name, resolveRef(value, segments)]);
  if (theme === 'light') semanticTokens.push({ name, segments: tokenPath });
}

// ─────────────────────────────────────────────────────────────
// 3. CSS 출력
// ─────────────────────────────────────────────────────────────
const declare = (pairs, indent = '  ') =>
  pairs.map(([name, value]) => `${indent}${name}: ${value};`).join('\n');

/**
 * 속성으로 켜는 토큰 프리셋.
 *
 * `src/presets.json` 이 있으면 `[data-enitt-<속성>='<값>']` 블록을 만들어
 * 지정한 의미 토큰이 다른 의미 토큰을 가리키게 한다. 도메인 팩이 코어 토큰을
 * 건드리지 않고 규칙을 바꿔 끼우는 통로다. 파일이 없으면 아무것도 내보내지 않는다.
 */
function renderPresets() {
  if (!presets) return '';

  const known = new Set(semanticTokens.map((token) => token.segments.join('.')));
  const blocks = [];

  for (const [attribute, variants] of Object.entries(presets)) {
    if (attribute.startsWith('$')) continue;
    for (const [variant, overrides] of Object.entries(variants)) {
      const declarations = Object.entries(overrides).map(([target, source]) => {
        for (const path of [target, source]) {
          if (!known.has(path)) {
            throw new Error(
              `프리셋이 존재하지 않는 의미 토큰을 가리킵니다: ${path} (${attribute}=${variant})`,
            );
          }
        }
        return `  ${varName(target.split('.'))}: var(${varName(source.split('.'))});`;
      });
      blocks.push(
        `[data-enitt-${attribute}='${variant}'] {\n${declarations.join('\n')}\n}`,
      );
    }
  }

  if (blocks.length === 0) return '';
  // enitt.presets 레이어가 enitt.tokens 뒤에 오므로, 특정도와 무관하게 프리셋이 이긴다.
  const body = blocks.join('\n\n');
  return `\n}\n\n@layer enitt.presets {\n\n/* ── 토큰 프리셋 (src/presets.json) ── */\n${body}\n\n}\n\n@layer enitt.tokens {\n`;
}

const banner = `/**
 * ENITT Design System — Design Tokens
 *
 * 이 파일은 scripts/build-tokens.mjs 가 생성합니다. 직접 수정하지 마세요.
 * 토큰을 바꾸려면 src/primitives.json / src/semantic.json 을 수정한 뒤
 * \`pnpm --filter @enitt/tokens generate\` 를 실행하세요.
 */`;

const css = `${banner}

/*
 * 토큰 선언은 두 레이어로 나뉜다.
 *
 * 프리셋은 [data-enitt-...] 한 겹짜리 선택자라, 테마 블록(:root[data-theme='light'],
 * :root:not([data-theme='light']))보다 특정도가 낮아 그냥 두면 절대 이기지 못한다.
 * 레이어 순서는 특정도를 무시하므로 뒤 레이어가 항상 이긴다.
 *
 * 두 레이어 모두 레이어 밖(소비 앱)의 선언에는 진다 — 앱이 토큰을 덮어쓰는 건 의도된 동작이다.
 */
@layer enitt.tokens, enitt.presets;

@layer enitt.tokens {

:root {
  /* ── 팔레트 (원시 색상 — 컴포넌트에서 직접 쓰지 말 것) ────────────── */
${declare(paletteVars)}

  /* ── 치수 · 타이포그래피 · 모션 (테마 무관) ──────────────────────── */
${declare(dimensionVars)}
}

/* ── 라이트 테마 (기본값) ─────────────────────────────────────────── */
:root,
:root[data-theme='light'] {
  color-scheme: light;
${declare(themeVars.light)}
}

/* ── 다크 테마 — 사용자가 명시적으로 고른 경우 ────────────────────── */
:root[data-theme='dark'] {
  color-scheme: dark;
${declare(themeVars.dark)}
}

/* ── 다크 테마 — OS 설정을 따르는 경우 ────────────────────────────── */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    color-scheme: dark;
${declare(themeVars.dark, '    ')}
  }
}

${renderPresets()}

/* ── 모션 민감 사용자 존중 ────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  :root {
    ${PREFIX}-duration-fast: 0ms;
    ${PREFIX}-duration-normal: 0ms;
    ${PREFIX}-duration-slow: 0ms;
    ${PREFIX}-duration-pulse: 0ms;
  }
}

}
`;

// ─────────────────────────────────────────────────────────────
// 4. TypeScript 출력
// ─────────────────────────────────────────────────────────────
/** 세그먼트 배열을 중첩 객체로 되살린다. */
function nest(entries, valueOf) {
  const root = {};
  for (const entry of entries) {
    const segments = entry.segments;
    let cursor = root;
    for (const key of segments.slice(0, -1)) cursor = cursor[key] ??= {};
    cursor[segments.at(-1)] = valueOf(entry);
  }
  return root;
}

const stringify = (value, indent = 2) =>
  JSON.stringify(value, null, indent).replace(/"([A-Za-z_$][\w$]*)":/g, '$1:').replace(/"/g, "'");

const paletteTree = nest(paletteTokens, (e) => e.value);
const dimensionTree = nest(dimensionTokens, (e) => `var(${e.name})`);

const ts = `${banner}

/** 의미 토큰 → CSS 커스텀 프로퍼티 참조. 컴포넌트는 이것만 사용한다. */
export const tokens = ${stringify(nest(semanticTokens, (e) => `var(${e.name})`))} as const;

/** 간격 · 반경 · 타이포그래피 · 모션 → CSS 커스텀 프로퍼티 참조. */
export const dimensions = ${stringify(dimensionTree)} as const;

/** 원시 팔레트의 실제 hex 값. canvas 렌더링처럼 var() 를 못 쓰는 곳에서만 사용한다. */
export const palette = ${stringify(paletteTree)} as const;

/** 테마별 CSS 변수 실측값. SSR 인라인 스타일이나 이미지 내보내기에 쓴다. */
export const themeValues = {
  light: ${stringify(Object.fromEntries(themeVars.light), 4)},
  dark: ${stringify(Object.fromEntries(themeVars.dark), 4)},
} as const;

/** 차트 시리즈 색상 — 고정 순서. 순환 배정하지 말 것 (9번째 계열은 '기타'로 묶는다). */
export const chartSeriesTokens = [
${Array.from({ length: 8 }, (_, i) => `  tokens.color.chart['series-${i + 1}'],`).join('\n')}
] as const;

export type ThemeName = keyof typeof themeValues;
export type CssVarName = keyof (typeof themeValues)['light'];
`;

// ─────────────────────────────────────────────────────────────
// 5. 파일 기록
// ─────────────────────────────────────────────────────────────
const outDir = resolve(ROOT, 'src/generated');
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'tokens.css'), css, 'utf8');
writeFileSync(resolve(outDir, 'tokens.ts'), ts, 'utf8');

// CSS 는 컴파일 대상이 아니므로 배포 폴더에도 같이 떨군다.
const distDir = resolve(ROOT, 'dist');
mkdirSync(distDir, { recursive: true });
writeFileSync(resolve(distDir, 'tokens.css'), css, 'utf8');

console.log(
  `토큰 생성 완료 — 팔레트 ${paletteVars.length}개, 치수 ${dimensionVars.length}개, 의미 토큰 ${semanticTokens.length}개 × 2테마`,
);
