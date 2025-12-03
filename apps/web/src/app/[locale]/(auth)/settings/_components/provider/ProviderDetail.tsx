import { Badge, Button, Input, Label, Separator, Switch } from '@lmring/ui';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react';
import type { Provider } from './types';

interface ProviderDetailProps {
  provider: Provider;
  onToggle: (id: string) => void;
}

export function ProviderDetail({ provider, onToggle }: ProviderDetailProps) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-muted/20 text-4xl">
            {provider.Icon ? <provider.Icon size={40} /> : provider.name[0]}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{provider.name}</h2>
            <p className="text-muted-foreground">{provider.description}</p>
          </div>
        </div>
        <Switch checked={provider.connected} onCheckedChange={() => onToggle(provider.id)} />
      </div>

      <Separator />

      <div className="space-y-4">
        <Label>API Key</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? 'text' : 'password'}
              defaultValue={provider.connected ? 'sk-xxxxxxxxxxxxxxxx' : ''}
              placeholder="Enter API Key"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          <Button variant="secondary">Check</Button>
        </div>
      </div>

      <div className="space-y-4">
        <Label>API Proxy URL</Label>
        <Input placeholder="https://api.openai.com/v1" />
      </div>

      <div className="space-y-4">
        <Label>Model List</Label>
        <div className="border rounded-lg divide-y">
          {['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'].map((model) => (
            <div key={model} className="p-3 flex items-center justify-between hover:bg-muted/50">
              <span className="font-medium">{model}</span>
              <Badge variant="outline">Chat</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
