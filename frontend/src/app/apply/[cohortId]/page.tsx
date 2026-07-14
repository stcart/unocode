"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ApiError } from "@/lib/api";
import {
  fetchApplicationPrefill,
  fetchMyApplicationForCohort,
  fetchMyTestTask,
  fetchPublicSurvey,
  submitApplication,
} from "@/lib/api/applications";
import type {
  Application,
  ApplicationAnswerInput,
  PublicSurveyResponse,
  TestTaskState,
} from "@/lib/types/application";
import { ApplicationStatusCard } from "@/components/application/application-status-card";
import { SurveyForm } from "@/components/application/survey-form";
import { TestTaskSection } from "@/components/application/test-task-section";
import {
  PageContainer,
  PageHeader,
  PageLoadingSkeleton,
} from "@/components/page-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";

function buildInitialValues(
  fields: PublicSurveyResponse["surveyFields"],
  defaults: Record<number, string>,
  application: Application | null
): Record<number, string> {
  const values: Record<number, string> = { ...defaults };

  if (application) {
    for (const answer of application.answers) {
      values[answer.surveyFieldId] = answer.value;
    }
  }

  for (const field of fields) {
    values[field.id] ??= "";
  }

  return values;
}

export default function ApplyPage() {
  const params = useParams<{ cohortId: string }>();
  const cohortId = Number(params.cohortId);
  const { user, isLoading: isAuthLoading } = useAuth();
  const returnUrl = `/apply/${cohortId}`;

  const [survey, setSurvey] = useState<PublicSurveyResponse | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [defaults, setDefaults] = useState<Record<number, string>>({});
  const [testTask, setTestTask] = useState<TestTaskState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestTaskLoading, setIsTestTaskLoading] = useState(false);

  useEffect(() => {
    async function loadPage() {
      if (!Number.isInteger(cohortId) || cohortId <= 0) {
        setError("Некорректная ссылка на когорту");
        setIsLoading(false);
        return;
      }

      try {
        const surveyData = await fetchPublicSurvey(cohortId);
        setSurvey(surveyData);

        if (user) {
          const [{ application: existingApplication }, prefill] =
            await Promise.all([
              fetchMyApplicationForCohort(cohortId),
              fetchApplicationPrefill(cohortId),
            ]);

          setApplication(existingApplication);
          setDefaults(prefill.defaults);

          if (existingApplication) {
            setIsTestTaskLoading(true);
            const testTaskData = await fetchMyTestTask(cohortId);
            setTestTask(testTaskData.testTask);
            setIsTestTaskLoading(false);
          }
        }
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Не удалось загрузить анкету"
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthLoading) {
      return;
    }

    void loadPage();
  }, [cohortId, user, isAuthLoading]);

  const initialValues = useMemo(() => {
    if (!survey) {
      return {};
    }

    return buildInitialValues(survey.surveyFields, defaults, application);
  }, [survey, defaults, application]);

  async function handleSubmit(answers: ApplicationAnswerInput[]) {
    const { application: createdApplication } = await submitApplication(
      cohortId,
      answers
    );

    setApplication(createdApplication);
    setIsTestTaskLoading(true);

    try {
      const testTaskData = await fetchMyTestTask(cohortId);
      setTestTask(testTaskData.testTask);
    } finally {
      setIsTestTaskLoading(false);
    }
  }

  if (isLoading || isAuthLoading) {
    return (
      <PageContainer size="narrow">
        <PageLoadingSkeleton />
      </PageContainer>
    );
  }

  if (error || !survey) {
    return (
      <PageContainer size="narrow" className="gap-4">
        <Alert variant="destructive">
          <AlertDescription>{error ?? "Анкета не найдена"}</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="narrow" className="gap-8">
      <PageHeader
        eyebrow="Заявка на практику"
        title={survey.cohort.name}
        description={`Приём заявок: ${survey.cohort.applicationStart} — ${survey.cohort.applicationEnd}`}
      />

      {application ? (
        <div className="space-y-6">
          <ApplicationStatusCard
            status={application.status}
            statusLabel={application.statusLabel}
            reviewComment={application.reviewComment}
            submittedAt={application.createdAt}
          />

          <Card className="bg-card/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Ваши ответы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.answers.map((answer) => (
                <div key={answer.surveyFieldId}>
                  <p className="text-muted-foreground text-sm">{answer.label}</p>
                  <p className="text-sm">{answer.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <TestTaskSection
            testTask={testTask}
            isLoading={isTestTaskLoading}
          />
        </div>
      ) : (
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Анкета</CardTitle>
            <CardDescription>
              Заполните поля ниже. Если вы уже подавали заявку в другой когорте,
              известные данные подставятся автоматически.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SurveyForm
              cohortId={cohortId}
              fields={survey.surveyFields}
              initialValues={initialValues}
              isAuthenticated={Boolean(user)}
              isApplicationOpen={survey.cohort.isApplicationOpen}
              returnUrl={returnUrl}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
