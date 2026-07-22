import { z } from "zod";
import { longText } from "./shared.schemas";

export const ApplicationAnswerSchema = z.object({
  surveyFieldId: z.number().int().positive(),
  value: longText,
});

export const SubmitApplicationBodySchema = z.object({
  cohortId: z.number().int().positive(),
  answers: z.array(ApplicationAnswerSchema).min(1),
});
