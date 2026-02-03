import { PrismaClient, Role, Level, Frequency, AthleteGroup, DrillCategory, WorkoutType, SessionDuration } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

import path from 'path';

dotenv.config();

const getDbPath = () => {
    if (process.env.DATABASE_URL) {
        return path.resolve(process.cwd(), process.env.DATABASE_URL.replace('file:', ''));
    }
    const relativePath = process.cwd().endsWith('backend') ? 'prisma/dev.db' : 'backend/prisma/dev.db';
    return path.resolve(process.cwd(), relativePath);
};

const dbPath = getDbPath();
console.log('--- SEED Resolved Database Path:', dbPath);
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });
console.log('--- SEED Prisma Client Active ---');

async function main() {
  // Clear existing data in correct order
  await prisma.drillCompletion.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.session.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.templateDrill.deleteMany();
  await prisma.sessionTemplate.deleteMany();
  await prisma.drill.deleteMany();
  await prisma.weeklyGoal.deleteMany();
  await prisma.rapsodoData.deleteMany();
  await prisma.parentAthlete.deleteMany();
  await prisma.athleteProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.academy.deleteMany();

  // Academy 1
  const academy = await prisma.academy.create({
    data: { id: 1, name: 'King Kang Baseball Academy' },
  });

  // Admin (ID 8)
  await prisma.user.create({
    data: {
      id: 8,
      email: 'admin@elite.com',
      password: 'password123',
      role: Role.ADMIN,
      firstName: '제임스',
      lastName: '원장',
      academyId: 1,
    },
  });

  // Coach (ID 5)
  const coach = await prisma.user.create({
    data: {
      id: 5,
      email: 'coach1@elite.com',
      password: 'password123',
      role: Role.COACH,
      firstName: '박코치',
      lastName: '',
      academyId: 1,
    },
  });

  // Athlete (ID 6) - 김민수
  const athleteUser = await prisma.user.create({
    data: {
      id: 6,
      email: 'athlete1@elite.com',
      password: 'password123',
      role: Role.ATHLETE,
      firstName: '김민수',
      lastName: '',
      academyId: 1,
    },
  });

  const athleteProfile = await prisma.athleteProfile.create({
    data: {
      id: 5, // profile id
      userId: athleteUser.id,
      level: Level.L1,
      frequency: Frequency.F2X,
      group: AthleteGroup.HS,
    },
  });

  // Parent (ID 9) - 김학부모
  const parentUser = await prisma.user.create({
    data: {
      id: 9,
      email: 'parent1@elite.com',
      password: 'password123',
      role: Role.PARENT,
      firstName: '김학부모',
      lastName: '',
      academyId: 1,
    }
  });

  // Link Parent to Athlete
  await prisma.parentAthlete.create({
    data: {
      parentId: parentUser.id,
      athleteId: athleteUser.id
    }
  });

  // Drills
  const drillsData = [
    { name: '데드리프트', nameEn: 'Deadlift', category: DrillCategory.CONDITIONING, desc: '후면 체인 강화를 위한 데드리프트', descEn: 'Deadlift for strengthening the posterior chain', reps: '10', sets: '4', rest: '180' },
    { name: '메디신볼 슬램', nameEn: 'Medicine Ball Slam', category: DrillCategory.CONDITIONING, desc: '폭발적인 파워 발달을 위한 메디신볼 운동', descEn: 'Medicine ball exercise for explosive power development', reps: '15', sets: '3', rest: '120' },
    { name: '라이브 BP', nameEn: 'Live BP', category: DrillCategory.THROWING, desc: '실전과 유사한 투구를 받아 타격 연습', descEn: 'Batting practice receiving pitches similar to real games', reps: '10', sets: '3', rest: '180' },
    { name: '배트 스피드 드릴', nameEn: 'Bat Speed Drill', category: DrillCategory.THROWING, desc: '가벼운 배트로 스윙 속도 향상', descEn: 'Improving swing speed with a light bat', reps: '25', sets: '3', rest: '90' },
    { name: '소프트 토스', nameEn: 'Soft Toss', category: DrillCategory.THROWING, desc: '측면에서 던져진 공을 타격하여 손-눈 협응력 향상', descEn: 'Improving hand-eye coordination by hitting balls tossed from the side', reps: '15', sets: '3', rest: '90' },
    { name: '불펜 투구', nameEn: 'Bullpen Session', category: DrillCategory.CONDITIONING, desc: '실전 투구 연습', descEn: 'Real-game pitching practice', reps: '30', sets: '2', rest: '300' },
  ];

  const drillIds: number[] = [];
  for (const d of drillsData) {
    const drill = await prisma.drill.create({
      data: { 
        name: d.name, 
        nameEn: d.nameEn,
        category: d.category, 
        description: d.desc, 
        descriptionEn: d.descEn,
        baseReps: d.reps, 
        baseSets: d.sets, 
        baseRest: d.rest, 
        academyId: 1 
      },
    });
    drillIds.push(drill.id);
  }

  const types = [WorkoutType.A_LOWER, WorkoutType.B_UPPER, WorkoutType.C_SPEED, WorkoutType.D_RECOVERY];
  const durations = [SessionDuration.MIN_45, SessionDuration.MIN_60, SessionDuration.MIN_75, SessionDuration.MIN_90, SessionDuration.MIN_120];

  const templateMap: any = {};
  for (const type of types) {
    for (const duration of durations) {
      const template = await prisma.sessionTemplate.create({
        data: {
          name: `${type}_${duration}_TEMPLATE`,
          workoutType: type,
          duration: duration,
          academyId: 1,
          drills: {
            create: drillsData.map((d, i) => ({
              drillId: drillIds[i],
              order: i + 1,
              sets: d.sets,
              reps: d.reps,
              notes: d.rest
            }))
          }
        }
      });
      templateMap[`${type}_${duration}`] = template.id;
    }
  }

  // Rule mapping
  await prisma.rule.create({
    data: {
      academyId: 1, level: Level.L1, frequency: Frequency.F2X, group: AthleteGroup.HS,
      sessionTemplateId: templateMap[`${WorkoutType.A_LOWER}_${SessionDuration.MIN_120}`],
    },
  });

  // Today's Session
  await prisma.session.create({
    data: {
      date: new Date(),
      templateId: templateMap[`${WorkoutType.A_LOWER}_${SessionDuration.MIN_120}`],
      coachId: coach.id,
      academyId: 1,
      attendance: { create: { athleteId: athleteProfile.id, status: 'PENDING' } },
    },
  });

  console.log('Seed completed with correct names and links.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
