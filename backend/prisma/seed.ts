import { PrismaClient, Role, Level, Frequency, AthleteGroup, DrillCategory, WorkoutType, SessionDuration } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (optional but recommended for clean seed)
  // await prisma.attendance.deleteMany();
  // ... and so on

  // Academy 1
  const academy = await prisma.academy.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Elite Baseball Academy',
    },
  });

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@elite.com' },
    update: {},
    create: {
      email: 'admin@elite.com',
      password: 'password123',
      role: Role.ADMIN,
      firstName: 'James',
      lastName: 'Director',
      academyId: 1,
    },
  });

  // Coach
  const coach = await prisma.user.upsert({
    where: { email: 'coach1@elite.com' },
    update: {},
    create: {
      email: 'coach1@elite.com',
      password: 'password123',
      role: Role.COACH,
      firstName: 'John',
      lastName: 'Coach',
      academyId: 1,
    },
  });

  // Drills with SOP Categories
  const drillsData = [
    { name: 'Linear Acceleration', category: DrillCategory.SPRINT, desc: '60ft sprints' },
    { name: 'Box Jumps', category: DrillCategory.JUMP, desc: 'L0 focusing on landing safety' },
    { name: 'Long Toss', category: DrillCategory.THROWING, desc: 'Arm care emphasis' },
    { name: 'Hip Mobility', category: DrillCategory.MOVEMENT, desc: 'Standard movement drills' },
    { name: 'Medicine Ball Rotational', category: DrillCategory.CONDITIONING, desc: 'Rotational power' },
  ];

  const drills = [];
  for (const d of drillsData) {
    const drill = await prisma.drill.create({
      data: {
        name: d.name,
        category: d.category,
        description: d.desc,
        academyId: 1,
      },
    });
    drills.push(drill);
  }

  // Templates for A/B/C/D Menu
  const templates = [
    { name: 'HS_L1_60m_A_Lower', type: WorkoutType.A_LOWER, duration: SessionDuration.MIN_60 },
    { name: 'HS_L1_60m_B_Upper', type: WorkoutType.B_UPPER, duration: SessionDuration.MIN_60 },
    { name: 'HS_L1_60m_C_Speed', type: WorkoutType.C_SPEED, duration: SessionDuration.MIN_60 },
    { name: 'RECOVERY_D_STANDARD', type: WorkoutType.D_RECOVERY, duration: SessionDuration.MIN_60 },
  ];

  const createdTemplates = [];
  for (const t of templates) {
    const template = await prisma.sessionTemplate.create({
      data: {
        name: t.name,
        workoutType: t.type,
        duration: t.duration,
        academyId: 1,
        drills: {
          create: [
            { drillId: drills[0].id, order: 1, sets: '3', reps: '5' },
            { drillId: drills[1].id, order: 2, sets: '4', reps: '10' },
          ],
        },
      },
    });
    createdTemplates.push(template);
  }

  // Athlete Bobby
  const athleteUser = await prisma.user.upsert({
    where: { email: 'athlete1@elite.com' },
    update: {},
    create: {
      email: 'athlete1@elite.com',
      password: 'password123',
      role: Role.ATHLETE,
      firstName: 'Bobby',
      lastName: 'Ballplayer',
      academyId: 1,
    },
  });

  const athleteProfile = await prisma.athleteProfile.upsert({
    where: { userId: athleteUser.id },
    update: {},
    create: {
      userId: athleteUser.id,
      level: Level.L1,
      frequency: Frequency.F2X,
      group: AthleteGroup.HS,
    },
  });

  // Basic Rule mapping for Bobby (HS/L1/2x) -> A_LOWER today
  await prisma.rule.upsert({
    where: {
      academyId_level_frequency_group: {
        academyId: 1,
        level: Level.L1,
        frequency: Frequency.F2X,
        group: AthleteGroup.HS,
      },
    },
    update: {},
    create: {
      academyId: 1,
      level: Level.L1,
      frequency: Frequency.F2X,
      group: AthleteGroup.HS,
      sessionTemplateId: createdTemplates[0].id,
    },
  });

  // Example Session for Today
  await prisma.session.create({
    data: {
      date: new Date(),
      templateId: createdTemplates[0].id,
      coachId: coach.id,
      academyId: 1,
      attendance: {
        create: {
          athleteId: athleteProfile.id,
          status: 'PENDING',
        },
      },
    },
  });

  console.log('Seed completed with SOP architecture.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
