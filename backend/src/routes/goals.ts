import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authorize, AuthRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authorize([Role.COACH, Role.ADMIN]), async (req: AuthRequest, res) => {
  const goals = await prisma.weeklyGoal.findMany({
    where: { athlete: { user: { academyId: req.user!.academyId } } },
    include: { athlete: { include: { user: true } } }
  });
  res.json(goals);
});

router.post('/', authorize([Role.COACH, Role.ADMIN]), async (req: AuthRequest, res) => {
  const { athleteId, goalType, targetValue, currentValue, memo } = req.body;
  const goal = await prisma.weeklyGoal.create({
    data: {
      athleteId: parseInt(athleteId),
      goalType,
      targetValue: parseFloat(targetValue),
      currentValue: parseFloat(currentValue),
      memo,
      status: 'IN_PROGRESS'
    }
  });
  res.json(goal);
});

// PUT update goal
router.put('/:id', authorize([Role.COACH, Role.ADMIN]), async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const { goalType, targetValue, currentValue, memo, status } = req.body;
  
  const goal = await prisma.weeklyGoal.update({
    where: { id: parseInt(id) },
    data: {
      goalType,
      targetValue: parseFloat(targetValue),
      currentValue: parseFloat(currentValue),
      memo,
      status
    }
  });
  res.json(goal);
});

// DELETE goal
router.delete('/:id', authorize([Role.COACH, Role.ADMIN]), async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  await prisma.weeklyGoal.delete({
    where: { id: parseInt(id) }
  });
  res.json({ status: 'success' });
});

export default router;
