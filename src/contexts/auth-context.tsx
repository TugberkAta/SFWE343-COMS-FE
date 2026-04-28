"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import getMe from "@/services/auth/get-me";

type MeResponse = {
  user?: any;
  permissions_json?: string[];
};

type AuthContextType = {
  me: MeResponse | null;
  permissions: string[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await getMe();
      const data = resp.data as MeResponse;
      setMe(data);
      setPermissions(data?.permissions_json ?? []);
    } catch (err) {
      setMe(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ me, permissions, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
