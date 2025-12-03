import type { Locale } from '@lmring/i18n';
import { Brain, Globe, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: 'Index',
  });

  return (
    <div className="flex min-h-screen flex-col">
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/20 px-4 text-center">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />

        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('title')}
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-xl text-muted-foreground md:text-2xl">
          {t('description')}
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
          <Link
            href="/sign-up/"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {t('get_started')}
          </Link>
          <Link
            href="/arena/"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {t('view_arena')}
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-24 sm:py-32">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('features_title')}
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="group rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              {t('feature_1_title')}
            </h3>
            <p className="text-muted-foreground">{t('feature_1_description')}</p>
          </div>
          <div className="group rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              {t('feature_2_title')}
            </h3>
            <p className="text-muted-foreground">{t('feature_2_description')}</p>
          </div>
          <div className="group rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              {t('feature_3_title')}
            </h3>
            <p className="text-muted-foreground">{t('feature_3_description')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
