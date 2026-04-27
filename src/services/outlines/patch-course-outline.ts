import http from "@/utils/http";
import { outlines } from "@/constants/endpoints";
import type { PostCourseOutlineBody } from "./post-course-outline";

export type PatchCourseOutlineBody = Pick<
  PostCourseOutlineBody,
  | "lecturerUserId"
  | "assistantUserIds"
  | "textbooksText"
  | "additionalReadingText"
  | "officeHours"
  | "officeCode"
  | "objectives"
  | "contentItems"
  | "learningOutcomes"
  | "programLearningOutcomes"
  | "weeklyTopics"
  | "workloadItems"
  | "evaluationItems"
> & {
  status?: "published" | "pending" | "draft";
};

export type PatchCourseOutlineResponse = {
  outlineId: number;
};

const patchCourseOutline = (outlineId: number, body: PatchCourseOutlineBody) => {
  const endpoint = outlines.patchById(outlineId);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.patch(`${apiBaseUrl}${endpoint}`, {
    data: body,
  });
};

export default patchCourseOutline;
