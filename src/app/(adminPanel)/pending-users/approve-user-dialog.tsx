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
import type { UserRoleRecord } from "@/types/user-role"
import type { UserWithNoRole } from "@/types/user-with-no-role"
import { PermissionGate } from "@/components/PermissionGate"
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions"

const approveFormSchema = z.object({
  userRoleId: z.number().int().positive(),
})

type ApproveFormValues = z.infer<typeof approveFormSchema>

function displayName(user: UserWithNoRole) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "—"
}

type ApproveUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithNoRole | null
  roles: UserRoleRecord[]
  rolesLoading: boolean
  rolesErrored: boolean
  onApproved: () => Promise<void>
}

export function ApproveUserDialog({
  open,
  onOpenChange,
  user,
  roles,
  rolesLoading,
  rolesErrored,
  onApproved,
}: ApproveUserDialogProps) {
  const firstRoleId = roles[0]?.userRoleId

  const form = useForm<ApproveFormValues>({
    resolver: zodResolver(approveFormSchema),
    defaultValues: { userRoleId: firstRoleId ?? 0 },
  })

  React.useEffect(() => {
    if (open && firstRoleId !== undefined) {
      form.reset({ userRoleId: firstRoleId })
    }
  }, [open, user?.userId, firstRoleId, form])

  const handleDismiss = () => {
    if (form.formState.isSubmitting) return
    onOpenChange(false)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (!user) return

    try {
      await postApproveUser({
        userId: user.userId,
        userRoleId: values.userRoleId,
        approvedStatus: true,
      })

      await onApproved()
    } catch (error) {
      console.error("Approve error:", error)
    }
  })

  const canSubmit =
    !rolesLoading &&
    !rolesErrored &&
    roles.length > 0 &&
    user !== null

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleDismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve user</DialogTitle>
          <DialogDescription>
            {user
              ? `Select a role for ${displayName(user)} (${user.email}) before approving.`
              : "Select a role before approving this user."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form} key={user?.userId ?? "closed"}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="userRoleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>

                  {rolesLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Loading roles…
                    </p>
                  ) : rolesErrored ? (
                    <p className="text-sm text-destructive">
                      Could not load roles. Refresh the page and try again.
                    </p>
                  ) : roles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No roles available.
                    </p>
                  ) : (
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                      disabled={form.formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem
                            key={role.userRoleId}
                            value={String(role.userRoleId)}
                          >
                            {role.userRole}
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