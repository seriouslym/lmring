import { COMPATIBLE_PROVIDER_METADATA, PROVIDER_ENDPOINTS } from '@lmring/model-depot/providers';
import type { ProviderConfig } from '../../types/provider';

export const DOMESTIC_PROVIDERS: ProviderConfig[] = COMPATIBLE_PROVIDER_METADATA.map((metadata) => {
  const endpoint = PROVIDER_ENDPOINTS[metadata.id];

  return {
    id: metadata.id,
    name: metadata.name,
    type: metadata.type,
    compatibleConfig: endpoint,
    supportsStreaming: metadata.supportsStreaming,
    supportsStructuredOutput: metadata.supportsStructuredOutput,
    supportsVision: metadata.supportsVision,
    supportsFunctionCalling: metadata.supportsFunctionCalling,
  };
});
