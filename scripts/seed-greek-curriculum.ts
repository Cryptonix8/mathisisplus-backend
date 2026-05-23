/**
 * Seed Greek subjects + curriculum units (κεφάλαια).
 * Usage: npm run seed-greek-curriculum
 */

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaModule } from '../src/prisma/prisma.module';
import { GreekCurriculumSeedService } from '../src/auto-init/greek-curriculum-seed.service';

@Module({
  imports: [PrismaModule],
  providers: [GreekCurriculumSeedService],
})
class GreekSeedModule {}

async function main() {
  const app = await NestFactory.createApplicationContext(GreekSeedModule, {
    logger: ['error', 'warn', 'log'],
  });
  const seed = app.get(GreekCurriculumSeedService);

  try {
    const result = await seed.seedGreekCurriculum();
    console.log('Greek curriculum seed complete:', result);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
