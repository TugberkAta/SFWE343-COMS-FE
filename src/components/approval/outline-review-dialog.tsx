"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PermissionGate } from "@/components/PermissionGate";
import {
  OUTLINE_REVIEW_ACTIONS,
  type OutlineReviewAction,
} from "@/constants/approval";
import type { Outline } from "@/services/outlines";
import { Loader2Icon } from "lucide-react";

type OutlineReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outline: Outline | null;
  stage: 1 | 2;
  approvePermission: string;
  submitting: boolean;
  onSubmit: (action: OutlineReviewAction, commentText?: string) => Promise<void>;
};

function formatTerm(outline: Outline) {
  return [outline.academicYear, outline.semester].filter(Boolean).join(" · ");
}

export default function OutlineReviewDialog({
  open,
  onOpenChange,
  outline,
  stage,
  approvePermission,
  submitting,
  onSubmit,
}: OutlineReviewDialogProps) {
  const [commentText, setCommentText] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setCommentText("");
    }
  }, [open, outline?.outlineId]);

  const requiresComment = (action: OutlineReviewAction) =>
    action === OUTLINE_REVIEW_ACTIONS.REJECT ||
    action === OUTLINE_REVIEW_ACTIONS.REQUEST_CHANGES;

  const handleAction = async (action: OutlineReviewAction) => {
    if (!outline) return;

    if (requiresComment(action) && !commentText.trim()) {
      return;
    }

    if (action === OUTLINE_REVIEW_ACTIONS.REJECT) {
      const confirmed = window.confirm(
        "Reject this outline? This action cannot be undone.",
      );
      if (!confirmed) return;
    }

    await onSubmit(action, commentText.trim() || undefined);
  };

  if (!outline) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {outline.courseCode} — {outline.courseName}
          </DialogTitle>
          <DialogDescription>
            Stage {stage} review · v{outline.versionNo} · {formatTerm(outline)}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Program</dt>
            <dd>{outline.programName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Department</dt>
            <dd>{outline.departmentName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Submissions</dt>
            <dd>{outline.submissionCount ?? 1}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Last updated</dt>
            <dd>
              {outline.updatedAt
                ? new Date(outline.updatedAt).toLocaleString()
                : "—"}
            </dd>
          </div>
        </dl>

        <div className="space-y-2">
          <label htmlFor="review-comment" className="text-sm font-medium">
            Comment
          </label>
          <Textarea
            id="review-comment"
            placeholder="Required for request changes or reject"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:items-stretch">
          <PermissionGate permission={approvePermission}>
            <Button
              disabled={submitting}
              onClick={() => handleAction(OUTLINE_REVIEW_ACTIONS.APPROVE)}
            >
              {submitting ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              Approve
            </Button>
          </PermissionGate>

          <Button
            variant="secondary"
            disabled={submitting || !commentText.trim()}
            onClick={() =>
              handleAction(OUTLINE_REVIEW_ACTIONS.REQUEST_CHANGES)
            }
          >
            Request changes
          </Button>

          <Button
            variant="destructive"
            disabled={submitting || !commentText.trim()}
            onClick={() => handleAction(OUTLINE_REVIEW_ACTIONS.REJECT)}
          >
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
