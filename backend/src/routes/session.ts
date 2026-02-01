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
      session: {
        include: {
          template: {
            include: {
              drills: { include: { drill: true } }
            }
          }
        }
      }
    }
  });
  res.json(attendance.map(a => a.session));
});

export default router;
