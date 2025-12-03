'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@lmring/ui';
import { Anthropic, Azure, Google, OpenAI } from '@lobehub/icons';
import { BoxIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import type { Provider } from './types';

const PROVIDER_OPTIONS = [
  'OpenAI',
  'OpenAI-Response',
  'Gemini',
  'Anthropic',
  'Azure OpenAI',
  'New API',
  'CherryIn',
];

interface AddProviderDialogProps {
  onAdd: (provider: Provider) => void;
}

export function AddProviderDialog({ onAdd }: AddProviderDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [providerType, setProviderType] = useState('');

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setName('');
      setProviderType('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !providerType) return;

    // Determine icon based on provider type
    let Icon: Provider['Icon'] = BoxIcon;
    if (providerType === 'OpenAI' || providerType === 'OpenAI-Response') {
      Icon = OpenAI;
    } else if (providerType === 'Gemini') {
      Icon = Google;
    } else if (providerType === 'Anthropic') {
      Icon = Anthropic;
    } else if (providerType === 'Azure OpenAI') {
      Icon = Azure;
    } else if (providerType === 'New API' || providerType === 'CherryIn') {
      Icon = BoxIcon;
    }

    const newProvider: Provider = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      connected: false,
      Icon,
      description: `Custom ${providerType} provider`,
      type: 'enabled',
      tags: [providerType],
    };

    onAdd(newProvider);
    handleOpenChange(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="h-4 w-4" />
        <span>Add Provider</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent open={open} className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Provider</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Provider Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Example: OpenAI"
                  autoComplete="organization"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="providerType">Provider Type</Label>
                <Select name="providerType" value={providerType} onValueChange={setProviderType}>
                  <SelectTrigger id="providerType">
                    <SelectValue placeholder="Select provider type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name || !providerType}>
                OK
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
