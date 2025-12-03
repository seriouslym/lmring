'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Separator,
  Switch,
} from '@lmring/ui';
import { Anthropic, Aws, Azure, DeepSeek, Google, Moonshot, Ollama, OpenAI } from '@lobehub/icons';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BotIcon,
  BoxIcon,
  ChevronRightIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  GithubIcon,
  GlobeIcon,
  HelpCircleIcon,
  InfoIcon,
  LifeBuoyIcon,
  MailIcon,
  Settings2Icon,
  TwitterIcon,
  UsersIcon,
} from 'lucide-react';
import * as React from 'react';
import { ProviderLayout } from './_components/provider/ProviderLayout';
import type { Provider } from './_components/provider/types';

// Mock Data for Providers
const defaultProviders: Provider[] = [
  {
    id: 'azure',
    name: 'Azure AI',
    connected: true,
    Icon: Azure,
    description:
      'Azure offers a variety of advanced AI models, including GPT-3.5 and the latest GPT-4 series.',
    type: 'enabled',
    tags: [],
  },
  {
    id: 'comfyui',
    name: 'ComfyUI',
    connected: true,
    Icon: null, // Placeholder
    description: 'A powerful open-source workflow engine for generating images, videos, and audio.',
    type: 'enabled',
    tags: [],
  },
  {
    id: 'fal',
    name: 'fal',
    connected: true,
    Icon: null, // Placeholder
    description: 'Generative Media Platform for Developers',
    type: 'enabled',
    tags: [],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    connected: false,
    Icon: OpenAI,
    description:
      'OpenAI is a global leader in artificial intelligence research, with models like the GPT series.',
    type: 'disabled',
    tags: ['OpenAI'],
  },
  {
    id: 'azure-openai',
    name: 'Microsoft Azure',
    connected: false,
    Icon: Azure,
    description:
      'Azure offers a variety of advanced AI models, including GPT-3.5 and the latest GPT-4 series.',
    type: 'disabled',
    tags: ['Microsoft Azure', 'OpenAI'],
  },
  {
    id: 'ollama',
    name: 'Ollama',
    connected: false,
    Icon: Ollama,
    description:
      'Ollama provides models that cover a wide range of fields, including code generation.',
    type: 'disabled',
    tags: ['Ollama'],
  },
  {
    id: 'ollama-cloud',
    name: 'Ollama Cloud',
    connected: false,
    Icon: Ollama,
    description:
      'Ollama Cloud offers officially hosted inference services, providing out-of-the-box access.',
    type: 'disabled',
    tags: ['Ollama Cloud'],
  },
  {
    id: 'vllm',
    name: 'vLLM',
    connected: false,
    Icon: null, // Placeholder
    description: 'vLLM is a fast and easy-to-use library for LLM inference and serving.',
    type: 'disabled',
    tags: ['LLM'],
  },
  {
    id: 'xinference',
    name: 'Xinference',
    connected: false,
    Icon: null, // Placeholder
    description:
      'Xorbits Inference (Xinference) is an open-source platform designed to simplify the...',
    type: 'disabled',
    tags: ['Xinference'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    connected: false,
    Icon: Anthropic,
    description:
      'Anthropic is a company focused on AI research and development, offering a range of...',
    type: 'disabled',
    tags: ['ANTHROPIC', 'Claude'],
  },
  {
    id: 'bedrock',
    name: 'Amazon Bedrock',
    connected: false,
    Icon: Aws,
    description:
      'Bedrock is a service provided by Amazon AWS, focusing on delivering advanced AI languag...',
    type: 'disabled',
    tags: ['aws', 'Amazon Bedrock'],
  },
  {
    id: 'google',
    name: 'Google',
    connected: false,
    Icon: Google,
    description: 'Google AI offers a wide range of AI services and models.',
    type: 'disabled',
    tags: ['Google'],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    connected: false,
    Icon: DeepSeek,
    description: 'DeepSeek is an AI company focused on AGI.',
    type: 'disabled',
    tags: ['DeepSeek'],
  },
  {
    id: 'moonshot',
    name: 'Moonshot',
    connected: false,
    Icon: Moonshot,
    description: 'Moonshot AI provides advanced LLM services.',
    type: 'disabled',
    tags: ['Moonshot'],
  },
];

// Mock Data for System Models
const systemModels = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI flagship model' },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic most intelligent model',
  },
  { id: 'gemini-pro', name: 'Gemini 1.5 Pro', description: 'Google most capable AI model' },
  { id: 'moonshot', name: 'Moonshot V1', description: 'Moonshot AI Large Language Model' },
];

