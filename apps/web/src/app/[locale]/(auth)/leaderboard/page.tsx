'use client';

import { Card, CardContent } from '@lmring/ui';
import { motion } from 'framer-motion';
import { TrendingDownIcon, TrendingUpIcon, TrophyIcon } from 'lucide-react';

const mockLeaderboard = [
  { rank: 1, name: 'GPT-4 Turbo', provider: 'OpenAI', elo: 1812, change: '+12', trend: 'up' },
  { rank: 2, name: 'Claude 3 Opus', provider: 'Anthropic', elo: 1798, change: '+8', trend: 'up' },
  { rank: 3, name: 'Gemini Pro', provider: 'Google', elo: 1756, change: '-5', trend: 'down' },
  { rank: 4, name: 'GPT-4', provider: 'OpenAI', elo: 1743, change: '+3', trend: 'up' },
  {
    rank: 5,
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    elo: 1721,
    change: '+15',
    trend: 'up',
  },
  { rank: 6, name: 'Llama 2 70B', provider: 'Meta', elo: 1698, change: '-2', trend: 'down' },
  { rank: 7, name: 'Mistral Large', provider: 'Mistral', elo: 1687, change: '+7', trend: 'up' },
  { rank: 8, name: 'GPT-3.5 Turbo', provider: 'OpenAI', elo: 1654, change: '-3', trend: 'down' },
];

export default function LeaderboardPage() {
  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <TrophyIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">Model Leaderboard</h1>
        </div>

        <div className="grid gap-4">
          {mockLeaderboard.map((model, index) => (
            <motion.div
              key={model.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:apple-shadow-lg apple-transition">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`text-2xl font-bold ${model.rank <= 3 ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      #{model.rank}
                    </div>
                    <div>
                      <h3 className="font-semibold">{model.name}</h3>
                      <p className="text-sm text-muted-foreground">{model.provider}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{model.elo}</div>
                      <div className="text-sm text-muted-foreground">ELO Score</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {model.trend === 'up' ? (
                        <TrendingUpIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDownIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span className={model.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                        {model.change}
                      </span>
                    </div>
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
