import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  GREEK_CURRICULUM_VERSION,
  GREEK_GRADE_LEVELS,
  GREEK_SUBJECTS,
  GREEK_SUBJECTS_MIN_PER_YEAR,
} from '../common/greek-subjects-catalog';
import {
  educationLevelToKeyStage,
  getGreekUnitsForSubjectGrade,
  gradeCodeToEducationLevel,
  GREEK_TOPICS_MIN_PER_SUBJECT,
} from '../common/greek-units-catalog';

export interface GreekSeedResult {
  yearGroupsCreated: number;
  yearGroupsExisting: number;
  subjectsCreated: number;
  subjectsExisting: number;
  skillsCreated: number;
  topicsCreated: number;
  topicsExisting: number;
}

/**
 * Ensures every Greek year group has subjects and curriculum units (κεφάλαια) for Practice.
 */
@Injectable()
export class GreekCurriculumSeedService {
  private readonly logger = new Logger(GreekCurriculumSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async needsGreekSubjectSeed(): Promise<boolean> {
    const yearGroups = await this.prisma.yearGroup.findMany({
      where: { isActive: true, locale: 'el-GR' },
      select: { id: true },
    });

    if (yearGroups.length === 0) {
      return true;
    }

    for (const year of yearGroups) {
      const count = await this.prisma.subject.count({
        where: { yearGroupId: year.id, isActive: true, locale: 'el-GR' },
      });
      if (count < GREEK_SUBJECTS_MIN_PER_YEAR) {
        return true;
      }
    }

    return false;
  }

  /** True when Greek curriculum topics (units) are missing for any subject/year. */
  async needsGreekTopicSeed(): Promise<boolean> {
    const elGrTopicCount = await this.prisma.curriculumTopic.count({
      where: { locale: 'el-GR' },
    });
    if (elGrTopicCount === 0) {
      return true;
    }

    const yearGroups = await this.prisma.yearGroup.findMany({
      where: { isActive: true, locale: 'el-GR' },
      select: { id: true, name: true, displayName: true },
    });

    for (const year of yearGroups) {
      const subjects = await this.prisma.subject.findMany({
        where: { yearGroupId: year.id, isActive: true, locale: 'el-GR' },
        select: { id: true },
      });
      for (const subject of subjects) {
        const topicCount = await this.prisma.curriculumTopic.count({
          where: { yearGroupId: year.id, subjectId: subject.id, locale: 'el-GR' },
        });
        if (topicCount < GREEK_TOPICS_MIN_PER_SUBJECT) {
          return true;
        }
      }
    }

    return false;
  }

  /** Remove duplicate el-GR topics (same year + subject + topic name). */
  private async dedupeGreekCurriculumTopics(): Promise<number> {
    const topics = await this.prisma.curriculumTopic.findMany({
      where: { locale: 'el-GR' },
      select: { id: true, yearGroupId: true, subjectId: true, topicName: true },
      orderBy: { createdAt: 'asc' },
    });
    const seen = new Set<string>();
    const duplicateIds: string[] = [];
    for (const topic of topics) {
      const key = `${topic.yearGroupId}::${topic.subjectId}::${topic.topicName}`;
      if (seen.has(key)) {
        duplicateIds.push(topic.id);
      } else {
        seen.add(key);
      }
    }
    if (duplicateIds.length > 0) {
      await this.prisma.curriculumTopic.deleteMany({
        where: { id: { in: duplicateIds } },
      });
      this.logger.log(`Removed ${duplicateIds.length} duplicate Greek curriculum topics`);
    }
    return duplicateIds.length;
  }

  async seedGreekCurriculum(): Promise<GreekSeedResult> {
    await this.dedupeGreekCurriculumTopics();

    const result: GreekSeedResult = {
      yearGroupsCreated: 0,
      yearGroupsExisting: 0,
      subjectsCreated: 0,
      subjectsExisting: 0,
      skillsCreated: 0,
      topicsCreated: 0,
      topicsExisting: 0,
    };

    const yearGroupByCode = new Map<string, { id: string; displayName: string }>();

    for (const grade of GREEK_GRADE_LEVELS) {
      const existing = await this.prisma.yearGroup.findFirst({
        where: { name: grade.code, locale: 'el-GR' },
      });

      if (existing) {
        await this.prisma.yearGroup.update({
          where: { id: existing.id },
          data: {
            displayName: grade.displayName,
            orderIndex: grade.orderIndex,
            isActive: true,
            curriculumVersion: GREEK_CURRICULUM_VERSION,
          },
        });
        yearGroupByCode.set(grade.code, { id: existing.id, displayName: grade.displayName });
        result.yearGroupsExisting++;
      } else {
        const created = await this.prisma.yearGroup.create({
          data: {
            name: grade.code,
            displayName: grade.displayName,
            orderIndex: grade.orderIndex,
            isActive: true,
            locale: 'el-GR',
            curriculumVersion: GREEK_CURRICULUM_VERSION,
          },
        });
        yearGroupByCode.set(grade.code, { id: created.id, displayName: grade.displayName });
        result.yearGroupsCreated++;
        this.logger.log(`Created Greek year group: ${grade.displayName}`);
      }
    }

    for (const [gradeCode, yearGroup] of yearGroupByCode) {
      const gradeDisplayName = GREEK_GRADE_LEVELS.find((g) => g.code === gradeCode)?.displayName ?? gradeCode;
      const educationLevel = gradeCodeToEducationLevel(gradeCode);
      const keyStage = educationLevelToKeyStage(educationLevel);

      const existingTopics = await this.prisma.curriculumTopic.findMany({
        where: { yearGroupId: yearGroup.id, locale: 'el-GR' },
        select: { subjectId: true, topicName: true },
      });
      const existingTopicKeys = new Set(
        existingTopics.map((t) => `${t.subjectId}::${t.topicName}`),
      );

      const topicsToCreate: Array<{
        yearGroupId: string;
        subjectId: string;
        topicName: string;
        keyStage: ReturnType<typeof educationLevelToKeyStage>;
        coreContent?: string;
        learningObjectives: string[];
        keySkills: string[];
        nationalCurriculumRef?: string;
      }> = [];

      for (const template of GREEK_SUBJECTS) {
        const existingSubject = await this.prisma.subject.findFirst({
          where: {
            yearGroupId: yearGroup.id,
            name: template.name,
            locale: 'el-GR',
          },
        });

        let subjectId: string;

        if (existingSubject) {
          await this.prisma.subject.update({
            where: { id: existingSubject.id },
            data: {
              displayName: template.displayName,
              description: template.description,
              iconName: template.iconName,
              colorCode: template.colorCode,
              orderIndex: template.orderIndex,
              isActive: true,
              curriculumVersion: GREEK_CURRICULUM_VERSION,
            },
          });
          subjectId = existingSubject.id;
          result.subjectsExisting++;
        } else {
          const created = await this.prisma.subject.create({
            data: {
              yearGroupId: yearGroup.id,
              name: template.name,
              displayName: template.displayName,
              description: template.description,
              iconName: template.iconName,
              colorCode: template.colorCode,
              orderIndex: template.orderIndex,
              isActive: true,
              locale: 'el-GR',
              curriculumVersion: GREEK_CURRICULUM_VERSION,
            },
          });
          subjectId = created.id;
          result.subjectsCreated++;
        }

        for (let i = 0; i < template.skills.length; i++) {
          const skillLabel = template.skills[i];
          const skillName = `${template.name}_skill_${i + 1}`;
          const existingSkill = await this.prisma.skill.findUnique({
            where: { subjectId_name: { subjectId, name: skillName } },
          });
          await this.prisma.skill.upsert({
            where: {
              subjectId_name: { subjectId, name: skillName },
            },
            create: {
              subjectId,
              name: skillName,
              displayName: skillLabel,
              description: `${skillLabel} — ${template.displayName}`,
              orderIndex: i + 1,
            },
            update: {
              displayName: skillLabel,
              orderIndex: i + 1,
            },
          });
          if (!existingSkill) {
            result.skillsCreated++;
          }
        }

        const unitTemplates = getGreekUnitsForSubjectGrade(
          template.name,
          template.displayName,
          gradeCode,
          gradeDisplayName,
        );

        for (const unitTemplate of unitTemplates) {
          const topicKey = `${subjectId}::${unitTemplate.topicName}`;
          if (existingTopicKeys.has(topicKey)) {
            result.topicsExisting++;
            continue;
          }
          topicsToCreate.push({
            yearGroupId: yearGroup.id,
            subjectId,
            topicName: unitTemplate.topicName,
            keyStage,
            coreContent: unitTemplate.coreContent,
            learningObjectives: unitTemplate.learningObjectives ?? [],
            keySkills: unitTemplate.keySkills ?? [],
            nationalCurriculumRef: unitTemplate.nationalCurriculumRef,
          });
          existingTopicKeys.add(topicKey);
        }
      }

      if (topicsToCreate.length > 0) {
        await this.prisma.curriculumTopic.createMany({
          data: topicsToCreate.map((t) => ({
            yearGroupId: t.yearGroupId,
            subjectId: t.subjectId,
            topicName: t.topicName,
            keyStage: t.keyStage,
            coreContent: t.coreContent,
            learningObjectives: t.learningObjectives,
            keySkills: t.keySkills,
            priorKnowledge: [],
            locale: 'el-GR',
            curriculumVersion: GREEK_CURRICULUM_VERSION,
            nationalCurriculumRef: t.nationalCurriculumRef,
          })),
          skipDuplicates: true,
        });
        result.topicsCreated += topicsToCreate.length;
      }

      await this.prisma.subject.updateMany({
        where: {
          yearGroupId: yearGroup.id,
          locale: 'el-GR',
          isActive: true,
          OR: [
            { name: 'fysikes_epistimes' },
            { name: 'fysikes_epistimés' },
            { displayName: { contains: 'Φυσικές Επιστήμες' } },
          ],
        },
        data: { isActive: false },
      });
    }

    this.logger.log(
      `Greek curriculum seed: years +${result.yearGroupsCreated}/=${result.yearGroupsExisting}, ` +
        `subjects +${result.subjectsCreated}/=${result.subjectsExisting}, skills +${result.skillsCreated}, ` +
        `topics +${result.topicsCreated}/=${result.topicsExisting}`,
    );

    return result;
  }
}
