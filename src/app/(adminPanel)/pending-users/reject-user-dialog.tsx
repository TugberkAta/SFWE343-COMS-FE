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
      <DialogContent className="bg-white border border-[#e5e7eb] shadow-lg rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#111827]">Reject this request?</DialogTitle>
          <DialogDescription className="text-[#6b7280]">
            This removes the user from pending approval. They will need to sign
            up again if you want to reconsider later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form} key={user?.userId ?? "closed"}>
          <form onSubmit={onSubmit} className="space-y-4">
            {user ? (
              <div
                className="rounded-lg border border-[#e5e7eb] bg-[#f8f8f8] px-4 py-3 text-sm"
                role="region"
                aria-label="User to reject"
              >
                <dl className="space-y-2">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                    <dt className="shrink-0 text-[#6b7280]">Name</dt>
                    <dd className="font-medium text-[#111827]">{displayName(user)}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                    <dt className="shrink-0 text-[#6b7280]">Email</dt>
                    <dd className="break-all font-medium text-[#111827]">{user.email}</dd>
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
                className="border border-[#e5e7eb] text-[#111827] hover:bg-[#f8f8f8] rounded-lg"
              >
                Cancel
              </Button>

              {/* 🔥 RBAC */}
              <PermissionGate permission={ENDPOINT_PERMISSIONS.users.APPROVE}>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={form.formState.isSubmitting || !user}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
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