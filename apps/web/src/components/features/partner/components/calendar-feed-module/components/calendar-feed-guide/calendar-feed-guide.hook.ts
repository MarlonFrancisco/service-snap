'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { CALENDAR_GUIDE_TABS } from '../../calendar-feed-module.constants';
import type { TCalendarGuideTabId } from '../../calendar-feed-module.types';

const NAVIGATION_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];

const getNextIndex = (key: string, index: number, total: number) => {
  if (key === 'Home') return 0;
  if (key === 'End') return total - 1;
  const step = key === 'ArrowRight' ? 1 : -1;
  return (index + step + total) % total;
};

export const useCalendarFeedGuide = () => {
  const baseId = useId();
  const [activeTabId, setActiveTabId] = useState<TCalendarGuideTabId>(
    CALENDAR_GUIDE_TABS[0].id,
  );

  const activeTab =
    CALENDAR_GUIDE_TABS.find(({ id }) => id === activeTabId) ??
    CALENDAR_GUIDE_TABS[0];

  // Setas trocam de aba e levam o foco junto, como pede o padrão de abas do ARIA.
  const handleTabListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!NAVIGATION_KEYS.includes(event.key)) return;
    event.preventDefault();

    const currentIndex = CALENDAR_GUIDE_TABS.indexOf(activeTab);
    const nextIndex = getNextIndex(
      event.key,
      currentIndex,
      CALENDAR_GUIDE_TABS.length,
    );
    const nextTab = CALENDAR_GUIDE_TABS[nextIndex];
    if (!nextTab) return;

    setActiveTabId(nextTab.id);
    event.currentTarget
      .querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  };

  return {
    tabs: CALENDAR_GUIDE_TABS,
    activeTab,
    setActiveTabId,
    handleTabListKeyDown,
    getTabId: (tabId: TCalendarGuideTabId) => `${baseId}-tab-${tabId}`,
    panelId: `${baseId}-panel`,
    titleId: `${baseId}-title`,
  };
};
