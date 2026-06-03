import http from "@/utils/http";
import { outlines } from "@/constants/endpoints";
import {
  OUTLINE_APPROVAL_STAGES,
  type OutlineApprovalStage,
  type OutlineReviewAction,
} from "@/constants/approval";
import { getOutlines, type Outline } from "@/services/outlines";

export type StageReviewBody = {
  action: OutlineReviewAction;
  commentText?: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const filterOutlinesByStage = async (stage: OutlineApprovalStage) => {
  const response = await getOutlines();
  const allOutlines = response.data?.outlines ?? [];
  const filtered = allOutlines.filter((outline) => outline.currentStage === stage);

  return {
    ...response,
    data: { outlines: filtered },
  };
};

export const getStage1Queue = () =>
  filterOutlinesByStage(OUTLINE_APPROVAL_STAGES.STAGE_1_REVIEW);

export const getStage2Queue = () =>
  filterOutlinesByStage(OUTLINE_APPROVAL_STAGES.STAGE_2_APPROVAL);

export const postStage1Review = (outlineId: number, body: StageReviewBody) => {
  return http.post(`${apiBaseUrl}${outlines.stage1Review(outlineId)}`, {
    data: body,
  });
};

export const postStage2Approval = (outlineId: number, body: StageReviewBody) => {
  return http.post(`${apiBaseUrl}${outlines.stage2Approval(outlineId)}`, {
    data: body,
  });
};

export type { Outline };

export default {
  getStage1Queue,
  getStage2Queue,
  postStage1Review,
  postStage2Approval,
};
