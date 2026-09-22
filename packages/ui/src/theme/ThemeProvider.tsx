import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/** 사용자가 고를 수 있는 값. 'system' 은 OS 설정을 따른다. */
export type ThemePreference = 'light' | 'dark' | 'system';
/** 실제로 적용된 테마. */
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
  /** `<ThemeProvider presets>` 로 넘긴 토큰 프리셋. */
  presets: Readonly<Record<string, string>>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const MEDIA_QUERY = '(prefers-color-scheme: dark)';

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}

function readStored(key: string): ThemePreference | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(key);
    return value === 'light' || value === 'dark' || value === 'system' ? value : null;
  } catch {
    // 시크릿 모드나 저장소 차단 환경 — 저장 없이 동작만 하면 된다.
    return null;
  }
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** 저장된 값이 없을 때 쓸 초기 테마. 기본 'system'. */
  defaultTheme?: ThemePreference;
  /** localStorage 키. null 이면 저장하지 않는다. */
  storageKey?: string | null;
  /**
   * 토큰 프리셋. `{ 'power-convention': 'ko-legacy' }` 처럼 주면
   * `data-enitt-power-convention="ko-legacy"` 속성이 붙는다.
   *
   * 프리셋 자체는 토큰 패키지(`src/presets.json`)가 정의한다 — 여기서는
   * 어떤 프리셋이 있는지 알 필요가 없고, 속성만 전달한다.
   */
  presets?: Record<string, string>;
  /**
   * 테마 속성을 붙일 요소. 기본은 `<html>`.
   * 페이지 일부만 다른 테마로 렌더링하려면 'element' 로 바꾼다.
   */
  target?: 'document' | 'element';
}

/**
 * `data-theme` 속성을 관리한다. CSS 는 @enitt/tokens 의 tokens.css 가 담당하므로
 * 이 컴포넌트는 속성만 바꾸고 스타일에는 관여하지 않는다.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'enitt-theme',
  presets,
  target = 'document',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemePreference>(
    () => (storageKey ? readStored(storageKey) : null) ?? defaultTheme,
  );
  const [systemResolved, setSystemResolved] = useState<ResolvedTheme>(systemTheme);

  // OS 설정 변화 추적 — theme 이 'system' 이 아닐 때도 구독을 유지해야
  // 사용자가 'system' 으로 되돌렸을 때 즉시 맞는 값이 나온다.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(MEDIA_QUERY);
    const onChange = (event: MediaQueryListEvent) =>
      setSystemResolved(event.matches ? 'dark' : 'light');
    mql.addEventListener('change', onChange);
    setSystemResolved(mql.matches ? 'dark' : 'light');
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemResolved : theme;

  const presetEntries = useMemo(() => Object.entries(presets ?? {}), [presets]);

  useEffect(() => {
    if (target !== 'document' || typeof document === 'undefined') return;
    const root = document.documentElement;
    // 'system' 일 때는 속성을 지워 tokens.css 의 prefers-color-scheme 블록에 맡긴다.
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);

    for (const [name, value] of presetEntries) root.setAttribute(`data-enitt-${name}`, value);
    return () => {
      for (const [name] of presetEntries) root.removeAttribute(`data-enitt-${name}`);
    };
  }, [theme, presetEntries, target]);

  const setTheme = useCallback(
    (next: ThemePreference) => {
      setThemeState(next);
      if (!storageKey) return;
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // 저장 실패는 무시한다 — 현재 세션 동작에는 영향이 없다.
      }
    },
    [storageKey],
  );

  const toggleTheme = useCallback(
    () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
    [resolvedTheme, setTheme],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme, presets: presets ?? {} }),
    [theme, resolvedTheme, setTheme, toggleTheme, presets],
  );

  if (target === 'element') {
    return (
      <ThemeContext.Provider value={value}>
        <div
          className="enitt-app"
          data-theme={theme === 'system' ? resolvedTheme : theme}
          {...Object.fromEntries(presetEntries.map(([name, v]) => [`data-enitt-${name}`, v]))}
        >
          {children}
        </div>
      </ThemeContext.Provider>
    );
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** ThemeProvider 아래에서 현재 테마를 읽고 바꾼다. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme 은 <ThemeProvider> 안에서만 쓸 수 있습니다.');
  }
  return context;
}
