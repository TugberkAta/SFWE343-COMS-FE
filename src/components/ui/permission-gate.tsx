"use client";

import React from "react";
import usePermission from "@/hooks/use-permission";

type PermissionGateProps = {
  permission: string;
  mode?: "hide" | "disable";
  children: React.ReactElement;
};

export default function PermissionGate({ permission, mode = "hide", children }: PermissionGateProps) {
  const { hasPermission } = usePermission();

  const allowed = hasPermission(permission);

  if (allowed) return children;

  if (mode === "hide") return null;

  // mode === 'disable'
  // try to clone child and set disabled prop if it exists
  try {
    return React.cloneElement(children, { disabled: true });
  } catch (err) {
    return null;
  }
}
