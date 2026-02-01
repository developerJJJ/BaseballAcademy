import { PrismaClient, Role, Level, Frequency, AthleteGroup } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Academy 1
  const academy = await prisma.academy.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Elite Baseball Academy',
    },
  });

  console.log('Academy created:', academy.name);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@elite.com' },
    update: {},
    create: {
      email: 'admin@elite.com',
      password: 'password123', // In real app, hash this
      role: Role.ADMIN,
      firstName: 'James',
      lastName: 'Director',
      academyId: 1,
    },
  });

  console.log('Admin created:', admin.email);

  // Create Coach
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

  console.log('Coach created:', coach.email);

  // Create some drills
  const drill1 = await prisma.drill.create({
    data: {
      name: 'Fastball Accuracy',
      description: 'Focus on hitting the corners',
      category: 'Pitching',
      academyId: 1,
    },
  });

  const drill2 = await prisma.drill.create({
    data: {
      name: 'Power Swing',
      description: 'Focus on hip rotation',
      category: 'Hitting',
      academyId: 1,
    },
  });

  console.log('Drills created');

  // Create a template
  const template = await prisma.sessionTemplate.create({
    data: {
      name: 'HS_L1_2X_TEMPLATE',
      academyId: 1,
      drills: {
        create: [
          { drillId: drill1.id, order: 1, sets: '3', reps: '10' },
          { drillId: drill2.id, order: 2, sets: '3', reps: '15' },
        ],
      },
    },
  });

  console.log('Template created');

  // Create a rule
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
      sessionTemplateId: template.id,
    },
  });

  console.log('Rule created: HS/L1/2X -> HS_L1_2X_TEMPLATE');

  // Create Athlete
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

  console.log('Athlete created:', athleteUser.email);

  // Generate a session for today
  await prisma.session.create({
    data: {
      date: new Date(),
      templateId: template.id,
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

  console.log('Sample session generated for today');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
