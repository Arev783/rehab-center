-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PATIENT', 'THERAPIST', 'ADMIN');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AiSuggestionType" AS ENUM ('EXERCISE_PLAN', 'PROGRESS_SUMMARY', 'ALERT');

-- CreateEnum
CREATE TYPE "AiSuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "diagnosis" TEXT,
    "notes" TEXT,
    "consentAi" BOOLEAN NOT NULL DEFAULT false,
    "consentAt" TIMESTAMP(3),
    "therapistId" TEXT,

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapist_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "bio" TEXT,

    CONSTRAINT "therapist_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_equipment" (
    "appointmentId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "appointment_equipment_pkey" PRIMARY KEY ("appointmentId","equipmentId")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT,
    "bodyArea" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "videoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_assignments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sets" INTEGER NOT NULL DEFAULT 3,
    "reps" INTEGER NOT NULL DEFAULT 10,
    "durationMin" INTEGER,
    "frequencyPerWeek" INTEGER NOT NULL DEFAULT 3,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_logs" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "painLevel" INTEGER NOT NULL,
    "setsDone" INTEGER,
    "repsDone" INTEGER,
    "comment" TEXT,

    CONSTRAINT "progress_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_suggestions" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "therapistId" TEXT,
    "type" "AiSuggestionType" NOT NULL,
    "summary" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "status" "AiSuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "therapistNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patient_profiles_userId_key" ON "patient_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "therapist_profiles_userId_key" ON "therapist_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_name_key" ON "rooms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_name_key" ON "equipment"("name");

-- CreateIndex
CREATE INDEX "appointments_therapistId_startsAt_idx" ON "appointments"("therapistId", "startsAt");

-- CreateIndex
CREATE INDEX "appointments_patientId_startsAt_idx" ON "appointments"("patientId", "startsAt");

-- CreateIndex
CREATE INDEX "appointments_roomId_startsAt_idx" ON "appointments"("roomId", "startsAt");

-- CreateIndex
CREATE INDEX "exercise_assignments_patientId_status_idx" ON "exercise_assignments"("patientId", "status");

-- CreateIndex
CREATE INDEX "progress_logs_patientId_completedAt_idx" ON "progress_logs"("patientId", "completedAt");

-- CreateIndex
CREATE INDEX "ai_suggestions_therapistId_status_idx" ON "ai_suggestions"("therapistId", "status");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "therapist_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapist_profiles" ADD CONSTRAINT "therapist_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "therapist_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_equipment" ADD CONSTRAINT "appointment_equipment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_equipment" ADD CONSTRAINT "appointment_equipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_assignments" ADD CONSTRAINT "exercise_assignments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_assignments" ADD CONSTRAINT "exercise_assignments_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "therapist_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_assignments" ADD CONSTRAINT "exercise_assignments_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_logs" ADD CONSTRAINT "progress_logs_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "exercise_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_logs" ADD CONSTRAINT "progress_logs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "therapist_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ═════ Ժամանակի համընկնման արգելքներ ═════
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_time_check" CHECK ("endsAt" > "startsAt");

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_no_therapist_overlap"
  EXCLUDE USING gist (
    "therapistId" WITH =,
    tstzrange("startsAt", "endsAt", '[)') WITH &&
  ) WHERE ("status" <> 'CANCELLED');

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_no_room_overlap"
  EXCLUDE USING gist (
    "roomId" WITH =,
    tstzrange("startsAt", "endsAt", '[)') WITH &&
  ) WHERE ("status" <> 'CANCELLED');

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_no_patient_overlap"
  EXCLUDE USING gist (
    "patientId" WITH =,
    tstzrange("startsAt", "endsAt", '[)') WITH &&
  ) WHERE ("status" <> 'CANCELLED');

ALTER TABLE "appointment_equipment"
  ADD CONSTRAINT "equipment_time_check" CHECK ("endsAt" > "startsAt");

ALTER TABLE "appointment_equipment"
  ADD CONSTRAINT "appointment_equipment_no_overlap"
  EXCLUDE USING gist (
    "equipmentId" WITH =,
    tstzrange("startsAt", "endsAt", '[)') WITH &&
  );