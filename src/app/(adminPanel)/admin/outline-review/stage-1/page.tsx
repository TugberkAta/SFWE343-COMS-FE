"use client";

import { ENDPOINT_PERMISSIONS } from "@/constants/permissions";
import { OUTLINE_REVIEW_ACTIONS } from "@/constants/approval";
import approvalService from "@/services/approval";
import OutlineReviewPage from "../components/outline-review-page";

export default function Stage1ReviewPage() {
  return (
    <OutlineReviewPage
      title="Stage 1 Review"
      description="Outlines awaiting department-level review"
      stage={1}
      pagePermission={ENDPOINT_PERMISSIONS.approval.STAGE1}
      approvePermission={ENDPOINT_PERMISSIONS.approval.STAGE1_APPROVE}
      emptyMessage="No outlines are waiting for stage 1 review."
      fetchQueue={() => approvalService.getStage1Queue()}
      submitReview={approvalService.postStage1Review}
      successMessages={{
        [OUTLINE_REVIEW_ACTIONS.APPROVE]:
          "Outline approved and moved to stage 2.",
        [OUTLINE_REVIEW_ACTIONS.REQUEST_CHANGES]:
          "Change request sent to the lecturer.",
        [OUTLINE_REVIEW_ACTIONS.REJECT]: "Outline rejected at stage 1.",
      }}
    />
  );
}
