"use client";

import * as React from "react";
import { Loader2Icon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import useFetchData from "@/hooks/use-fetch-data";
import { usePermission } from "@/hooks/use-permission";
import { PermissionProtectedPage } from "@/components/PermissionProtectedPage";
import OutlineReviewQueue from "@/components/approval/outline-review-queue";
import OutlineReviewDialog from "@/components/approval/outline-review-dialog";
import type { OutlineReviewAction } from "@/constants/approval";
import type { Outline } from "@/services/outlines";
import type { StageReviewBody } from "@/services/approval";

type OutlineReviewPageProps = {
  title: string;
  description: string;
  stage: 1 | 2;
  pagePermission: string;
  approvePermission: string;
  emptyMessage: string;
  fetchQueue: () => Promise<{ data?: { outlines: Outline[] } }>;
  submitReview: (
    outlineId: number,
    body: StageReviewBody,
  ) => Promise<unknown>;
  successMessages: Record<OutlineReviewAction, string>;
};

export default function OutlineReviewPage({
  title,
  description,
  stage,
  pagePermission,
  approvePermission,
  emptyMessage,
  fetchQueue,
  submitReview,
  successMessages,
}: OutlineReviewPageProps) {
  const { hasPermission } = usePermission();
  const [loading, errored, data, refetch] = useFetchData(fetchQueue);
  const [selectedOutline, setSelectedOutline] = React.useState<Outline | null>(
    null,
  );
  const [submitting, setSubmitting] = React.useState(false);

  if (!hasPermission(pagePermission)) {
    return <PermissionProtectedPage />;
  }

  if (loading) {
    return <Loader2Icon className="size-4 animate-spin" />;
  }

  if (errored) {
    return <TriangleAlertIcon className="size-4 text-destructive" />;
  }

  const outlines: Outline[] = data?.outlines ?? [];

  const handleSubmit = async (
    action: OutlineReviewAction,
    commentText?: string,
  ) => {
    if (!selectedOutline) return;

    try {
      setSubmitting(true);
      await submitReview(selectedOutline.outlineId, { action, commentText });
      toast.success(successMessages[action]);
      setSelectedOutline(null);
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review. Please try again.");
      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <OutlineReviewQueue
        outlines={outlines}
        emptyMessage={emptyMessage}
        onReview={setSelectedOutline}
      />

      <OutlineReviewDialog
        open={Boolean(selectedOutline)}
        onOpenChange={(open) => !open && setSelectedOutline(null)}
        outline={selectedOutline}
        stage={stage}
        approvePermission={approvePermission}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
