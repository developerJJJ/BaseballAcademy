import { prisma } from '../lib/prisma';
import { RuleEngineService } from './ruleEngine';
import { Level, Frequency, AthleteGroup } from '@prisma/client';

export class SessionService {
  /**
   * Generates a single session for an athlete based on their classification rules.
   * In a real scenario, this would check if a session already exists for that day/time.
   */
  static async generateAthleteSession(athleteId: number, date: Date) {
    const athlete = await prisma.athleteProfile.findUnique({
      where: { id: athleteId },
      include: { user: true },
    });

    if (!athlete) throw new Error('Athlete not found');

    const template = await RuleEngineService.resolveTemplate(
      athlete.user.academyId,
      athlete.level,
      athlete.frequency,
      athlete.group
    );

    // Find an available coach in the academy
    const coach = await prisma.user.findFirst({
      where: { academyId: athlete.user.academyId, role: 'COACH' },
    });

    if (!coach) throw new Error('No coach available in academy');

    return prisma.session.create({
      data: {
        date,
        templateId: template.id,
        coachId: coach.id,
        academyId: athlete.user.academyId,
        attendance: {
          create: {
            athleteId: athlete.id,
            status: 'PENDING',
          },
        },
      },
    });
  }
}
