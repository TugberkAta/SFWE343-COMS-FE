"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (body: { comment: string; reason?: string }) => Promise<void>;
};

export default function RequestChangesModal({ open, onOpenChange, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState } = useForm<{ comment: string; reason?: string }>({
    defaultValues: { comment: "", reason: "" },
  });

  React.useEffect(() => {
    if (open) reset({ message: "" });
  }, [open, reset]);

  const doSubmit = handleSubmit(async (values) => {
    const payload = { comment: values.comment, reason: values.reason || undefined };
    await onSubmit(payload);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Request changes</DialogTitle>
        </DialogHeader>

        <form onSubmit={doSubmit} className="space-y-4">
          <div className="space-y-2">
            <select {...register("reason")} className="w-full rounded-md border border-border bg-transparent p-2 text-sm">
              <option value="">Select reason (optional)</option>
              <option value="learning_outcomes">Learning outcomes</option>
              <option value="weekly_topics">Weekly topics</option>
              <option value="evaluation">Evaluation</option>
              <option value="other">Other</option>
            </select>

            <textarea
              {...register("comment")}
              placeholder="Describe required changes"
              className="w-full rounded-md border border-border bg-transparent p-3 text-sm"
              rows={6}
              disabled={formState.isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={formState.isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Sending…" : "Request changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
