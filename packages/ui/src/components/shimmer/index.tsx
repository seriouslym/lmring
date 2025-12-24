import type { ComponentProps, CSSProperties } from 'react';

import { cn } from '../../utils';

interface ShimmerProps extends ComponentProps<'div'> {
  duration?: number;
}

function Shimmer({ duration = 2, className, children, ...props }: ShimmerProps) {
  return (
    <div
      className={cn(
        'relative inline-block overflow-hidden bg-clip-text text-transparent! bg-no-repeat bg-[linear-gradient(110deg,#a1a1aa_45%,#f4f4f5_55%,#a1a1aa)] bg-[length:250%_100%] animate-shimmer',
        className,
      )}
      style={
        {
          '--shimmer-duration': `${duration}s`,
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}

export { Shimmer };
export type { ShimmerProps };
