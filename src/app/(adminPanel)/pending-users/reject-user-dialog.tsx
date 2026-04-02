"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { UserWithNoRole } from "@/types/user-with-no-role"

function displayName(user: UserWithNoRole) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "—"
}

type RejectUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithNoRole | null
  onRejected: () => Promise<void>
}

export function RejectUserDialog({
  open,
  onOpenChange,
  user,
  onRejected,
}: RejectUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) setIsSubmitting(false)
  }, [open, user?.userId])

  const handleDismiss = () => {
    if (isSubmitting) return
    onOpenChange(false)
  }

  const handleConfirm = async () => {
    if (!user) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/pending-users/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      })

      if (!response.ok) {
        throw new Error("Reject request failed")
      }

      await onRejected()
    } catch (error) {
      console.error("Reject error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleDismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject this request?</DialogTitle>
          <DialogDescription>
            This removes the user from pending approval. They will need to sign
            up again if you want to reconsider later.
          </DialogDescription>
        </DialogHeader>

        {user ? (
          <div
            className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm"
            role="region"
            aria-label="User to reject"
          >
            <dl className="space-y-2">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <dt className="shrink-0 text-muted-foreground">Name</dt>
                <dd className="font-medium">{displayName(user)}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <dt className="shrink-0 text-muted-foreground">Email</dt>
                <dd className="break-all font-medium">{user.email}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleDismiss}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting || !user}
          >
            {isSubmitting ? "Rejecting…" : "Reject request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
