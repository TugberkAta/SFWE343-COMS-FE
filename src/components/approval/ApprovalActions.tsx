"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  stage: 1 | 2;
  onApprove: () => Promise<void>;
  onRequestChanges: (body?: any) => Promise<void>;
  submitting?: boolean;
  onOpenRequestChanges?: () => void;
};

export default function ApprovalActions({ stage, onApprove, onRequestChanges, submitting, onOpenRequestChanges }: Props) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => (onOpenRequestChanges ? onOpenRequestChanges() : onRequestChanges())} disabled={submitting}>
        Request changes
      </Button>

      <Button onClick={onApprove} disabled={submitting}>
        {stage === 2 ? "Final approve" : "Approve"}
      </Button>
    </div>
  );
}
