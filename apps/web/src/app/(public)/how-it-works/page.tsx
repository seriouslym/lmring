import { Button } from '@lmring/ui';
import { CheckCircle, ExternalLink, Keyboard, MessageCircle, Trophy } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getRequestLocale } from '@/libs/request-locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations({
    locale,
    namespace: 'HowItWorks',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function HowItWorksPage() {
  const locale = await getRequestLocale();
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'HowItWorks',
  });

  const steps = [
    {
      number: 1,
      icon: Keyboard,
      title: t('step_1_title'),
      description: t('step_1_description'),
    },
    {
      number: 2,
      icon: MessageCircle,
      title: t('step_2_title'),
      description: t('step_2_description'),
    },
    {
      number: 3,
      icon: CheckCircle,
      title: t('step_3_title'),
      description: t('step_3_description'),
    },
    {
      number: 4,
      icon: Trophy,
      title: t('step_4_title'),
      description: t('step_4_description'),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 text-center">
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {t('hero_title')}
        </h1>
        <p className="mt-6 max-w-2xl text-xl text-muted-foreground">{t('hero_description')}</p>
        <div className="mt-10">
          <a
            href="https://github.com/llm-ring/lmring"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {t('about_us')}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Steps Section */}
      <section className="container mx-auto px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex gap-6">
                {/* Connecting line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-16 h-full w-0.5 bg-border" />
                )}

                {/* Icon circle */}
                <div className="flex-none">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-12">
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-24">
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <h2 className="mb-4 text-3xl font-bold text-foreground">{t('cta_title')}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">{t('cta_description')}</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/sign-up/">
              <Button size="lg" className="w-full sm:w-auto">
                {t('cta_get_started')}
              </Button>
            </Link>
            <Link href="/arena/">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {t('cta_try_arena')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/40 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t('powered_by')}{' '}
            <a
              href="https://github.com/llm-ring/lmring"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
            >
              LMRing <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
