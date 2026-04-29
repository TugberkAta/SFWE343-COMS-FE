"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import postRejectUser from "@/services/users/post-reject-user"
import type { UserWithNoRole } from "@/types/user-with-no-role"
import { PermissionGate } from "@/components/PermissionGate"
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions"

const rejectFormSchema = z.object({})

type RejectFormValues = z.infer<typeof rejectFormSchema>

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
  const form = useForm<RejectFormValues>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: {},
  })

  React.useEffect(() => {
    if (open) {
      form.reset({})
    }
  }, [open, user?.userId, form])

  const handleDismiss = () => {
    if (form.formState.isSubmitting) return
    onOpenChange(false)
  }

  const onSubmit = form.handleSubmit(async () => {
    if (!user) return

    try {
      await postRejectUser({
        userId: user.userId,
      })

      await onRejected()
    } catch (error) {
      console.error("Reject error:", error)
    }
  })

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

        <Form {...form} key={user?.userId ?? "closed"}>
          <form onSubmit={onSubmit} className="space-y-4">
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
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>

              {/* 🔥 RBAC */}
              <PermissionGate permission={ENDPOINT_PERMISSIONS.users.APPROVE}>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={form.formState.isSubmitting || !user}
                >
                  {form.formState.isSubmitting ? "Rejecting…" : "Reject request"}
                </Button>
              </PermissionGate>

            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}