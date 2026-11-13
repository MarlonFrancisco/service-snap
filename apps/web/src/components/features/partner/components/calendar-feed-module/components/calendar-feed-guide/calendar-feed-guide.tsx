'use client';

import { cn } from '@repo/ui';
import {
  MODULE_CARD_CLASS,
  MODULE_CARD_TITLE_CLASS,
} from '../../../notifications-module/notifications-module.styles';
import {
  CALENDAR_TAB_ACTIVE_CLASS,
  CALENDAR_TAB_CLASS,
} from '../../calendar-feed-module.styles';
import { useCalendarFeedGuide } from './calendar-feed-guide.hook';

export const CalendarFeedGuide = () => {
  const {
    tabs,
    activeTab,
    setActiveTabId,
    handleTabListKeyDown,
    getTabId,
    panelId,
    titleId,
  } = useCalendarFeedGuide();

  return (
    <section aria-labelledby={titleId} className={MODULE_CARD_CLASS}>
      <h3 id={titleId} className={MODULE_CARD_TITLE_CLASS}>
        Como adicionar
      </h3>

      <div
        role="tablist"
        aria-label="Calendário"
        onKeyDown={handleTabListKeyDown}
        className="flex flex-wrap gap-1.5"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;

          return (
            <button
              key={tab.id}
              id={getTabId(tab.id)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTabId(tab.id)}
              className={cn(
                CALENDAR_TAB_CLASS,
                isActive && CALENDAR_TAB_ACTIVE_CLASS,
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={getTabId(activeTab.id)}
        tabIndex={0}
      >
        <ol className="list-decimal pl-5 text-sm leading-[1.7]">
          {activeTab.steps.map((parts, stepIndex) => (
            <li key={stepIndex}>
              {parts.map((part, partIndex) =>
                typeof part === 'string' ? (
                  part
                ) : (
                  <b key={partIndex}>{part.strong}</b>
                ),
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
