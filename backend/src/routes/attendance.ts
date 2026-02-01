import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authorize, AuthRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// Check-in (Athlete)
router.post('/checkin', authorize([Role.ATHLETE]), async (req: AuthRequest, res) => {
  const userId = req.user!.id; // Authenticated athlete's USER ID
  
  // 1. Find AthleteProfile
  const athleteProfile = await prisma.athleteProfile.findUnique({
    where: { userId },
  });

  if (!athleteProfile) {
    res.status(404).json({ error: 'Athlete profile not found' });
    return;
  }

  // 2. Find TODAY's session for this athlete
  // We look for an attendance record for TODAY (or specifically pending/active)
  // Logic: Session should be today.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  console.log(`Checkin Request - UserID: ${userId}, AthleteID: ${athleteProfile.id}, Today: ${today.toISOString()}`);

  const attendance = await prisma.attendance.findFirst({
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
        session: true
    }
  });
  
  console.log('Attendance found:', attendance ? 'YES' : 'NO');

  if (!attendance) {
    // Optional: Auto-generate session if missing? 
    // For now, return error or specific "No Session" status.
    res.status(404).json({ error: 'No session scheduled for today.' });
    return;
  }

  if (attendance.status === 'PRESENT' || attendance.status === 'COMPLETED') {
    res.json({ message: 'Already checked in', sessionId: attendance.sessionId });
    return;
  }

  // 3. Mark as PRESENT
  await prisma.attendance.update({
    where: { id: attendance.id },
    data: { status: 'PRESENT' }
  });

  res.json({ status: 'success', sessionId: attendance.sessionId });
});

export default router;
