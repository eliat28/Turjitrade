interface CandlestickProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

export const Candlestick = ({ x = 0, y = 0, width = 0, height = 0, payload }: CandlestickProps) => {
  if (!payload) return null;

  const { open, high, low, close } = payload;
  const isGrowing = close > open;
  const color = isGrowing ? '#10B981' : '#EF4444';
  const ratio = Math.abs(height / (high - low) || 0);

  return (
    <g>
      {/* Wick (High-Low line) */}
      <line
        x1={x + width / 2}
        y1={y - (high - Math.max(open, close)) * ratio}
        x2={x + width / 2}
        y2={y + height + (Math.min(open, close) - low) * ratio}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body (Open-Close rectangle) */}
      <rect
        x={x}
        y={isGrowing ? y : y}
        width={width}
        height={Math.abs(height) || 1}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};
