export const OUTLINE_APPROVAL_STAGES = {
  STAGE_1_REVIEW: "stage_1_review",
  STAGE_2_APPROVAL: "stage_2_approval",
} as const;

export type OutlineApprovalStage =
  (typeof OUTLINE_APPROVAL_STAGES)[keyof typeof OUTLINE_APPROVAL_STAGES];

export const OUTLINE_REVIEW_ACTIONS = {
  APPROVE: "approve",
  REJECT: "reject",
  REQUEST_CHANGES: "request_changes",
} as const;

export type OutlineReviewAction =
  (typeof OUTLINE_REVIEW_ACTIONS)[keyof typeof OUTLINE_REVIEW_ACTIONS];
