import { useAnalytics } from '@/providers/analytics.provider';
import { useEffect } from 'react';
import type { TDashboardViewTrackerConfig } from './dashboard-view-tracker.types';

export const useDashboardViewTracker = ({
  section,
}: TDashboardViewTrackerConfig) => {
  const analytics = useAnalytics();

  // Uma vez por montagem da página (ou troca de seção).
  useEffect(() => {
    analytics.track('dashboard_viewed', { section });
  }, [analytics, section]);
};
