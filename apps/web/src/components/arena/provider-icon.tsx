'use client';

import { Anthropic, DeepSeek, Google, Meta, Mistral, OpenAI, Qwen, XAI } from '@lobehub/icons';
import type { ComponentType } from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

const ICON_MAP: Record<string, ComponentType<IconProps>> = {
  openai: OpenAI,
  anthropic: Anthropic,
  google: Google,
  meta: Meta,
  mistral: Mistral,
  deepseek: DeepSeek,
  xai: XAI,
  qwen: Qwen,
};

interface ProviderIconProps {
  providerId: string;
  size?: number;
  className?: string;
}

export function ProviderIcon({ providerId, size = 16, className }: ProviderIconProps) {
  const IconComponent = ICON_MAP[providerId.toLowerCase()];

  if (!IconComponent) {
    // Fallback for unknown providers
    return (
      <span className={className} style={{ fontSize: size }}>
        🤖
      </span>
    );
  }

  return <IconComponent size={size} className={className} />;
}
