'use client';

interface CountdownRingProps {
  remaining: number;
  progress: number;
  size?: number;
  urgent?: boolean;
}

export function CountdownRing({
  remaining,
  progress,
  size = 48,
}: CountdownRingProps) {
  const r = (size - 4) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - progress);

  const color =
    remaining <= 3
      ? 'text-rose-400'
      : remaining <= 7
        ? 'text-amber-400'
        : 'text-cyan-400';
  const bgColor = 'stroke-[#1e2940]';

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className={bgColor}
          strokeWidth={3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={`${color} transition-all duration-1000 ease-linear`}
        />
      </svg>
      <span
        className={`absolute text-xs font-black tabular-nums ${color} ${
          remaining <= 3 ? 'animate-pulse' : ''
        }`}
      >
        {remaining}
      </span>
    </div>
  );
}
