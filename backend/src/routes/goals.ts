import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authorize, AuthRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// Athlete: get own goals
router.get('/mine', authorize([Role.ATHLETE]), async (req: AuthRequest, res) => {
  try {
    const athleteProfile = await prisma.athleteProfile.findFirst({
      where: { userId: req.user!.id }
    });
    if (!athleteProfile) {
      return res.json([]);
    }
    const goals = await prisma.weeklyGoal.findMany({
      where: { athleteId: athleteProfile.id },
      include: { athlete: { include: { user: true } } }
    });
    res.json(goals);
  } catch (err) {
    console.error('Error fetching athlete goals:', err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

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
