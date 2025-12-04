'use client';

import {
  AlibabaCloud,
  Anthropic,
  Aws,
  Azure,
  Baichuan,
  DeepSeek,
  Google,
  Meta,
  Minimax,
  Mistral,
  Moonshot,
  Ollama,
  OpenAI,
  OpenRouter,
  SiliconCloud,
  Stepfun,
  XAI,
  Yi,
  Zhipu,
} from '@lobehub/icons';

// biome-ignore lint/suspicious/noExplicitAny: @lobehub/icons CompoundedIcon types
const ICON_MAP: Record<string, any> = {
  openai: OpenAI,
  anthropic: Anthropic,
  azure: Azure,
  vertex: Google,
  google: Google,
  meta: Meta,
  mistral: Mistral,
  deepseek: DeepSeek,
  xai: XAI,
  openrouter: OpenRouter,
  silicon: SiliconCloud,
  dashscope: AlibabaCloud,
  qwen: AlibabaCloud,
  zhipu: Zhipu,
  baichuan: Baichuan,
  moonshot: Moonshot,
  yi: Yi,
  minimax: Minimax,
  step: Stepfun,
  ollama: Ollama,
  bedrock: Aws,
};

interface ProviderIconProps {
  providerId: string;
  size?: number;
  className?: string;
  type?: 'normal' | 'avatar' | 'combine';
}

export function ProviderIcon({
  providerId,
  size = 16,
  className,
  type = 'avatar',
}: ProviderIconProps) {
  const IconEntry = ICON_MAP[providerId.toLowerCase()];

  if (!IconEntry) {
    return (
      <span className={className} style={{ fontSize: size }}>
        🤖
      </span>
    );
  }

  if (type === 'combine' && IconEntry.Combine) {
    return <IconEntry.Combine size={size} className={className} />;
  }

  if (type === 'avatar' && IconEntry.Avatar) {
    return <IconEntry.Avatar size={size} className={className} />;
  }

  const IconComponent = IconEntry.Avatar || IconEntry;
  return <IconComponent size={size} className={className} />;
}
