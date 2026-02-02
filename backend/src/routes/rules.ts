import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authorize, AuthRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// GET all rules for the academy
router.get('/', authorize([Role.ADMIN]), async (req: AuthRequest, res) => {
  const rules = await prisma.rule.findMany({
    where: { academyId: req.user!.academyId },
    include: {
      template: true
    }
  });
  res.json(rules);
});

// POST new rule
router.post('/', authorize([Role.ADMIN]), async (req: AuthRequest, res) => {
  try {
    const { level, frequency, group, sessionTemplateId } = req.body;
    
    // Check if rule already exists (unique constraint)
    const existing = await prisma.rule.findUnique({
      where: {
        academyId_level_frequency_group: {
          academyId: req.user!.academyId,
          level,
          frequency,
          group
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: '이 분류 조합에 대한 규칙이 이미 존재합니다.' });
    }

    const rule = await prisma.rule.create({
      data: {
        level,
        frequency,
        group,
        sessionTemplateId: parseInt(sessionTemplateId),
        academyId: req.user!.academyId
      }
    });
    res.json(rule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update rule
router.put('/:id', authorize([Role.ADMIN]), async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { level, frequency, group, sessionTemplateId } = req.body;
    
    const rule = await prisma.rule.update({
      where: { id: parseInt(id) },
      data: {
        level,
        frequency,
        group,
        sessionTemplateId: parseInt(sessionTemplateId)
      }
    });
    res.json(rule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE rule
router.delete('/:id', authorize([Role.ADMIN]), async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    await prisma.rule.delete({
      where: { id: parseInt(id) }
    });
    res.json({ status: 'success' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
