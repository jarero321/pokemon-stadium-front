interface PlatformProps {
  variant: 'player' | 'opponent';
  typeName?: string;
  width?: number;
}

export function Platform({ variant, typeName, width = 180 }: PlatformProps) {
  const glowColor = typeName
    ? `var(--color-type-${typeName.toLowerCase()})`
    : variant === 'player'
      ? 'var(--color-neon-player)'
      : 'var(--color-neon-opponent)';

  return (
    <div
      className="platform relative flex items-center justify-center shrink-0"
      style={
        {
          width: width * 1.3,
          height: width * 0.22,
          '--platform-glow': glowColor,
        } as React.CSSProperties
      }
    >
      <div className="platform__ellipse" />
      <div className="platform__glow" />
    </div>
  );
}
