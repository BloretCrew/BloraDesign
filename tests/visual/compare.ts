// 比对工具：颜色按「叠在白底上」的效果比较（框架用 color-mix 调出的投影色与参考页的 rgba 等效），数值允许 1px 误差
type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

function rgba(text: string): [number, number, number, number] | null {
  let m = text.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/);
  if (m) return [+m[1]!, +m[2]!, +m[3]!, m[4] === undefined ? 1 : +m[4]];
  m = text.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);
  if (m) return [+m[1]! * 255, +m[2]! * 255, +m[3]! * 255, m[4] === undefined ? 1 : +m[4]];
  return null;
}

/** 把字符串里的所有颜色换成叠在白底上的效果，便于比较 */
function flatten(text: string): string {
  return text.replace(/(rgba?\([^)]*\)|color\(srgb[^)]*\))/g, (c) => {
    const v = rgba(c);
    if (!v) return c;
    const [r, g, b, a] = v;
    const over = (x: number) => Math.round(255 - (255 - x) * a);
    return `rgb#${over(r)},${over(g)},${over(b)}`;
  });
}

function closeText(a: string, b: string): boolean {
  if (a === b) return true;
  const fa = flatten(a);
  const fb = flatten(b);
  if (fa === fb) return true;
  // 颜色允许 1 个色阶的取整误差，数值允许 1px
  const NUM = /\d+(?:\.\d+)?/g;
  const na = fa.match(NUM) ?? [];
  const nb = fb.match(NUM) ?? [];
  if (na.length !== nb.length || fa.replace(NUM, '#') !== fb.replace(NUM, '#')) return false;
  return na.every((x, i) => Math.abs(+x - +nb[i]!) <= 1);
}

export function diff(ref: Json, ours: Json, path = ''): string[] {
  if (ref && ours && typeof ref === 'object' && typeof ours === 'object') {
    const keys = new Set([...Object.keys(ref), ...Object.keys(ours)]);
    return [...keys].flatMap((k) =>
      diff(
        (ref as Record<string, Json>)[k] ?? null,
        (ours as Record<string, Json>)[k] ?? null,
        `${path}.${k}`,
      ),
    );
  }
  if (typeof ref === 'number' && typeof ours === 'number') {
    return Math.abs(ref - ours) <= 1 ? [] : [`${path}: 参考 ${ref}，框架 ${ours}`];
  }
  if (typeof ref === 'string' && typeof ours === 'string') {
    return closeText(ref, ours) ? [] : [`${path}: 参考 ${ref}，框架 ${ours}`];
  }
  return ref === ours ? [] : [`${path}: 参考 ${JSON.stringify(ref)}，框架 ${JSON.stringify(ours)}`];
}
