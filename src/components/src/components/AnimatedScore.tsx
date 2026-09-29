import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

interface Props {
  value: number;
  className?: string;
}

/**
 * Tweens between numeric values so score changes roll instead of snap.
 */
export default function AnimatedScore({ value, className }: Props) {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    const controls = animate(displayRef.current, value, {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        const rounded = Math.round(v);
        displayRef.current = rounded;
        setDisplay(rounded);
      },
    });
    return () => controls.stop();
  }, [value]);

  return <span className={className}>{display}</span>;
}
