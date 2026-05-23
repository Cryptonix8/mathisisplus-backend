/**
 * Greek (el-GR) copy for revision / feedback self-assessment tests.
 */

export function buildGreekFeedbackTestTitle(skillName: string): string {
  return `Αυτοαξιολόγηση – ${skillName}`;
}

export function buildGreekFeedbackTestDescription(
  skillName: string,
  subjectName?: string,
): string {
  if (subjectName) {
    return `Αξιολόγησε τη σιγουριά και τις δεξιότητές σου στο «${skillName}» (${subjectName}).`;
  }
  return `Αξιολόγησε τη σιγουριά σου στις δεξιότητες «${skillName}».`;
}

/** Default 4-question self-assessment (matches auto-init seed). */
export function buildGreekFeedbackTestQuestions(skillName: string): string[] {
  return [
    `Κατανοώ τις βασικές έννοιες στο «${skillName}».`,
    `Μπορώ να εφαρμόσω δεξιότητες στο «${skillName}» σε απλές ασκήσεις.`,
    `Μπορώ να αντιμετωπίσω απαιτητικές ασκήσεις στο «${skillName}».`,
    `Μπορώ να εξηγώ τις έννοιες του «${skillName}» σε άλλους.`,
  ];
}

/** Extended set used when auto-generating tests for new skills. */
export function buildGreekFeedbackTestQuestionsExtended(skillName: string): string[] {
  return [
    `Νιώθω σιγουριά στις δεξιότητές μου στο «${skillName}».`,
    `Μπορώ να εφαρμόσω αυτοτελώς δεξιότητες στο «${skillName}».`,
    `Κατανοώ τις βασικές έννοιες στο «${skillName}».`,
    `Μπορώ να εφαρμόσω τις δεξιότητες «${skillName}» σε νέες καταστάσεις.`,
    `Μπορώ να εξηγώ έννοιες του «${skillName}» σε άλλους.`,
    `Μπορώ να αναγνωρίσω τα δυνατά μου σημεία στο «${skillName}».`,
    `Ξέρω σε ποιους τομείς του «${skillName}» χρειάζομαι βελτίωση.`,
    `Νιώθω έτοιμος/η όταν καλούμαι να αντιμετωπίσω ασκήσεις στο «${skillName}».`,
  ];
}

export function extractSkillNameFromEnglishTitle(title: string): string {
  return title.replace(/\s*Self-Assessment\s*$/i, '').trim();
}

export function isEnglishFeedbackTestContent(test: {
  title?: string | null;
  description?: string | null;
  questions?: Array<{ statement?: string | null }>;
}): boolean {
  const title = test.title || '';
  if (/Self-Assessment/i.test(title)) return true;
  const description = test.description || '';
  if (/Rate your confidence|Assess your confidence/i.test(description)) {
    return true;
  }
  const questions = test.questions || [];
  return questions.some((q) =>
    /^(I feel|I can|I understand|I know)\b/i.test((q.statement || '').trim()),
  );
}

export function applyElGRFeedbackTestCopy<T extends Record<string, any>>(test: T): T {
  if (!test || !isEnglishFeedbackTestContent(test)) {
    return test;
  }

  const skillName =
    test.skill?.displayName ||
    extractSkillNameFromEnglishTitle(test.title || '') ||
    'δεξιότητες';
  const subjectName = test.subject?.displayName;
  const greekStatements = buildGreekFeedbackTestQuestions(skillName);
  const questions = Array.isArray(test.questions)
    ? test.questions.map((q: any, index: number) => ({
        ...q,
        statement: greekStatements[index] ?? greekStatements[greekStatements.length - 1],
      }))
    : test.questions;

  return {
    ...test,
    title: buildGreekFeedbackTestTitle(skillName),
    description: buildGreekFeedbackTestDescription(skillName, subjectName),
    questions,
  };
}
