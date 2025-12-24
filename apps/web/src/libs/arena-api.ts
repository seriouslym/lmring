export interface ApiKey {
  id: string;
  providerName: string;
  proxyUrl: string;
  configSource: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getApiKeys(): Promise<{ keys: ApiKey[] }> {
  const response = await fetch('/api/settings/api-keys');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get API keys');
  }

  return response.json();
}

export async function addApiKey(
  providerName: string,
  apiKey: string,
  proxyUrl?: string,
): Promise<{ message: string; id: string; providerName: string; proxyUrl: string }> {
  const response = await fetch('/api/settings/api-keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      providerName,
      apiKey,
      proxyUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add API key');
  }

  return response.json();
}

export async function deleteApiKey(keyId: string): Promise<{ message: string }> {
  const response = await fetch(`/api/settings/api-keys?id=${keyId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete API key');
  }

  return response.json();
}

export async function getProviderApiKey(providerName: string): Promise<{
  id: string;
  providerName: string;
  apiKey: string;
  proxyUrl: string;
  configSource: string;
}> {
  const response = await fetch(`/api/settings/api-keys/${providerName}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get API key');
  }

  return response.json();
}
