import { useEffect, useState } from 'react';

const compute = (target) => {
  if (!target) return null;
  const end = new Date(target).getTime();
  if (Number.isNaN(end)) return null;
  const diff = end - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isLive: false,
  };
};

/** Ticks once per second toward the fest start date. */
export function useCountdown(targetDate) {
  const [value, setValue] = useState(() => compute(targetDate));

  useEffect(() => {
    setValue(compute(targetDate));
    if (!targetDate) return undefined;
    const id = setInterval(() => setValue(compute(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return value;
}
