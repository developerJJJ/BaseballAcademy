import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authorize, AuthRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// Parents fetch their children's summary
router.get('/children', authorize([Role.PARENT]), async (req: AuthRequest, res) => {
  const parentId = req.user!.id;

  const links = await prisma.parentAthlete.findMany({
    where: { parentId },
    include: {
      athlete: {
        include: {
          athleteProfile: {
            include: {
              attendance: {
                include: {
                  drillCompletions: true,
                  session: {
                    include: {
                      template: {
                        include: { drills: true }
                      }
                    }
                  }
                },
                orderBy: { session: { date: 'desc' } }
              }
            }
          }
        }
      }
    }
  });

  const childrenData = links.map(link => {
    const profile = link.athlete.athleteProfile!;
    const attendance = profile.attendance;
    
    // Calculate simple stats
    const totalDrills = attendance.reduce((sum, att) => sum + att.session.template.drills.length, 0);
    const completedDrills = attendance.reduce((sum, att) => sum + att.drillCompletions.length, 0);
    const totalTrainingTime = attendance.reduce((sum, att) => {
        const duration = att.session.template.duration;
        const mins = duration === 'MIN_120' ? 120 : duration === 'MIN_75' ? 75 : 60;
        return sum + mins;
    }, 0);

    return {
      id: profile.id,
      name: `${link.athlete.firstName} ${link.athlete.lastName}`,
      age: 16, // Mock for demo
      stats: {
        attendanceRate: attendance.length > 0 ? 100 : 0,
        totalTime: totalTrainingTime,
        completedDrills: completedDrills,
        totalDrills: totalDrills,
        completionRate: totalDrills > 0 ? Math.round((completedDrills / totalDrills) * 100) : 0
      },
      history: attendance.map(att => ({
        date: att.session.date,
        status: att.status
      }))
    };
  });

  res.json(childrenData);
});

export default router;
