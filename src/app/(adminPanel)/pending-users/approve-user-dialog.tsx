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
      <DialogContent className="bg-white border border-[#e5e7eb] shadow-lg rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#111827]">Approve user</DialogTitle>
          <DialogDescription className="text-[#6b7280]">
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
                  <FormLabel className="text-[#111827] font-medium">Role</FormLabel>

                  {rolesLoading ? (
                    <p className="text-sm text-[#6b7280]">
                      Loading roles…
                    </p>
                  ) : rolesErrored ? (
                    <p className="text-sm text-red-600">
                      Could not load roles. Refresh the page and try again.
                    </p>
                  ) : roles.length === 0 ? (
                    <p className="text-sm text-[#6b7280]">
                      No roles available.
                    </p>
                  ) : (
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                      disabled={form.formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full bg-white border border-[#e5e7eb] rounded-lg text-[#111827] focus:border-[#ef233c] focus:ring-2 focus:ring-[#fff1f2]">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className="bg-white border border-[#e5e7eb] rounded-lg">
                        {roles.map((role) => (
                          <SelectItem
                            key={role.userRoleId}
                            value={String(role.userRoleId)}
                            className="text-[#111827] hover:bg-[#fff1f2] focus:bg-[#fff1f2]"
                          >
                            {role.userRole}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

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

              <PermissionGate permission={ENDPOINT_PERMISSIONS.users.APPROVE}>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !canSubmit}
                  className="bg-[#ef233c] hover:bg-[#e60012] text-white rounded-lg font-medium disabled:opacity-50"
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