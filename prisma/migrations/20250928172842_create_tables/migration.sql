-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'ACTIVE', 'FINISHED');

-- CreateEnum
CREATE TYPE "public"."AudienceEnum" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'TEACHER', 'USER_UNIFESSPA', 'USER_COMUNITY');

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "overview" TEXT,
    "description" TEXT,
    "expected_results" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "duration" TIMESTAMP(3) NOT NULL,
    "proposal_document_url" TEXT,
    "img_url" TEXT,
    "registration_form_url" TEXT,
    "numberVacancies" INTEGER NOT NULL,
    "status" "public"."ProjectStatus" NOT NULL,
    "audience" "public"."AudienceEnum" NOT NULL,
    "courseId" INTEGER,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Keywords" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" INTEGER,

    CONSTRAINT "Keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImpactIndicators" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "projectId" INTEGER,

    CONSTRAINT "ImpactIndicators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Keywords" ADD CONSTRAINT "Keywords_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpactIndicators" ADD CONSTRAINT "ImpactIndicators_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
