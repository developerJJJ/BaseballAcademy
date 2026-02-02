import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authorize, AuthRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';
import { SessionService } from '../services/sessionGenerator';

const router = Router();

// Check-in (Athlete)
router.post('/checkin', authorize([Role.ATHLETE]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id; // Authenticated athlete's USER ID
    
    // 1. Find AthleteProfile
    const athleteProfile = await prisma.athleteProfile.findUnique({
      where: { userId },
    });

    if (!athleteProfile) {
      return res.status(404).json({ error: '선수 프로필을 찾을 수 없습니다.' });
    }

    // 2. Find TODAY's session for this athlete
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let attendance = await prisma.attendance.findFirst({
      where: {
        athleteId: athleteProfile.id,
        session: {
          date: {
            gte: today,
            lt: tomorrow
          },
          academyId: req.user!.academyId
        }
      },
      include: {
          session: {
            include: { template: true }
          }
      }
    });

    if (!attendance) {
      try {
        const newSession = await SessionService.generateAthleteSession(athleteProfile.id, new Date());
        attendance = await prisma.attendance.findFirst({
          where: {
            sessionId: newSession.id,
            athleteId: athleteProfile.id
          },
          include: { 
            session: {
              include: { template: true }
            } 
          }
        });

        if (!attendance) {
           throw new Error('훈련 생성 후 정보를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('Session generation failed:', err);
        return res.status(404).json({ error: '오늘 예정된 훈련이 없으며, 자동 생성에 실패했습니다. 코치에게 문의하세요.' });
      }
    }

    const { conditionScore, hasPain, painArea, workedOutYesterday, sleepHours, sleepQuality, program } = req.body;

    // 3. Determine "Force D" status
    let isForcedToD = false;
    const score = conditionScore ? parseInt(conditionScore) : 5;
    if (score <= 2) isForcedToD = true;
    if (hasPain === true) isForcedToD = true;

    // 4. Update attendance and potentially FORCE session template change
    // Also handle Beginner vs Elite (Beginner = MIN_90, Elite = MIN_120)
    const currentWorkoutType = attendance.session.template.workoutType;
    let targetDuration = attendance.session.template.duration;

    if (isForcedToD) {
      const recoveryTemplate = await prisma.sessionTemplate.findFirst({
        where: {
          academyId: req.user!.academyId,
          workoutType: 'D_RECOVERY',
          duration: program === 'beginner' ? 'MIN_90' : 'MIN_120'
        }
      });
      if (recoveryTemplate) {
        await prisma.session.update({
          where: { id: attendance.sessionId },
          data: { templateId: recoveryTemplate.id }
        });
      }
    } else {
      const newDuration = program === 'beginner' ? 'MIN_90' : 'MIN_120';
      if (newDuration !== attendance.session.template.duration) {
        const matchingTemplate = await prisma.sessionTemplate.findFirst({
          where: {
            academyId: req.user!.academyId,
            workoutType: currentWorkoutType,
            duration: newDuration
          }
        });
        if (matchingTemplate) {
          await prisma.session.update({
            where: { id: attendance.sessionId },
            data: { templateId: matchingTemplate.id }
          });
        }
      }
    }

    await prisma.attendance.update({
      where: { id: attendance.id },
      data: { 
        status: 'PRESENT',
        conditionScore: score,
        hasPain: !!hasPain,
        painArea: painArea || null,
        workedOutYesterday: !!workedOutYesterday,
        sleepHours: sleepHours ? parseInt(sleepHours) : null,
        sleepQuality: sleepQuality || null,
        selectedProgram: program || 'elite',
        isForcedToD
      }
    });

    res.json({ status: 'success', sessionId: attendance.sessionId, isForcedToD });
  } catch (error: any) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: error.message || '서버 오류가 발생했습니다.' });
  }
});

export default router;
