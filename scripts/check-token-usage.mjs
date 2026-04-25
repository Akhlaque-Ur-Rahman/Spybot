import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'src');

const bannedPatterns = [
  {
    label: 'Avoid low-contrast primary text token',
    regex: /color:\s*var\(--color-primary-300\)/g,
  },
  {
    label: 'Avoid low-contrast tertiary text token',
    regex: /color:\s*var\(--color-tertiary-300\)/g,
  },
  {
    label: 'Avoid legacy focus fallback token',
    regex: /var\(--color-focus-ring,\s*var\(--color-primary-300\)\)/g,
  },
];

const expectedHoverPairs = [
  { base: 'var(--color-primary-500)', hover: 'var(--color-primary-400)' },
  { base: 'var(--color-tertiary-600)', hover: 'var(--color-tertiary-500)' },
];

function collectCssFiles(dirPath, out = []) {
  const entries = readdirSync(dirPath);
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectCssFiles(fullPath, out);
      continue;
    }
    if (fullPath.endsWith('.css')) out.push(fullPath);
  }
  return out;
}

function lineNumberAt(content, index) {
  return content.slice(0, index).split('\n').length;
}

function parseRuleBlocks(content) {
  const map = new Map();
  const blockRegex = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = blockRegex.exec(content)) !== null) {
    const selectors = m[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const body = m[2];
    for (const selector of selectors) map.set(selector, body);
  }
  return map;
}

function getColorDecl(body) {
  const match = body.match(/color\s*:\s*([^;]+);/);
  return match ? match[1].trim() : null;
}

function isInteractiveSelector(selector) {
  if (!selector.startsWith('.')) return false;
  if (selector.includes(' ') || selector.includes('>') || selector.includes('+') || selector.includes('~')) return false;
  if (selector.includes(':hover') || selector.includes(':focus') || selector.includes(':active') || selector.includes(':disabled')) return false;
  if (/active$/i.test(selector)) return false;
  return /(link|cta|action|button)/i.test(selector);
}

const files = collectCssFiles(srcDir);
const violations = [];

for (const filePath of files) {
  const content = readFileSync(filePath, 'utf8');
  for (const rule of bannedPatterns) {
    for (const match of content.matchAll(rule.regex)) {
      const idx = match.index ?? 0;
      violations.push({
        file: path.relative(projectRoot, filePath).replaceAll('\\', '/'),
        line: lineNumberAt(content, idx),
        label: rule.label,
        snippet: match[0],
      });
    }
  }

  const ruleMap = parseRuleBlocks(content);
  for (const [selector, body] of ruleMap.entries()) {
    if (!isInteractiveSelector(selector)) continue;
    const baseColor = getColorDecl(body);
    if (!baseColor) continue;
    const pair = expectedHoverPairs.find((p) => p.base === baseColor);
    if (!pair) continue;

    const hoverSelector = `${selector}:hover`;
    const hoverBody = ruleMap.get(hoverSelector);
    const selectorIdx = content.indexOf(selector);

    if (!hoverBody) {
      violations.push({
        file: path.relative(projectRoot, filePath).replaceAll('\\', '/'),
        line: lineNumberAt(content, Math.max(0, selectorIdx)),
        label: `Missing hover color pair for ${selector}`,
        snippet: `Expected ${hoverSelector} with color ${pair.hover}`,
      });
      continue;
    }

    const hoverColor = getColorDecl(hoverBody);
    if (hoverColor !== pair.hover) {
      const hoverIdx = content.indexOf(hoverSelector);
      violations.push({
        file: path.relative(projectRoot, filePath).replaceAll('\\', '/'),
        line: lineNumberAt(content, Math.max(0, hoverIdx)),
        label: `Invalid hover color pair for ${selector}`,
        snippet: `Found ${hoverColor ?? 'no color'}; expected ${pair.hover}`,
      });
    }
  }
}

if (violations.length) {
  console.error('Token usage policy check failed:\n');
  for (const v of violations) {
    console.error(`- ${v.file}:${v.line} — ${v.label}`);
    console.error(`  ${v.snippet}`);
  }
  process.exit(1);
}

console.log(`Token usage policy check passed (${files.length} CSS files scanned).`);
