import { prisma } from '../lib/prisma';
import { Level, Frequency, AthleteGroup } from '@prisma/client';

export class RuleEngineService {
  static async resolveTemplate(
    academyId: number,
    level: Level,
    frequency: Frequency,
    group: AthleteGroup
  ) {
    const rule = await prisma.rule.findUnique({
      where: {
        academyId_level_frequency_group: {
          academyId,
          level,
          frequency,
          group,
        },
      },
      include: {
        template: {
          include: {
            drills: {
              include: {
                drill: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (!rule) {
      throw new Error(`No rule found for academy ${academyId}: ${level}/${frequency}/${group}`);
    }

    return rule.template;
  }
}
