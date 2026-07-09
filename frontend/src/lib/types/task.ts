export type TaskCard = {
  id: number;
  userId: number;
  cohortId: number;
  date: string;
  title: string | null;
  description: string | null;
  artifactLink: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskParticipant = {
  userId: number;
  email: string;
  displayName: string;
  role: {
    id: number;
    name: string;
  } | null;
  cards: Record<string, TaskCard | null>;
};

export type TaskBoard = {
  cohort: {
    id: number;
    name: string;
    practiceStart: string;
    practiceEnd: string;
  };
  weekStart: string;
  days: string[];
  weekIndex: number;
  totalWeeks: number;
  weeks: string[];
  participants: TaskParticipant[];
};

export type TaskCardInput = {
  title?: string | null;
  description?: string | null;
  artifactLink?: string | null;
};
