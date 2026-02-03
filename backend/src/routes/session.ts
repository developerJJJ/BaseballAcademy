import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authorize, AuthRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// Coaches see sessions they are running
router.get('/coach', authorize([Role.COACH]), async (req: AuthRequest, res) => {
  const sessions = await prisma.session.findMany({
    where: { 
      coachId: req.user!.id,
      academyId: req.user!.academyId 
    },
    include: {
      template: {
        include: {
          drills: { include: { drill: true } }
        }
      },
      attendance: {
        include: {
          athlete: { include: { user: true } }
        }
      }
    }
  });
  res.json(sessions);
});

// Athletes see their sessions
router.get('/athlete', authorize([Role.ATHLETE]), async (req: AuthRequest, res) => {
  const attendance = await prisma.attendance.findMany({
    where: {
      athlete: { userId: req.user!.id }
    },
    include: {
      drillCompletions: true,
      session: {
        include: {
          template: {
            include: {
              drills: { 
                include: { drill: true },
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      }
    }
  });
  
  // Flatten to include completions in the session object for frontend ease
  res.json(attendance.map((a: any) => ({
    ...a.session,
    attendanceId: a.id,
    selectedProgram: a.selectedProgram,
    completedDrillIds: a.drillCompletions.map((c: any) => c.drillId)
  })));
});

// Mark a drill as completed
router.post('/complete-drill', authorize([Role.ATHLETE]), async (req: AuthRequest, res) => {
  const { attendanceId, drillId } = req.body;

  if (!attendanceId || !drillId) {
    res.status(400).json({ error: 'Missing attendanceId or drillId' });
    return;
  }

  // Create completion record
  const completion = await prisma.drillCompletion.create({
    data: {
      attendanceId: parseInt(attendanceId),
      drillId: parseInt(drillId)
    }
  });

  res.json({ status: 'success', completion });
});

// Update session setup (Coach Override)
router.patch('/:id/setup', authorize([Role.COACH, Role.ADMIN]), async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const { workoutType, duration } = req.body;

  try {
    // Find a template that matches the new requirements for this academy
    const matchingTemplate = await prisma.sessionTemplate.findFirst({
      where: {
        academyId: req.user!.academyId,
        workoutType: workoutType,
        duration: duration
      }
    });

    if (!matchingTemplate) {
      return res.status(404).json({ error: '해당 조건에 맞는 훈련 템플릿이 없습니다.' });
    }

    const updatedSession = await prisma.session.update({
      where: { id: parseInt(id) },
      data: { templateId: matchingTemplate.id },
      include: { template: true }
    });

    res.json(updatedSession);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
