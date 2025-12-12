import { cn } from '@lmring/ui';
import type { ComponentProps } from 'react';

interface ShimmerProps extends ComponentProps<'div'> {
  duration?: number;
}

export function Shimmer({ duration = 2, className, children, ...props }: ShimmerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-clip-text text-transparent bg-[linear-gradient(110deg,#a1a1aa,45%,#f4f4f5,55%,#a1a1aa)] bg-[length:250%_100%] animate-shimmer',
        className,
      )}
      style={{
        animationDuration: `${duration}s`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
