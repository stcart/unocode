import { API_BASE_URL, ApiError, apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";
import type {
  DocumentContext,
  StudentDocumentInput,
} from "@/lib/types/document";

export async function fetchDocumentContext(
  cohortId: number
): Promise<DocumentContext> {
  return apiFetch<DocumentContext>(`/documents/cohort/${cohortId}`, {}, true);
}

export async function saveDocumentFields(
  cohortId: number,
  fields: StudentDocumentInput
): Promise<{ data: DocumentContext["data"] }> {
  return apiFetch(
    `/documents/cohort/${cohortId}`,
    {
      method: "PUT",
      body: JSON.stringify(fields),
    },
    true
  );
}

export async function generateDocument(
  documentType: string,
  cohortId: number
): Promise<{ blob: Blob; filename: string }> {
  const token = getToken();

  if (!token) {
    throw new ApiError("Требуется авторизация", 401);
  }

  const response = await fetch(
    `${API_BASE_URL}/documents/${documentType}/generate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cohortId }),
    }
  );

  if (!response.ok) {
    let message = `Ошибка ${response.status}`;

    try {
      const data = (await response.json()) as { error?: string };
      message = data.error ?? message;
    } catch {
      // binary or empty body
    }

    throw new ApiError(message, response.status);
  }

  const disposition = response.headers.get("Content-Disposition");
  const filenameMatch = disposition?.match(/filename\*=UTF-8''([^;]+)/);
  const filename = filenameMatch
    ? decodeURIComponent(filenameMatch[1])
    : `${documentType}.docx`;

  return {
    blob: await response.blob(),
    filename,
  };
}

export async function uploadReport(
  cohortId: number,
  file: File
): Promise<{ data: DocumentContext["data"] }> {
  const token = getToken();

  if (!token) {
    throw new ApiError("Требуется авторизация", 401);
  }

  const formData = new FormData();
  formData.append("report", file);

  const response = await fetch(
    `${API_BASE_URL}/documents/cohort/${cohortId}/report`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    let message = `Ошибка ${response.status}`;

    try {
      const data = (await response.json()) as { error?: string };
      message = data.error ?? message;
    } catch {
      // ignore
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<{ data: DocumentContext["data"] }>;
}

export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
