'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Switch,
} from '@lmring/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDownIcon,
  CopyIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  PlusIcon,
  RotateCwIcon,
  SearchIcon,
  SettingsIcon,
  TrashIcon,
} from 'lucide-react';
import * as React from 'react';

// Mock Data for Providers
const providers = [
  {
    id: 'cherryin',
    name: 'CherryIN',
    connected: true,
    icon: '🍒',
    description: 'CherryIN AI Services',
  },
  { id: 'mnapi', name: 'mnapi', connected: false, icon: 'Ⓜ️', description: 'MNAPI Services' },
  {
    id: 'siliconflow',
    name: 'SiliconFlow',
    connected: true,
    icon: '🌊',
    description: 'SiliconFlow AI',
  },
  {
    id: 'modelscope',
    name: 'ModelScope',
    connected: true,
    icon: '🤖',
    description: 'ModelScope MaaS',
  },
  {
    id: 'aliyun',
    name: 'Aliyun Bailian',
    connected: true,
    icon: '☁️',
    description: 'Aliyun Bailian',
  },
  { id: 'aihubmix', name: 'AiHubMix', connected: false, icon: '🔄', description: 'AiHubMix' },
  { id: 'openai', name: 'OpenAI', connected: false, icon: '🧠', description: 'OpenAI' },
  {
    id: 'anthropic',
    name: 'Anthropic',
    connected: false,
    icon: 'claude',
    description: 'Anthropic Claude',
  },
];

type Tab = 'services' | 'default-model' | 'general';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>('services');
  const [selectedProviderId, setSelectedProviderId] = React.useState<string>(
    providers[0]?.id ?? '',
  );
  const [showKey, setShowKey] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const selectedProvider = providers.find((p) => p.id === selectedProviderId) ?? providers[0];

  const filteredProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
      {/* Header & Tabs */}
      <div className="flex-none px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'services'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Model Services
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('default-model')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'default-model'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Default Model
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'general'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              General Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full flex"
            >
              {/* Left Sidebar - Provider List */}
              <div className="w-80 border-r border-border flex flex-col bg-sidebar/30">
                <div className="p-4">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search model platform..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-background border-input focus-visible:ring-1"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
                  {filteredProviders.map((provider) => (
                    <button
                      type="button"
                      key={provider.id}
                      onClick={() => setSelectedProviderId(provider.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedProviderId === provider.id
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                          : 'hover:bg-sidebar-accent/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center text-lg shadow-sm">
                          {provider.icon}
                        </div>
                        <span className="font-medium text-sm">{provider.name}</span>
                      </div>
                      {provider.connected && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-5 text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400"
                        >
                          ON
                        </Badge>
                      )}
                    </button>
                  ))}
                  <div className="pt-2 px-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground border border-dashed border-border"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add Custom Provider
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Panel - Provider Details */}
              <div className="flex-1 overflow-y-auto p-8 bg-background">
                {selectedProvider && (
                  <div className="max-w-3xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-2xl">
                          {selectedProvider.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold">{selectedProvider.name}</h2>
                            <ExternalLinkIcon className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {selectedProvider.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="provider-active" className="text-sm text-muted-foreground">
                          Enabled
                        </Label>
                        <Switch id="provider-active" checked={selectedProvider.connected} />
                      </div>
                    </div>

                    <Separator />

                    {/* API Key Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          API Key
                          <Badge variant="secondary" className="text-[10px] font-normal">
                            Required
                          </Badge>
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              type={showKey ? 'text' : 'password'}
                              placeholder="sk-..."
                              className="pr-10 font-mono text-sm"
                              defaultValue={
                                selectedProvider.connected ? 'sk-xxxxxxxxxxxxxxxxxxxxxxxx' : ''
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setShowKey(!showKey)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showKey ? (
                                <EyeOffIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          <Button variant="secondary">Check</Button>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <button
                            type="button"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            Get API Key <ExternalLinkIcon className="h-3 w-3" />
                          </button>
                          <span>Supports multiple keys (comma separated)</span>
                        </div>
                      </div>
                    </div>

                    {/* API Address Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">API Address</h3>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <RotateCwIcon className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          defaultValue="https://api.example.com/v1"
                          className="font-mono text-sm"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Base URL for chat completions</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Models Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold">Models</h3>
                          <Badge variant="outline" className="text-xs font-normal">
                            3 Available
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-2">
                            <SettingsIcon className="h-3.5 w-3.5" />
                            Manage
                          </Button>
                          <Button size="sm" className="gap-2">
                            <PlusIcon className="h-3.5 w-3.5" />
                            Add Model
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'].map((model) => (
                          <div
                            key={model}
                            className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                <SettingsIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{model}</div>
                                <div className="text-xs text-muted-foreground">Chat Completion</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <CopyIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'default-model' && (
            <motion.div
              key="default-model"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8 max-w-4xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Default Models</CardTitle>
                  <CardDescription>
                    Choose your preferred models for different tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="space-y-1">
                        <div className="font-medium">Main Chat Model</div>
                        <div className="text-sm text-muted-foreground">
                          Used for general conversation
                        </div>
                      </div>
                      <div className="w-[200px]">
                        <Button variant="outline" className="w-full justify-between font-normal">
                          GPT-4o
                          <ChevronDownIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="space-y-1">
                        <div className="font-medium">Coding Model</div>
                        <div className="text-sm text-muted-foreground">
                          Used for code generation and analysis
                        </div>
                      </div>
                      <div className="w-[200px]">
                        <Button variant="outline" className="w-full justify-between font-normal">
                          Claude 3.5 Sonnet
                          <ChevronDownIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="space-y-1">
                        <div className="font-medium">Reasoning Model</div>
                        <div className="text-sm text-muted-foreground">
                          Used for complex logic and reasoning
                        </div>
                      </div>
                      <div className="w-[200px]">
                        <Button variant="outline" className="w-full justify-between font-normal">
                          o1-preview
                          <ChevronDownIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'general' && (
            <motion.div
              key="general"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8 max-w-4xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-base">Language</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors bg-accent/50 border-primary">
                        <div className="flex-1">
                          <div className="font-medium">English</div>
                          <div className="text-xs text-muted-foreground">English</div>
                        </div>
                        <div className="h-4 w-4 rounded-full border border-primary bg-primary" />
                      </div>
                      <div className="relative flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
                        <div className="flex-1">
                          <div className="font-medium">Chinese</div>
                          <div className="text-xs text-muted-foreground">中文</div>
                        </div>
                        <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base">Theme</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="cursor-pointer group">
                        <div className="border-2 border-muted rounded-lg p-2 mb-2 group-hover:border-primary transition-colors">
                          <div className="bg-[#f4f4f5] h-20 rounded-md w-full" />
                        </div>
                        <div className="text-center text-sm font-medium">Light</div>
                      </div>
                      <div className="cursor-pointer group">
                        <div className="border-2 border-muted rounded-lg p-2 mb-2 group-hover:border-primary transition-colors">
                          <div className="bg-[#18181b] h-20 rounded-md w-full" />
                        </div>
                        <div className="text-center text-sm font-medium">Dark</div>
                      </div>
                      <div className="cursor-pointer group">
                        <div className="border-2 border-primary rounded-lg p-2 mb-2">
                          <div className="bg-gradient-to-br from-[#f4f4f5] to-[#18181b] h-20 rounded-md w-full" />
                        </div>
                        <div className="text-center text-sm font-medium">System</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
