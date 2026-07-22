import { z } from "zod";
import { longText, nullableTrimmedString, shortText } from "./shared.schemas";

const dateOnly = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата должна быть в формате YYYY-MM-DD");

export const CohortBodySchema = z.object({
  name: shortText,
  applicationStart: dateOnly,
  applicationEnd: dateOnly,
  practiceStart: dateOnly,
  practiceEnd: dateOnly,
});

export const SurveyFieldBodySchema = z.object({
  label: shortText,
  type: z.enum(["TEXT", "LONG_TEXT", "SELECT"]),
  options: z.array(shortText).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const CohortRoleBodySchema = z.object({
  name: shortText,
});

export const TestTaskContentBodySchema = z.object({
  content: longText,
});

export const ReviewApplicationBodySchema = z
  .object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    reviewComment: nullableTrimmedString,
    roleId: z.number().int().positive().nullable().optional(),
  })
  .refine(
    (value) =>
      value.status !== undefined ||
      value.reviewComment !== undefined ||
      value.roleId !== undefined,
    { message: "Нужно указать status, reviewComment или roleId" }
  );

export const AdminReviewBodySchema = z.object({
  reviewActivities: nullableTrimmedString,
  reviewCharacteristic: nullableTrimmedString,
  reviewEmployed: nullableTrimmedString,
  reviewNextPractice: nullableTrimmedString,
  reviewEmploymentOffer: nullableTrimmedString,
  reviewSuggestions: nullableTrimmedString,
  reviewGrade: nullableTrimmedString,
});

export const ReportApprovalBodySchema = z.object({
  approved: z.boolean(),
});
