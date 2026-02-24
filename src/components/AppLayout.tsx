import React from 'react';
import AppSidebar from '@/components/AppSidebar';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
