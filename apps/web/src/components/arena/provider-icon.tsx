'use client';

import {
  Ai21,
  AiMass,
  AlibabaCloud,
  Anthropic,
  Aws,
  Azure,
  Baichuan,
  Bfl,
  Cerebras,
  Cloudflare,
  Cohere,
  DeepSeek,
  Fireworks,
  GiteeAI,
  Github,
  Google,
  Groq,
  Higress,
  HuggingFace,
  Hunyuan,
  Infinigence,
  InternLM,
  Jina,
  LmStudio,
  Meta,
  Minimax,
  Mistral,
  ModelScope,
  Moonshot,
  Nebius,
  Novita,
  Nvidia,
  Ollama,
  OpenAI,
  OpenRouter,
  Perplexity,
  PPIO,
  Qiniu,
  Replicate,
  SambaNova,
  Search1API,
  SenseNova,
  SiliconCloud,
  Spark,
  Stepfun,
  TencentCloud,
  Together,
  Upstage,
  VertexAI,
  Vllm,
  Volcengine,
  Wenxin,
  XAI,
  Xinference,
  Yi,
  Zhipu,
} from '@lobehub/icons';

// biome-ignore lint/suspicious/noExplicitAny: @lobehub/icons CompoundedIcon types
const ICON_MAP: Record<string, any> = {
  openai: OpenAI,
  anthropic: Anthropic,
  azure: Azure,
  vertex: VertexAI,
  xai: XAI,
  deepseek: DeepSeek,
  mistral: Mistral,
  openrouter: OpenRouter,
  silicon: SiliconCloud,
  dashscope: AlibabaCloud,
  zhipu: Zhipu,
  baichuan: Baichuan,
  moonshot: Moonshot,
  yi: Yi,
  minimax: Minimax,
  step: Stepfun,
  ollama: Ollama,
  bedrock: Aws,
  google: Google,
  groq: Groq,
  perplexity: Perplexity,
  cohere: Cohere,
  togetherai: Together,
  fireworksai: Fireworks,
  sambanova: SambaNova,
  github: Github,
  huggingface: HuggingFace,
  nvidia: Nvidia,
  cerebras: Cerebras,
  cloudflare: Cloudflare,
  nebius: Nebius,
  upstage: Upstage,
  novita: Novita,
  ai21: Ai21,
  bfl: Bfl,
  infiniai: Infinigence,
  jina: Jina,
  search1api: Search1API,
  replicate: Replicate,
  hunyuan: Hunyuan,
  spark: Spark,
  volcengine: Volcengine,
  wenxin: Wenxin,
  sensenova: SenseNova,
  internlm: InternLM,
  giteeai: GiteeAI,
  modelscope: ModelScope,
  qiniu: Qiniu,
  ppio: PPIO,
  tencentcloud: TencentCloud,
  lmstudio: LmStudio,
  vllm: Vllm,
  xinference: Xinference,
  higress: Higress,
  meta: Meta,
  qwen: AlibabaCloud,
  taichu: AiMass,
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
