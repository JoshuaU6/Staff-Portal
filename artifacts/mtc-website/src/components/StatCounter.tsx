import { useRef, useState, useEffect } from 'react';
import { useCountUp } from '@/hooks/use-count-up';

interface StatCounterProps {
  value: string;
  label: string;
}

/**
 * Parses strings like "6+", "4", "10,000+", "12" into
 * { target: number, prefix: string, suffix: string }
 */
function parseStat(value: string) {
  const suffix = value.endsWith('+') ? '+' : '';
  const raw = value.replace(/[^0-9]/g, '');
  const target = parseInt(raw, 10);

  // Re-apply thousands separator for display
  const format = (n: number) =>
    target >= 1000
      ? n.toLocaleString('en-US')
      : n.toString();

  return { target, suffix, format };
}

export function StatCounter({ value, label }: StatCounterProps) {
  const { target, suffix, format } = parseStat(value);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCountUp(target, 2000, started);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center py-4 md:py-0">
      <div className="text-4xl md:text-5xl font-serif text-mtc-red font-bold mb-2 tabular-nums">
        {format(count)}{suffix}
      </div>
      <div className="text-sm text-mtc-charcoal uppercase tracking-widest font-medium">{label}</div>
    </div>
  );
}
