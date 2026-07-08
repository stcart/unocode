import type { ApplicationStatus } from "@/lib/types/application";

export const applicationStatusVariants: Record<
  ApplicationStatus,
  "default" | "secondary" | "destructive"
> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};
