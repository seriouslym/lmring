'use client';

import { Button, cn, Textarea } from '@lmring/ui';
import { ArrowUp, Square } from 'lucide-react';
import * as React from 'react';

interface PromptInputContextValue {
  value: string;
  setValue: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isLoading: boolean;
  disabled: boolean;
  isSubmitting: boolean;
}

const PromptInputContext = React.createContext<PromptInputContextValue | undefined>(undefined);

function usePromptInput() {
  const context = React.useContext(PromptInputContext);
  if (!context) {
    throw new Error('usePromptInput must be used within a PromptInput');
  }
  return context;
}

const SUBMIT_DEBOUNCE_MS = 500;

interface PromptInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSubmit'> {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isLoading = false,
  disabled = false,
  className,
  children,
  ...props
}: PromptInputProps) {
  const lastSubmitTimeRef = React.useRef<number>(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(() => {
    if (!value.trim() || isLoading || disabled || isSubmitting) return;

    const now = Date.now();
    if (now - lastSubmitTimeRef.current < SUBMIT_DEBOUNCE_MS) {
      return;
    }

    lastSubmitTimeRef.current = now;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
    }, SUBMIT_DEBOUNCE_MS);

    onSubmit();
  }, [value, isLoading, disabled, isSubmitting, onSubmit]);

  return (
    <PromptInputContext.Provider
      value={{
        value,
        setValue: onChange,
        onSubmit: handleSubmit,
        onStop,
        isLoading,
        disabled,
        isSubmitting,
      }}
    >
      <div
        className={cn(
          'relative flex flex-col w-full overflow-hidden rounded-xl border bg-background shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </PromptInputContext.Provider>
  );
}

export const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<typeof Textarea> & {
    maxHeight?: number;
  }
>(({ className, onKeyDown, maxHeight = 200, ...props }, ref) => {
  const { value, setValue, onSubmit, isLoading, disabled, isSubmitting } = usePromptInput();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = React.useState(false);

  React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !isComposing &&
      !e.nativeEvent.isComposing &&
      !isSubmitting
    ) {
      e.preventDefault();
      onSubmit();
    }
    onKeyDown?.(e);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: value changes should trigger height recalculation
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      textareaRef.current.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [value, maxHeight]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={() => setIsComposing(false)}
      disabled={isLoading || disabled}
      className={cn(
        'min-h-[60px] w-full resize-none border-0 bg-transparent px-4 py-3 text-sm shadow-none focus-visible:ring-0',
        className,
      )}
      {...props}
    />
  );
});
PromptInputTextarea.displayName = 'PromptInputTextarea';

export function PromptInputFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between px-3 pb-3', className)} {...props}>
      {children}
    </div>
  );
}

export function PromptInputActions({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {children}
    </div>
  );
}

export function PromptInputSubmit({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { value, onSubmit, onStop, isLoading, disabled, isSubmitting } = usePromptInput();

  if (isLoading && onStop) {
    return (
      <Button
        size="icon"
        variant="destructive"
        onClick={onStop}
        className={cn('h-8 w-8 rounded-full transition-all', className)}
        {...props}
      >
        <Square className="h-3.5 w-3.5" />
        <span className="sr-only">Stop</span>
      </Button>
    );
  }

  const isDisabled = !value.trim() || isLoading || disabled || isSubmitting;

  return (
    <Button
      size="icon"
      onClick={onSubmit}
      disabled={isDisabled}
      className={cn(
        'h-8 w-8 rounded-full transition-all',
        isDisabled ? 'opacity-50' : 'opacity-100',
        className,
      )}
      {...props}
    >
      {children || <ArrowUp className="h-4 w-4" />}
      <span className="sr-only">Send</span>
    </Button>
  );
}
