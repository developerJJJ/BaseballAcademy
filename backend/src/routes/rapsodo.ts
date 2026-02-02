import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authorize, AuthRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authorize([Role.COACH, Role.ADMIN]), async (req: AuthRequest, res) => {
  const data = await prisma.rapsodoData.findMany({
    where: { athlete: { user: { academyId: req.user!.academyId } } },
    include: { athlete: { include: { user: true } } },
    orderBy: { date: 'desc' }
  });
  res.json(data);
});

router.post('/', authorize([Role.COACH, Role.ADMIN]), async (req: AuthRequest, res) => {
  try {
    const { athleteId, batSpeed, exitVelocity, launchAngle, distance, attackAngle, contactTime, memo } = req.body;
    
    if (!athleteId) {
      return res.status(400).json({ error: 'Athlete ID is required' });
    }

    const safeParseFloat = (val: any) => {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    };

    const entry = await prisma.rapsodoData.create({
      data: {
        athleteId: parseInt(athleteId),
        batSpeed: safeParseFloat(batSpeed),
        exitVelocity: safeParseFloat(exitVelocity),
        launchAngle: safeParseFloat(launchAngle),
        distance: safeParseFloat(distance),
        attackAngle: safeParseFloat(attackAngle),
        contactTime: safeParseFloat(contactTime),
        memo
      }
    });
    res.json(entry);
  } catch (error: any) {
    console.error('Rapsodo creation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error', details: error });
  }
});

// PUT update rapsodo data
router.put('/:id', authorize([Role.COACH, Role.ADMIN]), async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const { batSpeed, exitVelocity, launchAngle, distance, attackAngle, contactTime, memo } = req.body;
  
  const entry = await prisma.rapsodoData.update({
    where: { id: parseInt(id) },
    data: {
      batSpeed: batSpeed ? parseFloat(batSpeed) : null,
      exitVelocity: exitVelocity ? parseFloat(exitVelocity) : null,
      launchAngle: launchAngle ? parseFloat(launchAngle) : null,
      distance: distance ? parseFloat(distance) : null,
      attackAngle: attackAngle ? parseFloat(attackAngle) : null,
      contactTime: contactTime ? parseFloat(contactTime) : null,
      memo
    }
  });
  res.json(entry);
});

// DELETE rapsodo data
router.delete('/:id', authorize([Role.COACH, Role.ADMIN]), async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  await prisma.rapsodoData.delete({
    where: { id: parseInt(id) }
  });
  res.json({ status: 'success' });
});

export default router;
