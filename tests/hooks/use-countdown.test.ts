import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── CountdownSimulator — replicates useCountdown logic without React ─

class CountdownSimulator {
  remaining: number;
  active: boolean;
  private interval: ReturnType<typeof setInterval> | null = null;
  private onExpire: () => void;
  private seconds: number;

  constructor(seconds: number, onExpire: () => void, autoStart = false) {
    this.seconds = seconds;
    this.remaining = seconds;
    this.active = autoStart;
    this.onExpire = onExpire;
    if (autoStart) this.start();
  }

  start() {
    this.remaining = this.seconds;
    this.active = true;
    this.interval = setInterval(() => {
      if (this.remaining <= 1) {
        this.active = false;
        this.remaining = 0;
        this.onExpire();
        if (this.interval) clearInterval(this.interval);
        return;
      }
      this.remaining--;
    }, 1000);
  }

  stop() {
    this.active = false;
    this.remaining = this.seconds;
    if (this.interval) clearInterval(this.interval);
  }

  get progress() {
    return this.remaining / this.seconds;
  }
}

// ── Tests ───────────────────────────────────────────────────────────

describe('useCountdown logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initial state: remaining equals seconds and not active', () => {
    const countdown = new CountdownSimulator(10, vi.fn());

    expect(countdown.remaining).toBe(10);
    expect(countdown.active).toBe(false);
  });

  it('autoStart: starts immediately', () => {
    const countdown = new CountdownSimulator(5, vi.fn(), true);

    expect(countdown.active).toBe(true);
    expect(countdown.remaining).toBe(5);
  });

  it('start resets remaining and activates', () => {
    const countdown = new CountdownSimulator(10, vi.fn());

    countdown.start();

    expect(countdown.active).toBe(true);
    expect(countdown.remaining).toBe(10);
  });

  it('decrements every second', () => {
    const countdown = new CountdownSimulator(10, vi.fn());
    countdown.start();

    vi.advanceTimersByTime(1000);
    expect(countdown.remaining).toBe(9);

    vi.advanceTimersByTime(1000);
    expect(countdown.remaining).toBe(8);

    vi.advanceTimersByTime(3000);
    expect(countdown.remaining).toBe(5);
  });

  it('calls onExpire when reaching 0', () => {
    const onExpire = vi.fn();
    const countdown = new CountdownSimulator(3, onExpire);
    countdown.start();

    vi.advanceTimersByTime(3000);

    expect(onExpire).toHaveBeenCalledOnce();
    expect(countdown.remaining).toBe(0);
  });

  it('sets active to false after expiry', () => {
    const countdown = new CountdownSimulator(2, vi.fn());
    countdown.start();

    vi.advanceTimersByTime(2000);

    expect(countdown.active).toBe(false);
  });

  it('stop resets remaining and deactivates', () => {
    const countdown = new CountdownSimulator(10, vi.fn());
    countdown.start();

    vi.advanceTimersByTime(3000);
    countdown.stop();

    expect(countdown.active).toBe(false);
    expect(countdown.remaining).toBe(10);
  });

  it('progress is remaining/seconds ratio', () => {
    const countdown = new CountdownSimulator(10, vi.fn());
    countdown.start();

    expect(countdown.progress).toBe(1);

    vi.advanceTimersByTime(5000);
    expect(countdown.progress).toBe(0.5);

    vi.advanceTimersByTime(5000);
    expect(countdown.progress).toBe(0);
  });
});
