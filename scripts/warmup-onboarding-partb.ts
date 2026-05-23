import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { OnboardingTestsService } from '../src/onboarding-tests/onboarding-tests.service';

function parseLocales(argv: string[]): string[] | undefined {
  const arg = argv.find((item) => item.startsWith('--locales='));
  if (!arg) return undefined;
  const values = arg
    .replace('--locales=', '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  return values.length > 0 ? values : undefined;
}

async function main() {
  const locales = parseLocales(process.argv.slice(2));
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'warn', 'error'] });

  try {
    const onboardingTests = app.get(OnboardingTestsService);
    console.log('Starting onboarding Part B warm-up...');
    if (locales?.length) {
      console.log(`Locales filter: ${locales.join(', ')}`);
    }

    const summary = await onboardingTests.warmupPartBDiagnostics(locales);
    console.log('Warm-up completed.');
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('onboarding:warmup failed:', error);
  process.exit(1);
});
