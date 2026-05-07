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
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions"
import { createUserType, updateUserType } from "@/services/user-types"
import type { UserType } from "@/types/user-type"

const userTypeFormSchema = z.object({
  userType: z.string().min(1, "User type name is required"),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
})

type UserTypeFormValues = z.infer<typeof userTypeFormSchema>

const ALL_PERMISSIONS = Object.values(ENDPOINT_PERMISSIONS).flatMap((group) =>
  Object.values(group)
)

type UserTypeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userType: UserType | null
  onSuccess: () => void
  trigger?: React.ReactNode
}

export function UserTypeDialog({
  open,
  onOpenChange,
  userType,
  onSuccess,
  trigger,
}: UserTypeDialogProps) {
  const isEdit = userType !== null
  
  const form = useForm<UserTypeFormValues>({
    resolver: zodResolver(userTypeFormSchema),
    defaultValues: {
      userType: userType?.userType ?? "",
      permissions: userType?.permissions ?? [],
    },
  })

  React.useEffect(() => {
    if (open) {
      if (isEdit && userType) {
        form.reset({
          userType: userType.userType,
          permissions: userType.permissions,
        })
      } else {
        form.reset({
          userType: "",
          permissions: [],
        })
      }
    }
  }, [open, isEdit, userType, form])

  const onSubmit = async (data: UserTypeFormValues) => {
    try {
      if (isEdit && userType) {
        await updateUserType(userType.userTypeId, data)
      } else {
        await createUserType(data)
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving user type:", error)
    }
  }

  const handleDismiss = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleDismiss()}>
      {trigger && <>{trigger}</>}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User Type" : "Create User Type"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the user type name and assign permissions."
              : "Create a new user type and assign permissions."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Type Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Teacher, Admin, Coordinator"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <div className="space-y-4">
                    {Object.entries(ENDPOINT_PERMISSIONS).map(([group, permissions]) => (
                      <div key={group} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-sm mb-3 capitalize">
                          {group} Management
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(permissions).map(([key, value]) => (
                            <FormField
                              key={value}
                              control={form.control}
                              name="permissions"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value.includes(value)}
                                      onCheckedChange={(checked) => {
                                        const newValue = checked
                                          ? [...field.value, value]
                                          : field.value.filter((p) => p !== value)
                                        field.onChange(newValue)
                                      }}
                                      disabled={form.formState.isSubmitting}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {key}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
