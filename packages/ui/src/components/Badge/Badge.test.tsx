import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge.js';
import { StatusIndicator } from '../StatusIndicator/StatusIndicator.js';

describe('Badge', () => {
  it('심각도만 주면 한국어 표시명이 들어간다 — 색만으로 등급을 말하지 않는다', () => {
    render(<Badge severity="critical" />);
    expect(screen.getByText('위험')).toBeInTheDocument();
  });

  it('등급 아이콘이 함께 나간다', () => {
    const { container } = render(<Badge severity="warning" />);
    expect(container.querySelector('.enitt-badge__icon')).toBeInTheDocument();
  });

  it('hideIcon 으로 아이콘을 뺄 수 있다 (같은 열에 이미 아이콘이 있을 때)', () => {
    const { container } = render(<Badge severity="warning" hideIcon />);
    expect(container.querySelector('.enitt-badge__icon')).toBeNull();
  });

  it('children 이 심각도 표시명을 덮어쓴다', () => {
    render(<Badge severity="normal">운전 중</Badge>);
    expect(screen.getByText('운전 중')).toBeInTheDocument();
    expect(screen.queryByText('정상')).toBeNull();
  });
});

describe('StatusIndicator', () => {
  it('점만 남겨도 스크린리더용 문구는 유지된다', () => {
    render(<StatusIndicator severity="critical" dotOnly />);
    expect(screen.getByRole('status')).toHaveTextContent('위험, 즉시 조치 필요');
  });

  it('라벨을 직접 줄 수 있다', () => {
    render(<StatusIndicator severity="normal">통신 정상</StatusIndicator>);
    expect(screen.getByText('통신 정상')).toBeInTheDocument();
  });
});
