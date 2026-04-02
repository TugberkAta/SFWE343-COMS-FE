"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Authentication from "@/services/auth/authentication";

const auth = new Authentication();

function initials(first: string, last: string) {
  const a = first.trim().at(0) ?? "";
  const b = last.trim().at(0) ?? "";
  return `${a}${b}`.toUpperCase() || "—";
}

export default function AccountPage() {
  const currentUser = useMemo(() => auth.getCurrentUser(), []);

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-2 md:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Account
      </h1>

      <div className="flex">
        <Card className="w-full border-border bg-card shadow-sm">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base font-medium">Account details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-8 p-6 pt-0 sm:flex-row sm:items-start">
            <Avatar className="size-28 shrink-0 rounded-full border border-border/60">
              <AvatarFallback className="rounded-full bg-muted text-2xl font-medium text-foreground">
                {initials(currentUser?.firstName || "—", currentUser?.lastName || "—")}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">First Name</p>
                <p className="text-base text-foreground">{currentUser?.firstName || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Name</p>
                <p className="text-base text-foreground">{currentUser?.lastName || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-base text-foreground">{currentUser?.email || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
