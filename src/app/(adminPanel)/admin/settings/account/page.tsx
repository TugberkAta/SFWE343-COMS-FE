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
    <div className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-2 md:px-8 bg-[#f8f8f8]">
      <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
        Account
      </h1>

      <div className="flex">
        <div className="w-full bg-white border border-[#e5e7eb] rounded-lg shadow-sm">
          <div className="p-6 pb-4 border-b border-[#e5e7eb]">
            <h2 className="text-base font-medium text-[#111827]">Account details</h2>
          </div>
          <div className="flex flex-col gap-8 p-6 pt-6 sm:flex-row sm:items-start">
            <div className="size-28 shrink-0 rounded-full border border-[#e5e7eb] bg-[#f3f4f6] flex items-center justify-center">
              <span className="text-2xl font-medium text-[#111827]">
                {initials(currentUser?.firstName || "—", currentUser?.lastName || "—")}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <div className="space-y-1">
                <p className="text-sm text-[#6b7280]">First Name</p>
                <p className="text-base text-[#111827]">{currentUser?.firstName || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[#6b7280]">Last Name</p>
                <p className="text-base text-[#111827]">{currentUser?.lastName || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[#6b7280]">Email</p>
                <p className="text-base text-[#111827]">{currentUser?.email || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
