import { PrismaService } from '../prisma/prisma.service';

/**
 * Greek app sends locale=el-GR, but many deployments only seed UK curriculum (en-GB).
 * If no el-GR rows exist for this model, fall back to en-GB/null so APIs still return data.
 */
export async function whereYearGroupLocale(
  prisma: PrismaService,
  effectiveLocale: string,
  activeOnly: boolean,
): Promise<Record<string, unknown>> {
  const activePart = activeOnly ? { isActive: true } : {};
  if (effectiveLocale !== 'el-GR') {
    return { ...activePart, OR: [{ locale: 'en-GB' }, { locale: null }] };
  }
  const greekCount = await prisma.yearGroup.count({
    where: { ...activePart, locale: 'el-GR' },
  });
  if (greekCount > 0) {
    return { ...activePart, locale: 'el-GR' };
  }
  return { ...activePart, OR: [{ locale: 'en-GB' }, { locale: null }] };
}

export async function whereSubjectLocale(
  prisma: PrismaService,
  effectiveLocale: string,
  baseWhere: { yearGroupId?: string },
): Promise<Record<string, unknown>> {
  const base = { isActive: true, ...baseWhere };
  if (effectiveLocale !== 'el-GR') {
    return { ...base, OR: [{ locale: 'en-GB' }, { locale: null }] };
  }
  const greekCount = await prisma.subject.count({
    where: { ...base, locale: 'el-GR' },
  });
  if (greekCount > 0) {
    return { ...base, locale: 'el-GR' };
  }
  return { ...base, OR: [{ locale: 'en-GB' }, { locale: null }] };
}
