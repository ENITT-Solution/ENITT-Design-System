/**
 * @enitt/tokens — ENITT 디자인 시스템의 단일 토큰 소스
 *
 * 사용법:
 *   import '@enitt/tokens/tokens.css';          // CSS 커스텀 프로퍼티 주입
 *   import { tokens, dimensions } from '@enitt/tokens';
 */
export {
  tokens,
  dimensions,
  palette,
  themeValues,
  chartSeriesTokens,
  type ThemeName,
  type CssVarName,
} from './generated/tokens.js';
