/** 조건부 클래스 이름 결합. clsx 의 최소 구현 — 의존성을 늘리지 않으려고 직접 둔다. */
export type ClassValue =
  string | number | null | undefined | false | ClassValue[] | Record<string, unknown>;

export function cx(...values: ClassValue[]): string {
  const out: string[] = [];
  const push = (value: ClassValue): void => {
    if (!value) return;
    if (typeof value === 'string' || typeof value === 'number') {
      out.push(String(value));
    } else if (Array.isArray(value)) {
      for (const v of value) push(v);
    } else if (typeof value === 'object') {
      for (const [key, active] of Object.entries(value)) if (active) out.push(key);
    }
  };
  for (const value of values) push(value);
  return out.join(' ');
}