type Tab = 'general' | 'provider' | 'system-model' | 'storage' | 'help' | 'about';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>('general');
  const [providers, setProviders] = React.useState(defaultProviders);
  const [telemetryEnabled, setTelemetryEnabled] = React.useState(false);

  const handleToggleProvider = (id: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, connected: !p.connected, type: p.connected ? 'disabled' : 'enabled' }
          : p,
      ),
    );
  };

  const handleAddProvider = (provider: Provider) => {
    setProviders((prev) => [provider, ...prev]);
  };

  const renderSidebarItem = (id: Tab, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => {
        setActiveTab(id);
      }}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === id
          ? 'bg-secondary text-secondary-foreground'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="h-full flex bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-none border-r border-border bg-muted/10 flex flex-col">
        <div className="p-4 pb-2">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-xs text-muted-foreground mt-1">Preferences and model settings.</p>
        </div>
        <div className="px-3 space-y-1">
          {renderSidebarItem('general', 'General', <Settings2Icon className="h-4 w-4" />)}
          {renderSidebarItem('provider', 'AI Provider', <BotIcon className="h-4 w-4" />)}
          {renderSidebarItem('system-model', 'System Model', <BoxIcon className="h-4 w-4" />)}
          {renderSidebarItem('storage', 'Data Storage', <DatabaseIcon className="h-4 w-4" />)}
          {renderSidebarItem('help', 'Help & Support', <LifeBuoyIcon className="h-4 w-4" />)}
          {renderSidebarItem('about', 'About', <InfoIcon className="h-4 w-4" />)}
        </div>
        <div className="mt-auto p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Powered by</span>
            <span className="font-semibold text-foreground">LMRing</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {activeTab === 'provider' ? (
          <ProviderLayout
            providers={providers}
            onToggleProvider={handleToggleProvider}
            onAddProvider={handleAddProvider}
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl p-8">
              <AnimatePresence mode="wait">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-lg font-medium mb-1">General Settings</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label className="text-base">Theme</Label>
                        <div className="grid grid-cols-3 gap-4 max-w-md">
                          <div className="cursor-pointer group">
                            <div className="border-2 border-muted rounded-lg p-1 mb-2 group-hover:border-primary transition-colors overflow-hidden">
                              <div className="bg-[#f4f4f5] h-16 rounded w-full relative">
                                <div className="absolute top-2 left-2 w-8 h-2 bg-white rounded-sm shadow-sm" />
                                <div className="absolute top-6 left-2 w-12 h-8 bg-white rounded-sm shadow-sm" />
                              </div>
                            </div>
                            <div className="text-center text-sm font-medium flex items-center justify-center gap-1">
                              <span className="text-muted-foreground">☀</span> Light
                            </div>
                          </div>
                          <div className="cursor-pointer group">
                            <div className="border-2 border-muted rounded-lg p-1 mb-2 group-hover:border-primary transition-colors overflow-hidden">
                              <div className="bg-[#18181b] h-16 rounded w-full relative">
                                <div className="absolute top-2 left-2 w-8 h-2 bg-zinc-800 rounded-sm" />
                                <div className="absolute top-6 left-2 w-12 h-8 bg-zinc-800 rounded-sm" />
                              </div>
                            </div>
                            <div className="text-center text-sm font-medium flex items-center justify-center gap-1">
                              <span className="text-muted-foreground">🌙</span> Dark
                            </div>
                          </div>
                          <div className="cursor-pointer group">
                            <div className="border-2 border-primary rounded-lg p-1 mb-2 overflow-hidden">
                              <div className="bg-gradient-to-br from-[#f4f4f5] to-[#18181b] h-16 rounded w-full flex relative">
                                <div className="w-1/2 h-full relative">
                                  <div className="absolute top-2 left-2 w-4 h-2 bg-white rounded-sm shadow-sm" />
                                </div>
                                <div className="w-1/2 h-full relative">
                                  <div className="absolute top-2 right-2 w-4 h-2 bg-zinc-800 rounded-sm" />
                                </div>
                              </div>
                            </div>
                            <div className="text-center text-sm font-medium flex items-center justify-center gap-1">
                              <span className="text-muted-foreground">💻</span> Automatic
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-base">Language</Label>
                        <div className="max-w-md">
                          <Button variant="outline" className="w-full justify-between font-normal">
                            English
                            <ChevronRightIcon className="h-4 w-4 opacity-50 rotate-90" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* System Model */}
                {activeTab === 'system-model' && (
                  <motion.div
                    key="system-model"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-lg font-medium mb-1">System Models</h2>
                      <p className="text-sm text-muted-foreground">
                        Default models provided by the system.
                      </p>
                    </div>

                    <div className="grid gap-4">
                      {systemModels.map((model) => (
                        <Card key={model.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{model.name}</CardTitle>
                            <CardDescription>{model.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">System Default</Badge>
                              <Badge variant="outline">Chat</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Data Storage */}
                {activeTab === 'storage' && (
                  <motion.div
                    key="storage"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-lg font-medium mb-1">Advanced Operations</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between py-4 border-b">
                        <div className="space-y-0.5">
                          <div className="font-medium">Import Data</div>
                          <div className="text-sm text-muted-foreground">
                            Import data from a local file
                          </div>
                        </div>
                        <Button variant="outline" className="gap-2">
                          <DatabaseIcon className="h-4 w-4" /> Import
                        </Button>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b">
                        <div className="space-y-0.5">
                          <div className="font-medium">Clear All Session Messages</div>
                          <div className="text-sm text-muted-foreground">
                            This will clear all session data, including assistant, files, messages,
                            plugins, etc.
                          </div>
                        </div>
                        <Button variant="destructive">Clear Now</Button>
                      </div>

                      <div className="flex items-center justify-between py-4">
                        <div className="space-y-0.5">
                          <div className="font-medium">Reset All Settings</div>
                          <div className="text-sm text-muted-foreground">
                            Reset all settings to default values
                          </div>
                        </div>
                        <Button variant="destructive">Reset Now</Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Help & Support */}
                {activeTab === 'help' && (
                  <motion.div
                    key="help"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-lg font-medium mb-1">Help & Support</h2>
                      <p className="text-sm text-muted-foreground">
                        Resources and support to help you get the most out of LMRing.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Resources Section */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Resources
                        </h3>
                        <div className="grid gap-4">
                          <a
                            href="https://lmring.ai/how-it-works"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Card className="cursor-pointer hover:shadow-md transition-all">
                              <CardContent className="p-4 flex items-center gap-4">
                                <HelpCircleIcon className="h-8 w-8 text-primary" />
                                <div>
                                  <h4 className="font-medium">How it Works</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Learn how LMRing works
                                  </p>
                                </div>
                                <ExternalLinkIcon className="h-4 w-4 ml-auto text-muted-foreground" />
                              </CardContent>
                            </Card>
                          </a>
                          <a
                            href="https://lmring.ai/help-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Card className="cursor-pointer hover:shadow-md transition-all">
                              <CardContent className="p-4 flex items-center gap-4">
                                <LifeBuoyIcon className="h-8 w-8 text-primary" />
                                <div>
                                  <h4 className="font-medium">Help Center</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Browse FAQs and guides
                                  </p>
                                </div>
                                <ExternalLinkIcon className="h-4 w-4 ml-auto text-muted-foreground" />
                              </CardContent>
                            </Card>
                          </a>
                        </div>
                      </div>

                      {/* About Us Section */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          About Us
                        </h3>
                        <div className="grid gap-4">
                          <a
                            href="https://lmring.ai/about"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Card className="cursor-pointer hover:shadow-md transition-all">
                              <CardContent className="p-4 flex items-center gap-4">
                                <InfoIcon className="h-8 w-8 text-primary" />
                                <div>
                                  <h4 className="font-medium">About LMRing</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Learn about our mission
                                  </p>
                                </div>
                                <ExternalLinkIcon className="h-4 w-4 ml-auto text-muted-foreground" />
                              </CardContent>
                            </Card>
                          </a>
                          <a
                            href="https://lmring.ai/careers"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Card className="cursor-pointer hover:shadow-md transition-all">
                              <CardContent className="p-4 flex items-center gap-4">
                                <UsersIcon className="h-8 w-8 text-primary" />
                                <div>
                                  <h4 className="font-medium">Join the Team</h4>
                                  <p className="text-sm text-muted-foreground">
                                    View open positions
                                  </p>
                                </div>
                                <ExternalLinkIcon className="h-4 w-4 ml-auto text-muted-foreground" />
                              </CardContent>
                            </Card>
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* About */}
                {activeTab === 'about' && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-lg font-medium mb-1">About LMRing</h2>
                    </div>

                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                            🤯
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">LMRing</h3>
                            <p className="text-sm text-muted-foreground">v2.0.0-next.135</p>
                          </div>
                        </div>
                        <Button variant="outline">Changelog</Button>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Contact Us
                        </h3>
                        <div className="space-y-2">
                          <a
                            href="https://lmring.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm hover:underline"
                          >
                            <GlobeIcon className="h-4 w-4" /> Official Website{' '}
                            <ExternalLinkIcon className="h-3 w-3" />
                          </a>
                          <a
                            href="mailto:support@lmring.ai"
                            className="flex items-center gap-2 text-sm hover:underline"
                          >
                            <MailIcon className="h-4 w-4" /> Email Support{' '}
                            <ExternalLinkIcon className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Community and News
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Button variant="secondary" className="w-full justify-start gap-2">
                            <GithubIcon className="h-4 w-4" /> GitHub
                          </Button>
                          <Button variant="secondary" className="w-full justify-start gap-2">
                            <div className="h-4 w-4 bg-indigo-500 rounded-full" /> Discord
                          </Button>
                          <Button variant="secondary" className="w-full justify-start gap-2">
                            <TwitterIcon className="h-4 w-4" /> X / Twitter
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Legal Disclaimer
                        </h3>
                        <div className="space-y-2">
                          <a
                            href="https://lmring.ai/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm hover:underline"
                          >
                            Terms of Service <ExternalLinkIcon className="h-3 w-3" />
                          </a>
                          <a
                            href="https://lmring.ai/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm hover:underline"
                          >
                            Privacy Policy <ExternalLinkIcon className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Send Anonymous Usage Data</div>
                          <div className="text-sm text-muted-foreground">
                            By opting to send telemetry data, you can help us improve the overall
                            user experience.
                          </div>
                        </div>
                        <Switch checked={telemetryEnabled} onCheckedChange={setTelemetryEnabled} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
