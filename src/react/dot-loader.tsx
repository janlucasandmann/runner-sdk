import { CSSProperties, useEffect, useMemo, useState } from "react";

interface DotLoaderProps {
  dotCount?: 4 | 9;
  dotSize?: number;
  gap?: number;
  speed?: number;
  color?: string;
  className?: string;
}

export function DotLoader({
  dotCount = 9,
  dotSize = 4,
  gap = 3,
  speed = 800,
  color = "rgba(255, 255, 255, 1)",
  className,
}: DotLoaderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const gridSize = dotCount === 4 ? 2 : 3;
  const pattern = useMemo(
    () =>
      dotCount === 4
        ? [1, 0, 2, 3, -1, -1, -1]
        : [2, 1, 0, 3, 6, 7, 8, 5, 4, -1, -1, -1, -1],
    [dotCount]
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % pattern.length);
    }, speed / pattern.length);
    return () => window.clearInterval(interval);
  }, [pattern.length, speed]);

  function getDotOpacity(dotIndex: number): number {
    const currentPatternValue = pattern[activeIndex];
    if (currentPatternValue === -1) return 0.1;
    const patternPosition = pattern.indexOf(dotIndex);
    if (patternPosition === -1) return 0.1;
    const distance = (activeIndex - patternPosition + pattern.length) % pattern.length;
    if (distance === 0) return 1;
    if (distance === 1) return 0.5;
    if (distance === 2) return 0.25;
    return 0.1;
  }

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridSize}, ${dotSize}px)`,
    gap: `${gap}px`,
  };

  return (
    <span className={className} style={gridStyle}>
      {Array.from({ length: dotCount }).map((_, index) => (
        <span
          key={index}
          style={{
            display: "block",
            width: dotSize,
            height: dotSize,
            borderRadius: "999px",
            backgroundColor: color,
            opacity: getDotOpacity(index),
            transition: "opacity 200ms ease-out",
          }}
        />
      ))}
    </span>
  );
}
