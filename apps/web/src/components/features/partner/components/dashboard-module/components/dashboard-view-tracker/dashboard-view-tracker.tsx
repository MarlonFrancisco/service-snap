'use client';

import { useDashboardViewTracker } from './dashboard-view-tracker.hook';
import type { TDashboardViewTrackerConfig } from './dashboard-view-tracker.types';

/** Ponte client para as páginas do dashboard, que são server components. */
export const DashboardViewTracker = ({
  section,
}: TDashboardViewTrackerConfig) => {
  useDashboardViewTracker({ section });
  return null;
};
