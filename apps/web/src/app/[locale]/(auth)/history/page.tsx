'use client';

import { Badge, Card, CardContent, CardHeader } from '@lmring/ui';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, CopyIcon, MessageSquareIcon } from 'lucide-react';

const mockHistory = [
  {
    id: 1,
    prompt: 'Explain quantum computing in simple terms',
    models: ['GPT-4 Turbo', 'Claude 3 Opus'],
    timestamp: '2024-11-14 10:30 AM',
    winner: 'Claude 3 Opus',
  },
  {
    id: 2,
    prompt: 'Write a Python function to sort a binary tree',
    models: ['Gemini Pro', 'GPT-4'],
    timestamp: '2024-11-14 09:45 AM',
    winner: 'GPT-4',
  },
  {
    id: 3,
    prompt: 'What are the implications of AGI for society?',
    models: ['Claude 3 Sonnet', 'Llama 2 70B', 'Mistral Large'],
    timestamp: '2024-11-13 04:20 PM',
    winner: 'Claude 3 Sonnet',
  },
  {
    id: 4,
    prompt: 'Generate a business plan for a sustainable fashion startup',
    models: ['GPT-4 Turbo', 'Gemini Pro'],
    timestamp: '2024-11-13 02:15 PM',
    winner: 'GPT-4 Turbo',
  },
  {
    id: 5,
    prompt: "Translate this text to French: 'The quick brown fox jumps over the lazy dog'",
    models: ['Claude 3 Opus', 'GPT-3.5 Turbo'],
    timestamp: '2024-11-12 11:00 AM',
    winner: 'Claude 3 Opus',
  },
];

export default function HistoryPage() {
  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <ClockIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">Conversation History</h1>
        </div>

        <div className="grid gap-4">
          {mockHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:apple-shadow-lg apple-transition cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      {item.timestamp}
                    </div>
                    <button type="button" className="p-1 hover:bg-accent rounded">
                      <CopyIcon className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MessageSquareIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <p className="text-sm font-medium line-clamp-2">{item.prompt}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {item.models.map((model) => (
                        <Badge
                          key={model}
                          variant={model === item.winner ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {model}
                          {model === item.winner && ' 🏆'}
                        </Badge>
                      ))}
                    </div>

                    {item.winner && (
                      <p className="text-xs text-muted-foreground">
                        Winner: <span className="font-medium text-primary">{item.winner}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
