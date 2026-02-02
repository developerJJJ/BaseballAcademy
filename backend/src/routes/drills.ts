import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authorize, AuthRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// GET all drills for the academy
router.get('/', authorize([Role.COACH, Role.ADMIN]), async (req: AuthRequest, res) => {
  const drills = await prisma.drill.findMany({
    where: { academyId: req.user!.academyId },
    orderBy: { category: 'asc' }
  });
  res.json(drills);
});

// GET all session templates
router.get('/templates', authorize([Role.ADMIN, Role.COACH]), async (req: AuthRequest, res) => {
  const templates = await prisma.sessionTemplate.findMany({
    where: { academyId: req.user!.academyId }
  });
  res.json(templates);
});

// POST new drill
router.post('/', authorize([Role.COACH, Role.ADMIN]), async (req: AuthRequest, res) => {
  try {
    const { name, category, description, videoUrl, difficulty, cue1, cue2, cue3, baseReps, baseSets, baseRest } = req.body;
    const drill = await prisma.drill.create({
      data: {
        name,
        category,
        description,
        videoUrl,
        difficulty: parseInt(difficulty) || 1,
        cue1, cue2, cue3,
        baseReps, baseSets, baseRest,
        academyId: req.user!.academyId
      }
    });
    res.json(drill);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update drill
router.put('/:id', authorize([Role.COACH, Role.ADMIN]), async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { name, category, description, videoUrl, difficulty, cue1, cue2, cue3, baseReps, baseSets, baseRest } = req.body;
    
    const drill = await prisma.drill.update({
      where: { id: parseInt(id) },
      data: {
        name,
        category,
        description,
        videoUrl,
        difficulty: parseInt(difficulty) || 1,
        cue1, cue2, cue3,
        baseReps, baseSets, baseRest
      }
    });
    res.json(drill);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE drill
router.delete('/:id', authorize([Role.COACH, Role.ADMIN]), async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  
  // Note: In production, check for TemplateDrill dependencies first
  await prisma.templateDrill.deleteMany({ where: { drillId: parseInt(id) } });
  
  await prisma.drill.delete({
    where: { id: parseInt(id) }
  });
  res.json({ status: 'success' });
});

export default router;
