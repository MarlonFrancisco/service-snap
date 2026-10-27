'use client';
import { usePartnerStore } from '@/store/partner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  Separator,
  Sheet,
  SheetContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@repo/ui';
import type { ReactNode } from 'react';
import { AdminSidebar, StoreSelector } from './components';
import { OnboardingChecklist } from './components/onboarding-checklist';
import { usePartner } from './partner.hook';

type TPartnerProps = {
  children: ReactNode;
};

export function Partner({ children }: TPartnerProps) {
  const { currentModule, showStoreSelector } = usePartner();
  const isMobileSidebarOpen = usePartnerStore(
    (state) => state.isMobileSidebarOpen,
  );
  const setIsMobileSidebarOpen = usePartnerStore(
    (state) => state.setIsMobileSidebarOpen,
  );

  return (
    <SidebarProvider>
      <div className="h-screen bg-gray-50 flex overflow-hidden w-full">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 lg:hidden">
            <AdminSidebar />
          </SheetContent>
        </Sheet>

        <SidebarInset>
          {/* Header */}
          <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 sm:px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <SidebarTrigger className="-ml-1 shrink-0" />
              <Separator orientation="vertical" className="h-4 mr-1 sm:mr-2" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-gray-900 text-sm sm:text-base truncate">
                      {currentModule.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Store Selector - Only show for modules that need it */}
            {showStoreSelector && (
              <div className="ml-auto shrink-0">
                <StoreSelector />
              </div>
            )}
          </header>

          {/* Module Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <OnboardingChecklist />
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
