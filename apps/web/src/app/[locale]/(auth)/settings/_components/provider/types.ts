import type { IconType } from '@lobehub/icons';
import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

export interface Provider {
  id: string;
  name: string;
  connected: boolean;
  Icon: IconType | LucideIcon | ComponentType<{ size?: number; className?: string }> | null;
  description: string;
  type: 'enabled' | 'disabled';
  tags: string[];
}
