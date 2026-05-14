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
import patchUserRole from "@/services/users/patch-user-role"
import type { UserWithRole } from "@/types/user-with-role"
import type { UserType } from "@/types/user-type"
import { PermissionGate } from "@/components/PermissionGate"
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions"

const assignUserTypeFormSchema = z.object({
  userTypeId: z.number().int().positive(),
})

type AssignUserTypeFormValues = z.infer<typeof assignUserTypeFormSchema>

function displayName(user: UserWithRole) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "—"
}

type AssignUserTypeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithRole | null
  userTypes: UserType[]
  userTypesLoading: boolean
  userTypesErrored: boolean
  onAssigned: () => Promise<void>
}

export function AssignUserTypeDialog({
  open,
  onOpenChange,
  user,
  userTypes,
  userTypesLoading,
  userTypesErrored,
  onAssigned,
}: AssignUserTypeDialogProps) {
  const form = useForm<AssignUserTypeFormValues>({
    resolver: zodResolver(assignUserTypeFormSchema),
    defaultValues: {
      userTypeId: undefined,
    },
  })

  React.useEffect(() => {
    if (open && user) {
      const currentTypeId =
        user.userTypeId != null
          ? userTypes.find((t) => t.userTypeId === user.userTypeId)?.userTypeId
          : undefined
      const fallbackTypeId = userTypes[0]?.userTypeId
      form.reset({
        userTypeId: currentTypeId ?? fallbackTypeId,
      })
    } else {
      form.reset()
    }
  }, [open, user, userTypes, form])

  const onSubmit = async (data: AssignUserTypeFormValues) => {
    if (!user) return
    try {
      await patchUserRole(user.userId, {
        userTypeId: data.userTypeId,
      })
      await onAssigned()
      onOpenChange(false)
    } catch (error) {
      console.error("Assign user type error:", error)
    }
  }

  const handleDismiss = () => {
    form.reset()
    onOpenChange(false)
  }

  const canSubmit =
    !userTypesLoading && !userTypesErrored && userTypes.length > 0 && user !== null

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleDismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign user type</DialogTitle>
          <DialogDescription>
            {user
              ? `Update user type for ${displayName(user)} (${user.email}).`
              : "Select a user type for this user."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form} key={user?.userId ?? "closed"}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      value={String(field.value ?? "")}
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

              <PermissionGate permission={ENDPOINT_PERMISSIONS.users.EDIT}>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !canSubmit}
                >
                  {form.formState.isSubmitting ? "Saving..." : "Save"}
                </Button>
              </PermissionGate>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
