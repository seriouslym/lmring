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
} from '@lmring/ui';
import { motion } from 'framer-motion';
import { CheckIcon, EyeIcon, EyeOffIcon, KeyIcon, SaveIcon, SettingsIcon } from 'lucide-react';
import * as React from 'react';

const providers = [
  { name: 'OpenAI', connected: true, keyCount: 2 },
  { name: 'Anthropic', connected: true, keyCount: 1 },
  { name: 'Google', connected: false, keyCount: 0 },
  { name: 'Meta', connected: false, keyCount: 0 },
  { name: 'Mistral', connected: true, keyCount: 1 },
];

export default function SettingsPage() {
  const [showKey, setShowKey] = React.useState<Record<string, boolean>>({});
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        </div>

        <div className="grid gap-6">
          {/* API Keys Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyIcon className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>Manage your API keys for different AI providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {providers.map((provider, index) => (
                <motion.div
                  key={provider.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{provider.name}</h3>
                      <Badge variant={provider.connected ? 'default' : 'secondary'}>
                        {provider.connected ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>
                    {provider.connected && (
                      <span className="text-sm text-muted-foreground">
                        {provider.keyCount} key{provider.keyCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${provider.name}-key`}>API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={`${provider.name}-key`}
                          type={showKey[provider.name] ? 'text' : 'password'}
                          placeholder={
                            provider.connected ? '••••••••••••••••' : 'Enter your API key'
                          }
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowKey({
                              ...showKey,
                              [provider.name]: !showKey[provider.name],
                            })
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
                        >
                          {showKey[provider.name] ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <Button variant="outline" size="sm">
                        Test
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  {saved ? (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <SaveIcon className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Default Models Section */}
          <Card>
            <CardHeader>
              <CardTitle>Default Models</CardTitle>
              <CardDescription>Choose your preferred models for different tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Model preferences configuration coming soon...
              </p>
            </CardContent>
          </Card>

          {/* General Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>General Preferences</CardTitle>
              <CardDescription>Customize your arena experience</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                General preferences configuration coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
