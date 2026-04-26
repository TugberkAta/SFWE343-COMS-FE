import http from "@/utils/http";
import { outlines } from "@/constants/endpoints";

type OutlineObjectivePayload = {
  description: string;
};

type OutlineContentItemPayload = {
  description: string;
};

type OutlineLearningOutcomePayload = {
  cloCode: string;
  description: string;
};

type OutlineWeeklyTopicCloPayload = {
  cloCode: string;
};

type OutlineWeeklyTopicPayload = {
  weekNo: number;
  weekDate: string | null;
  subjectTitle: string;
  detailsText: string;
  tasksPrivateStudyText: string;
  clos: OutlineWeeklyTopicCloPayload[];
};

type OutlinePolicyPayload = {
  policyType: string;
  description: string;
};

type OutlineReferenceLinkPayload = {
  title: string;
  url: string;
};

type OutlineWorkloadItemPayload = {
  activity: string;
  hours: number;
};

type OutlineEvaluationItemCloPayload = {
  cloCode: string;
};

type OutlineEvaluationItemPayload = {
  title: string;
  weight: number;
  clos: OutlineEvaluationItemCloPayload[];
};

export type PostCourseOutlineBody = {
  courseId: number;
  termId: number;
  lecturerUserId: number;
  assistantUserIds: number[];
  textbooksText: string;
  additionalReadingText: string;
  createdByUserId: number;
  objectives: OutlineObjectivePayload[];
  contentItems: OutlineContentItemPayload[];
  learningOutcomes: OutlineLearningOutcomePayload[];
  weeklyTopics: OutlineWeeklyTopicPayload[];
  policies: OutlinePolicyPayload[];
  referenceLinks: OutlineReferenceLinkPayload[];
  workloadItems: OutlineWorkloadItemPayload[];
  evaluationItems: OutlineEvaluationItemPayload[];
};

export type PostCourseOutlineResponse = {
  outlineId: number;
};

const postCourseOutline = (body: PostCourseOutlineBody) => {
  const endpoint = outlines.create();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.post<PostCourseOutlineResponse>(`${apiBaseUrl}${endpoint}`, {
    data: body,
  });
};

export default postCourseOutline;
