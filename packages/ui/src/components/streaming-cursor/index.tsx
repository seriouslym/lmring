import { cn } from '../../utils';

interface StreamingCursorProps {
  className?: string;
}

function StreamingCursor({ className }: StreamingCursorProps) {
  return (
    <span
      className={cn(
        'inline-block w-[2px] h-[1em] bg-current animate-blink ml-0.5 align-middle',
        className,
      )}
      aria-hidden="true"
    />
  );
}

export { StreamingCursor };
export type { StreamingCursorProps };
