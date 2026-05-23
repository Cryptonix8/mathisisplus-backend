import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackTestDto } from './dto/create-feedback-test.dto';
import { UpdateFeedbackTestDto } from './dto/update-feedback-test.dto';
import {
  applyElGRFeedbackTestCopy,
  buildGreekFeedbackTestDescription,
  buildGreekFeedbackTestQuestionsExtended,
  buildGreekFeedbackTestTitle,
  isEnglishFeedbackTestContent,
} from '../common/greek-feedback-test-text';

@Injectable()
export class FeedbackTestsService {
  private readonly logger = new Logger(FeedbackTestsService.name);
  
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new feedback test with questions
   */
  async create(createFeedbackTestDto: CreateFeedbackTestDto) {
    const { questions, ...testData } = createFeedbackTestDto;

    // Check if test already exists for this subject + skill
    const existing = await this.prisma.feedbackTest.findUnique({
      where: {
        subjectId_skillId: {
          subjectId: testData.subjectId,
          skillId: testData.skillId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'A feedback test already exists for this subject and skill',
      );
    }

    return this.prisma.feedbackTest.create({
      data: {
        ...testData,
        questions: {
          create: questions.map((q, index) => ({
            statement: q.statement,
            orderIndex: index,
          })),
        },
      },
      include: {
        subject: true,
        skill: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  /**
   * Get all feedback tests
   * Auto-generates tests for subjects that don't have any
   */
  async findAll(subjectId?: string, skillId?: string, yearGroupId?: string) {
    // If filtering by subject, ensure tests exist for all skills
    if (subjectId) {
      await this.ensureTestsExistForSubject(subjectId);
    }

    const where: any = {
      isActive: true,
    };

    if (subjectId) where.subjectId = subjectId;
    if (skillId) where.skillId = skillId;
    if (yearGroupId) {
      where.subject = {
        yearGroupId: yearGroupId,
      };
    }

    const tests = await this.prisma.feedbackTest.findMany({
      where,
      include: {
        subject: {
          include: {
            yearGroup: true,
          },
        },
        skill: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: { assessments: true },
        },
      },
    });

    return tests.map((test) => applyElGRFeedbackTestCopy(test));
  }

  /**
   * Ensure feedback tests exist for all skills in a subject
   * Auto-generates any missing tests
   */
  private async ensureTestsExistForSubject(subjectId: string) {
    // Get all skills for this subject
    const skills = await this.prisma.skill.findMany({
      where: { subjectId },
    });

    // Check which skills already have tests
    const existingTests = await this.prisma.feedbackTest.findMany({
      where: { subjectId },
      select: { skillId: true },
    });
    const existingSkillIds = new Set(existingTests.map(t => t.skillId));

    // Generate tests for skills that don't have one
    for (const skill of skills) {
      if (!existingSkillIds.has(skill.id)) {
        try {
          await this.autoGenerateTest(subjectId, skill.id);
        } catch (error) {
          this.logger.warn(`Could not auto-generate test for skill ${skill.id}:`, error);
        }
      }
    }

    await this.repairEnglishFeedbackTestsForSubject(subjectId);
  }

  /**
   * Get feedback test by ID
   */
  async findOne(id: string) {
    const test = await this.prisma.feedbackTest.findUnique({
      where: { id },
      include: {
        subject: true,
        skill: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!test) {
      throw new NotFoundException(`Feedback test with ID ${id} not found`);
    }

    await this.repairEnglishFeedbackTestIfNeeded(test);
    return applyElGRFeedbackTestCopy(test);
  }

  /**
   * Get test for specific subject and skill
   * Auto-generates a test if one doesn't exist (no admin intervention needed)
   */
  async findBySubjectAndSkill(subjectId: string, skillId: string) {
    let test = await this.prisma.feedbackTest.findUnique({
      where: {
        subjectId_skillId: {
          subjectId,
          skillId,
        },
      },
      include: {
        subject: true,
        skill: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    // Auto-generate test if it doesn't exist
    if (!test) {
      this.logger.log(`No test found for subject ${subjectId} and skill ${skillId}, auto-generating...`);
      test = await this.autoGenerateTest(subjectId, skillId);
    }

    await this.repairEnglishFeedbackTestIfNeeded(test);
    return applyElGRFeedbackTestCopy(test);
  }

  /**
   * Auto-generate a feedback test for a subject/skill combination
   * This allows the system to work without admin intervention
   */
  private async autoGenerateTest(subjectId: string, skillId: string) {
    // Get subject and skill details
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: { yearGroup: true },
    });

    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!subject || !skill) {
      throw new NotFoundException('Subject or skill not found');
    }

    const skillName = skill.displayName;
    const questions = buildGreekFeedbackTestQuestionsExtended(skillName);

    // Create the test with questions
    const test = await this.prisma.feedbackTest.create({
      data: {
        subjectId,
        skillId,
        title: buildGreekFeedbackTestTitle(skillName),
        description: buildGreekFeedbackTestDescription(skillName, subject.displayName),
        questions: {
          create: questions.map((statement, index) => ({
            statement,
            orderIndex: index,
          })),
        },
      },
      include: {
        subject: true,
        skill: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    this.logger.log(`Auto-generated feedback test: ${test.title}`);
    return test;
  }

  private async repairEnglishFeedbackTestsForSubject(subjectId: string) {
    const tests = await this.prisma.feedbackTest.findMany({
      where: { subjectId, isActive: true },
      include: {
        subject: true,
        skill: true,
        questions: { orderBy: { orderIndex: 'asc' } },
      },
    });

    for (const test of tests) {
      await this.repairEnglishFeedbackTestIfNeeded(test);
    }
  }

  private async repairEnglishFeedbackTestIfNeeded(test: {
    id: string;
    title: string;
    description: string | null;
    skill?: { displayName: string } | null;
    subject?: { displayName: string } | null;
    questions: { id: string; orderIndex: number; statement: string }[];
  }) {
    if (!isEnglishFeedbackTestContent(test)) {
      return;
    }

    const skillName = test.skill?.displayName || 'δεξιότητες';
    const subjectName = test.subject?.displayName;
    const statements = buildGreekFeedbackTestQuestionsExtended(skillName);

    await this.prisma.feedbackTest.update({
      where: { id: test.id },
      data: {
        title: buildGreekFeedbackTestTitle(skillName),
        description: buildGreekFeedbackTestDescription(skillName, subjectName),
      },
    });

    const sortedQuestions = [...test.questions].sort((a, b) => a.orderIndex - b.orderIndex);
    for (let i = 0; i < sortedQuestions.length; i += 1) {
      await this.prisma.testQuestion.update({
        where: { id: sortedQuestions[i].id },
        data: {
          statement: statements[i] ?? statements[statements.length - 1],
        },
      });
    }

    this.logger.log(`Localized feedback test to Greek: ${test.id}`);
  }

  /**
   * Update feedback test
   */
  async update(id: string, updateFeedbackTestDto: UpdateFeedbackTestDto) {
    const test = await this.findOne(id);
    const { questions, ...testData } = updateFeedbackTestDto;

    // If questions are provided, update them
    if (questions) {
      // Delete existing questions
      await this.prisma.testQuestion.deleteMany({
        where: { testId: id },
      });

      // Create new questions
      await this.prisma.testQuestion.createMany({
        data: questions.map((q, index) => ({
          testId: id,
          statement: q.statement,
          orderIndex: index,
        })),
      });
    }

    // Update test data
    return this.prisma.feedbackTest.update({
      where: { id },
      data: testData,
      include: {
        subject: true,
        skill: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  /**
   * Delete feedback test (soft delete)
   */
  async remove(id: string) {
    await this.findOne(id);
    
    return this.prisma.feedbackTest.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get all tests for a year group (via subjects)
   */
  async findByYearGroup(yearGroupId: string) {
    return this.prisma.feedbackTest.findMany({
      where: {
        isActive: true,
        subject: {
          yearGroupId,
        },
      },
      include: {
        subject: true,
        skill: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }
}
