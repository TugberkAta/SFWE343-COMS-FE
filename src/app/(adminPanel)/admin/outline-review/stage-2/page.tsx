"use client";

import { ENDPOINT_PERMISSIONS } from "@/constants/permissions";
import { OUTLINE_REVIEW_ACTIONS } from "@/constants/approval";
import approvalService from "@/services/approval";
import OutlineReviewPage from "../components/outline-review-page";

export default function Stage2ApprovalPage() {
  return (
    <OutlineReviewPage
      title="Stage 2 Approval"
      description="Outlines awaiting final approval"
      stage={2}
      pagePermission={ENDPOINT_PERMISSIONS.approval.STAGE2}
      approvePermission={ENDPOINT_PERMISSIONS.approval.STAGE2_APPROVE}
      emptyMessage="No outlines are waiting for stage 2 approval."
      fetchQueue={() => approvalService.getStage2Queue()}
      submitReview={approvalService.postStage2Approval}
      successMessages={{
        [OUTLINE_REVIEW_ACTIONS.APPROVE]: "Outline fully approved.",
        [OUTLINE_REVIEW_ACTIONS.REQUEST_CHANGES]:
          "Change request sent to the lecturer.",
        [OUTLINE_REVIEW_ACTIONS.REJECT]: "Outline rejected at stage 2.",
      }}
    />
  );
}
