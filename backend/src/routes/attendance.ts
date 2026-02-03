import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authorize, AuthRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';
import { SessionService } from '../services/sessionGenerator';

const router = Router();

// Check-in (Athlete)
router.post('/checkin', authorize([Role.ATHLETE]), async (req: AuthRequest, res) => {
  console.log('--- RECEIVED CHECKIN REQUEST:', req.body);
  try {
    const userId = req.user!.id; // Authenticated athlete's USER ID
    
    // 1. Find AthleteProfile
    console.log('--- Step 1: Finding athlete profile for user:', userId);
    const athleteProfile = await prisma.athleteProfile.findUnique({
      where: { userId },
    });
    console.log('--- Step 2: Found profile:', !!athleteProfile);

    if (!athleteProfile) {
      return res.status(404).json({ error: '선수 프로필을 찾을 수 없습니다.' });
    }

    // 2. Find TODAY's session for this athlete
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('--- Step 3: Finding attendance for today...', today.toISOString());
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
    console.log('--- Step 4: Found attendance:', !!attendance);

    if (!attendance) {
      try {
        console.log('--- Step 5: No attendance found, generating new session...');
        const newSession = await SessionService.generateAthleteSession(athleteProfile.id, new Date());
        console.log('--- Step 6: New session generated, finding attendance again...');
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
    const score = conditionScore ? parseInt(conditionScore) : 5; // Initialize score here for logging
    console.log('--- Step 7: Determining Force D status. Score:', score, 'Pain:', hasPain);
    let isForcedToD = false;
    if (score <= 2) isForcedToD = true;
    if (hasPain === true) isForcedToD = true;

    // 4. Update attendance and potentially FORCE session template change
    // Also handle Beginner vs Elite (Beginner = MIN_90, Elite = MIN_120)
    const currentWorkoutType = attendance.session.template.workoutType;
    let targetDuration = attendance.session.template.duration;

    console.log('--- Step 8: Checking if Force D is required:', isForcedToD);
    if (isForcedToD) {
      console.log('--- Step 9: Finding Recovery template for program:', program);
      const recoveryTemplate = await prisma.sessionTemplate.findFirst({
        where: {
          academyId: req.user!.academyId,
          workoutType: 'D_RECOVERY',
          duration: program === 'beginner' ? 'MIN_90' : 'MIN_120'
        }
      });
      console.log('--- Step 10: Found recovery template:', !!recoveryTemplate);
      if (recoveryTemplate) {
        await prisma.session.update({
          where: { id: attendance.sessionId },
          data: { templateId: recoveryTemplate.id }
        });
        console.log('--- Step 11: Session updated to Recovery.');
      }
    } else {
      const newDuration = program === 'beginner' ? 'MIN_90' : 'MIN_120';
      console.log('--- Step 12: Normal check-in. Checking duration update:', newDuration);
      if (newDuration !== attendance.session.template.duration) {
        const matchingTemplate = await prisma.sessionTemplate.findFirst({
          where: {
            academyId: req.user!.academyId,
            workoutType: currentWorkoutType,
            duration: newDuration
          }
        });
        console.log('--- Step 13: Found matching template for new duration:', !!matchingTemplate);
        if (matchingTemplate) {
          await prisma.session.update({
            where: { id: attendance.sessionId },
            data: { templateId: matchingTemplate.id }
          });
          console.log('--- Step 14: Session duration updated.');
        }
      }
    }

    console.log('--- Step 15: Updating attendance record...');
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
    console.log('--- Step 16: Attendance record updated. Sending response.');

    res.json({ status: 'success', sessionId: attendance.sessionId, isForcedToD });
  } catch (error: any) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: error.message || '서버 오류가 발생했습니다.' });
  }
});

export default router;
