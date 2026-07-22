import { z } from "zod";

export const nullableTrimmedString = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null) {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

export const shortText = z.string().trim().min(1).max(255);
export const longText = z.string().trim().min(1).max(10000);
export const optionalLongText = z.string().trim().max(10000).optional();
