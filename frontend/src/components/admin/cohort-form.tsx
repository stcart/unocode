"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import type { CohortInput } from "@/lib/types/cohort";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CohortFormProps = {
  initialValues?: CohortInput;
  submitLabel: string;
  onSubmit: (values: CohortInput) => Promise<void>;
};

const emptyValues: CohortInput = {
  name: "",
  applicationStart: "",
  applicationEnd: "",
  practiceStart: "",
  practiceEnd: "",
};

export function CohortForm({
  initialValues,
  submitLabel,
  onSubmit,
}: CohortFormProps) {
  const [values, setValues] = useState<CohortInput>(
    initialValues ?? emptyValues
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof CohortInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось сохранить");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Название / год</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="2026"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="applicationStart">Начало приёма заявок</Label>
          <Input
            id="applicationStart"
            type="date"
            value={values.applicationStart}
            onChange={(event) =>
              updateField("applicationStart", event.target.value)
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="applicationEnd">Окончание приёма заявок</Label>
          <Input
            id="applicationEnd"
            type="date"
            value={values.applicationEnd}
            onChange={(event) =>
              updateField("applicationEnd", event.target.value)
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="practiceStart">Начало практики</Label>
          <Input
            id="practiceStart"
            type="date"
            value={values.practiceStart}
            onChange={(event) =>
              updateField("practiceStart", event.target.value)
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="practiceEnd">Окончание практики</Label>
          <Input
            id="practiceEnd"
            type="date"
            value={values.practiceEnd}
            onChange={(event) =>
              updateField("practiceEnd", event.target.value)
            }
            required
          />
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Сохранение..." : submitLabel}
      </Button>
    </form>
  );
}
