import { z } from "zod";
import { nullableTrimmedString } from "./shared.schemas";

export const StudentDocumentFieldsBodySchema = z.object({
  studentFio: nullableTrimmedString,
  group: nullableTrimmedString,
  directionCode: nullableTrimmedString,
  directionName: nullableTrimmedString,
  programName: nullableTrimmedString,
  specialty: nullableTrimmedString,
  practiceTopic: nullableTrimmedString,
  mainStageTasks: nullableTrimmedString,
  supervisorUrfuName: nullableTrimmedString,
});

export const GenerateDocumentBodySchema = z.object({
  cohortId: z.number().int().positive().optional(),
});
