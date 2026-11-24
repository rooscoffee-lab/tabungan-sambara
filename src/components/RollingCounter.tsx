import { useEffect, useRef, useState } from 'react';
import { formatRupiah } from '../utils/ledger';

interface RollingCounterProps {
  value: number;
  className?: string;
}

export function RollingCounter({ value, className = '' }: RollingCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const currentRef = useRef(value);

  useEffect(() => {
    const startValue = currentRef.current;
    const endValue = value;
    if (startValue === endValue) return;

    const duration = 650;
    const startTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(startValue + (endValue - startValue) * eased);
      currentRef.current = next;
      setDisplayValue(next);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        currentRef.current = endValue;
        setDisplayValue(endValue);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return (
    <span className={`tabular-nums ${className}`} data-testid="rolling-balance">
      {formatRupiah(displayValue)}
    </span>
  );
}
