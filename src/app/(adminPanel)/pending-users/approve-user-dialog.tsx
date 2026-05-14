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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import postApproveUser from "@/services/users/post-approve-user"
import type { UserWithNoRole } from "@/types/user-with-no-role"
import type { UserType } from "@/types/user-type"
import { PermissionGate } from "@/components/PermissionGate"
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions"

const approveFormSchema = z.object({
  userTypeId: z.number().int().positive(),
})

type ApproveFormValues = z.infer<typeof approveFormSchema>

function displayName(user: UserWithNoRole) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "—"
}

type ApproveUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithNoRole | null
  userTypes: UserType[]
  userTypesLoading: boolean
  userTypesErrored: boolean
  onApproved: () => Promise<void>
}

export function ApproveUserDialog({
  open,
  onOpenChange,
  user,
  userTypes,
  userTypesLoading,
  userTypesErrored,
  onApproved,
}: ApproveUserDialogProps) {
  const firstTypeId = userTypes[0]?.userTypeId

  const form = useForm<ApproveFormValues>({
    resolver: zodResolver(approveFormSchema),
    defaultValues: {
      userTypeId: firstTypeId ?? 0,
    },
  })

  React.useEffect(() => {
    if (open && firstTypeId !== undefined) {
      form.reset({ userTypeId: firstTypeId })
    }
  }, [open, user?.userId, firstTypeId, form])

  const handleDismiss = () => {
    if (form.formState.isSubmitting) return
    onOpenChange(false)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (!user) return

    try {
      await postApproveUser({
        userId: user.userId,
        userTypeId: values.userTypeId,
        approvedStatus: true,
      })

      await onApproved()
    } catch (error) {
      console.error("Approve error:", error)
    }
  })

  const canSubmit =
    !userTypesLoading && !userTypesErrored && userTypes.length > 0 && user !== null

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleDismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve user</DialogTitle>
          <DialogDescription>
            {user
              ? `Choose a user type for ${displayName(user)} (${user.email}) before approving.`
              : "Choose a user type before approving this user."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form} key={user?.userId ?? "closed"}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="userTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User type</FormLabel>

                  {userTypesLoading ? (
                    <p className="text-sm text-muted-foreground">Loading user types…</p>
                  ) : userTypesErrored ? (
                    <p className="text-sm text-destructive">
                      Could not load user types. Refresh the page and try again.
                    </p>
                  ) : userTypes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No user types available.</p>
                  ) : (
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                      disabled={form.formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a user type" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {userTypes.map((ut) => (
                          <SelectItem key={ut.userTypeId} value={String(ut.userTypeId)}>
                            {ut.userType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleDismiss}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>

              <PermissionGate permission={ENDPOINT_PERMISSIONS.users.APPROVE}>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !canSubmit}
                >
                  {form.formState.isSubmitting ? "Submitting..." : "Confirm"}
                </Button>
              </PermissionGate>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
