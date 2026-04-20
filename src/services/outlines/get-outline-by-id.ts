import { outlines } from "@/constants/endpoints";
import http from "@/utils/http";

export type OutlineObjective = {
  objectiveId: number;
  objectiveOrder: number;
  objectiveText: string;
};

export type OutlineContentItem = {
  contentItemId: number;
  contentOrder: number;
  contentText: string;
};

export type OutlineLearningOutcome = {
  cloId: number;
  cloNumber: string;
  statement: string;
};

export type OutlineWeeklyTopicClo = {
  cloId: number;
  cloNumber: string;
};

export type OutlineWeeklyTopic = {
  weeklyTopicId: number;
  weekNo: number;
  weekDate: string | null;
  subjectTitle: string;
  detailsText: string;
  tasksPrivateStudyText: string;
  clos: OutlineWeeklyTopicClo[];
};

export type OutlinePolicy = {
  policyId: number;
  policyOrder: number;
  title: string;
  bodyText: string;
};

export type OutlineReferenceLink = {
  referenceLinkId: number;
  linkOrder: number;
  label: string;
  url: string;
};

export type OutlineWorkloadItem = {
  workloadItemId: number;
  itemOrder: number;
  activityType: string;
  learningActivitiesWeeks: string;
  durationHours: number;
};

export type OutlineEvaluationItemClo = {
  cloId: number;
  cloNumber: string;
};

export type OutlineEvaluationItem = {
  evaluationItemId: number;
  itemOrder: number;
  name: string;
  category: string;
  weightPercent: number;
  notes: string;
  clos: OutlineEvaluationItemClo[];
};

export type OutlineById = {
  outlineId: number;
  courseId: number;
  termId: number;
  versionNo: number;
  status: "published" | "pending" | "draft";
  lecturerUserId: number;
  assistantUserId: number | null;
  textbooksText: string;
  additionalReadingText: string;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
  courseCode: string;
  courseName: string;
  courseLanguage: string;
  courseCategory: string;
  courseLevelText: string;
  theoryHours: number;
  tutorialHours: number;
  labHours: number;
  localCredits: number;
  ectsCredits: number;
  academicYear: string;
  semester: string;
  objectives: OutlineObjective[];
  contentItems: OutlineContentItem[];
  learningOutcomes: OutlineLearningOutcome[];
  weeklyTopics: OutlineWeeklyTopic[];
  policies: OutlinePolicy[];
  referenceLinks: OutlineReferenceLink[];
  workloadItems: OutlineWorkloadItem[];
  prerequisiteCourseCodes: string[];
  evaluationItems: OutlineEvaluationItem[];
};

const getOutlineById = (outlineId: number) => {
  const endpoint = outlines.getById(outlineId);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.get<OutlineById>(`${apiBaseUrl}${endpoint}`);
};

export default getOutlineById;
