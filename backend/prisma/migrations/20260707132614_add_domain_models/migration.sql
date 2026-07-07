-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "SurveyFieldType" AS ENUM ('TEXT', 'LONG_TEXT', 'SELECT');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohorts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "application_start" DATE NOT NULL,
    "application_end" DATE NOT NULL,
    "practice_start" DATE NOT NULL,
    "practice_end" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_fields" (
    "id" SERIAL NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "type" "SurveyFieldType" NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_roles" (
    "id" SERIAL NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohort_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "review_comment" TEXT,
    "role_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_answers" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "survey_field_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_tasks" (
    "id" SERIAL NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_document_data" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "student_fio" TEXT,
    "group" TEXT,
    "direction_code" TEXT,
    "direction_name" TEXT,
    "program_name" TEXT,
    "specialty" TEXT,
    "practice_topic" TEXT,
    "main_stage_tasks" TEXT,
    "review_activities" TEXT,
    "review_characteristic" TEXT,
    "review_employed" TEXT,
    "review_next_practice" TEXT,
    "review_employment_offer" TEXT,
    "review_suggestions" TEXT,
    "review_grade" TEXT,
    "report_file_url" TEXT,
    "report_admin_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_document_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_cards" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "artifact_link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "survey_fields_cohort_id_idx" ON "survey_fields"("cohort_id");

-- CreateIndex
CREATE INDEX "cohort_roles_cohort_id_idx" ON "cohort_roles"("cohort_id");

-- CreateIndex
CREATE INDEX "applications_cohort_id_idx" ON "applications"("cohort_id");

-- CreateIndex
CREATE INDEX "applications_user_id_idx" ON "applications"("user_id");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "applications_user_id_cohort_id_key" ON "applications"("user_id", "cohort_id");

-- CreateIndex
CREATE INDEX "application_answers_survey_field_id_idx" ON "application_answers"("survey_field_id");

-- CreateIndex
CREATE UNIQUE INDEX "application_answers_application_id_survey_field_id_key" ON "application_answers"("application_id", "survey_field_id");

-- CreateIndex
CREATE UNIQUE INDEX "test_tasks_cohort_id_key" ON "test_tasks"("cohort_id");

-- CreateIndex
CREATE INDEX "student_document_data_cohort_id_idx" ON "student_document_data"("cohort_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_document_data_user_id_cohort_id_key" ON "student_document_data"("user_id", "cohort_id");

-- CreateIndex
CREATE INDEX "task_cards_cohort_id_date_idx" ON "task_cards"("cohort_id", "date");

-- CreateIndex
CREATE INDEX "task_cards_user_id_cohort_id_idx" ON "task_cards"("user_id", "cohort_id");

-- AddForeignKey
ALTER TABLE "survey_fields" ADD CONSTRAINT "survey_fields_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_roles" ADD CONSTRAINT "cohort_roles_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "cohort_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_answers" ADD CONSTRAINT "application_answers_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_answers" ADD CONSTRAINT "application_answers_survey_field_id_fkey" FOREIGN KEY ("survey_field_id") REFERENCES "survey_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_tasks" ADD CONSTRAINT "test_tasks_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_document_data" ADD CONSTRAINT "student_document_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_document_data" ADD CONSTRAINT "student_document_data_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_cards" ADD CONSTRAINT "task_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_cards" ADD CONSTRAINT "task_cards_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
