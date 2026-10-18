import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ժամ վաղվա օրվա համար (ժամ, րոպե)
function tomorrowAt(hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log("🧹 Մաքրում...");
  await prisma.appointmentEquipment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.progressLog.deleteMany();
  await prisma.aiSuggestion.deleteMany();
  await prisma.exerciseAssignment.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.room.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.therapistProfile.deleteMany();
  await prisma.user.deleteMany();

  // Դեմո գաղտնաբառ՝ ՄԻԱՅՆ տեստի համար
  const passwordHash = await bcrypt.hash("Password123!", 10);

  console.log("👤 Օգտատերեր...");
  await prisma.user.create({
    data: {
      email: "admin@rehab.test",
      passwordHash,
      name: "Ադմինիստրատոր",
      role: "ADMIN",
    },
  });

  const t1 = await prisma.user.create({
    data: {
      email: "therapist1@rehab.test",
      passwordHash,
      name: "Արամ Սարգսյան",
      role: "THERAPIST",
      therapistProfile: {
        create: { specialization: "Օրթոպեդիկ վերականգնում" },
      },
    },
    include: { therapistProfile: true },
  });

  const t2 = await prisma.user.create({
    data: {
      email: "therapist2@rehab.test",
      passwordHash,
      name: "Լուսինե Հակոբյան",
      role: "THERAPIST",
      therapistProfile: {
        create: { specialization: "Նյարդաբանական վերականգնում" },
      },
    },
    include: { therapistProfile: true },
  });

  const therapist1 = t1.therapistProfile!;
  const therapist2 = t2.therapistProfile!;

  const patientsData = [
    { email: "patient1@rehab.test", name: "Գևորգ Պետրոսյան", diagnosis: "Ծնկահոդի վնասվածք", therapistId: therapist1.id },
    { email: "patient2@rehab.test", name: "Մարիամ Ղազարյան", diagnosis: "Ողնաշարի օստեոխոնդրոզ", therapistId: therapist1.id },
    { email: "patient3@rehab.test", name: "Տիգրան Ավետիսյան", diagnosis: "Ինսուլտից հետո վերականգնում", therapistId: therapist2.id },
  ];

  const patients = [];
  for (const p of patientsData) {
    const u = await prisma.user.create({
      data: {
        email: p.email,
        passwordHash,
        name: p.name,
        role: "PATIENT",
        patientProfile: {
          create: {
            diagnosis: p.diagnosis,
            therapistId: p.therapistId,
            consentAi: true,
            consentAt: new Date(),
          },
        },
      },
      include: { patientProfile: true },
    });
    patients.push(u.patientProfile!);
  }

  console.log("🏥 Սենյակներ և սարքավորումներ...");
  const room1 = await prisma.room.create({ data: { name: "Սենյակ 101" } });
  const room2 = await prisma.room.create({ data: { name: "Սենյակ 102" } });
  const treadmill = await prisma.equipment.create({
    data: { name: "Վազքուղի", description: "Քայլվածքի վերականգնման համար" },
  });
  await prisma.equipment.create({ data: { name: "Ուլտրաձայնային սարք" } });

  console.log("💪 Վարժություններ...");
  const exSquat = await prisma.exercise.create({
    data: {
      title: "Մասնակի նստացատկեր",
      description: "Ծնկի մկանների ամրապնդում",
      instructions: "Մեջքը ուղիղ պահեք, իջեք մինչև 45°, դանդաղ բարձրացեք։",
      bodyArea: "Ծունկ",
      difficulty: 2,
    },
  });
  const exBridge = await prisma.exercise.create({
    data: {
      title: "Կամուրջ",
      description: "Գոտկային շրջանի և հետույքի մկանների ամրապնդում",
      instructions: "Պառկած դիրքից բարձրացրեք կոնքը, պահեք 5 վայրկյան։",
      bodyArea: "Մեջք",
      difficulty: 1,
    },
  });
  const exGrip = await prisma.exercise.create({
    data: {
      title: "Ափի սեղմում",
      description: "Մատների շարժունակության վերականգնում",
      bodyArea: "Ձեռք",
      difficulty: 1,
    },
  });

  console.log("📋 Նշանակումներ և առաջընթաց...");
  const assignments = [
    { patient: patients[0], therapist: therapist1, exercise: exSquat },
    { patient: patients[1], therapist: therapist1, exercise: exBridge },
    { patient: patients[2], therapist: therapist2, exercise: exGrip },
  ];

  for (const a of assignments) {
    const assignment = await prisma.exerciseAssignment.create({
      data: {
        patientId: a.patient.id,
        therapistId: a.therapist.id,
        exerciseId: a.exercise.id,
        sets: 3,
        reps: 12,
        frequencyPerWeek: 4,
      },
    });

    // վերջին 7 օրվա դեմո առաջընթաց՝ ցավը աստիճանաբար նվազում է
    for (let day = 7; day >= 1; day--) {
      const when = new Date();
      when.setDate(when.getDate() - day);
      await prisma.progressLog.create({
        data: {
          assignmentId: assignment.id,
          patientId: a.patient.id,
          completedAt: when,
          painLevel: Math.max(1, Math.round(8 - (7 - day) * 0.8)),
          setsDone: 3,
          repsDone: 10 + (7 - day),
        },
      });
    }
  }

  console.log("🤖 AI առաջարկ (սպասում է հաստատման)...");
  await prisma.aiSuggestion.create({
    data: {
      patientId: patients[0].id,
      therapistId: therapist1.id,
      type: "EXERCISE_PLAN",
      summary: "Ցավը նվազել է 7-ից 3։ Առաջարկվում է բարդացնել վարժությունը։",
      content: { exerciseId: exSquat.id, sets: 3, reps: 15, note: "Ավելացնել կրկնությունները" },
      model: "demo",
    },
  });

  console.log("📅 Ժամանակացույց...");
  await prisma.appointment.create({
    data: {
      patientId: patients[0].id,
      therapistId: therapist1.id,
      roomId: room1.id,
      startsAt: tomorrowAt(10),
      endsAt: tomorrowAt(11),
      equipment: {
        create: {
          equipmentId: treadmill.id,
          startsAt: tomorrowAt(10),
          endsAt: tomorrowAt(11),
        },
      },
    },
  });

  // ─── Համընկնման արգելքի ստուգում ───
  console.log("\n🔒 Ստուգում՝ թերապևտի կրկնակի ամրագրում (10:30–11:30)...");
  try {
    await prisma.appointment.create({
      data: {
        patientId: patients[1].id, // ուրիշ պացիենտ
        therapistId: therapist1.id, // ՆՈՒՅՆ թերապևտը
        roomId: room2.id, // ուրիշ սենյակ
        startsAt: tomorrowAt(10, 30),
        endsAt: tomorrowAt(11, 30),
      },
    });
    console.log("❌ ՍԽԱԼ՝ համընկնումը ԱՐԳԵԼՎԱԾ ՉԷ (SQL-ը չի ավելացվել migration-ում)");
  } catch {
    console.log("✅ Համընկնումը արգելվել է բազայի կողմից");
  }

  console.log("\n✔ Seed-ը ավարտված է։");
  console.log("  Մուտք՝ admin@rehab.test / therapist1@rehab.test / patient1@rehab.test");
  console.log("  Գաղտնաբառ՝ Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());