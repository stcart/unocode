import { z } from "zod";
import { nullableTrimmedString } from "./shared.schemas";

export const UpsertTaskCardBodySchema = z.object({
  title: nullableTrimmedString,
  description: nullableTrimmedString,
  artifactLink: nullableTrimmedString,
});
