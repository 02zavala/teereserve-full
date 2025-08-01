'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useTenant } from '@/hooks/useTenant';

interface TenantContextType {
  tenantId: string | null;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { tenantId, loading } = useTenant();

  return (
    <TenantContext.Provider value={{ tenantId, loading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
}

