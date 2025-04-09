import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface CounterProps {
  value: number;
  className?: string;
  formatter?: (value: number) => string;
}

export function Counter({ value, className, formatter }: CounterProps) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const observed = useRef(false);

  const formatValue = (val: number) => {
    if (formatter) return formatter(val);
    return new Intl.NumberFormat().format(val);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !observed.current) {
          setInView(true);
          observed.current = true;
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      if (countRef.current) {
        observer.unobserve(countRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const increment = Math.max(1, Math.ceil(value / 100));
    const duration = 2000; // 2 seconds
    const step = 16; // ~60fps
    const totalSteps = duration / step;
    const incrementPerStep = value / totalSteps;

    const timer = setInterval(() => {
      start = Math.min(start + incrementPerStep, value);
      setCount(Math.round(start));
      
      if (start >= value) {
        clearInterval(timer);
      }
    }, step);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <div
      ref={countRef}
      className={cn("text-4xl font-bold", className)}
    >
      {formatValue(count)}
    </div>
  );
}
