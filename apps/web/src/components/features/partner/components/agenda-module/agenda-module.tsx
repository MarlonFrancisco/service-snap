'use client';

import { useAgendaModule } from './agenda-module.hook';
import { AgendaNoStoreMessage } from './components/agenda-data-state/agenda-data-state';
import { AgendaDefaultView } from './components/agenda-default-view/agenda-default-view';
import { FocusModeView } from './components/focus-mode-view/focus-mode-view';

export function AgendaModule() {
  const { isFocusMode, hasNoStore } = useAgendaModule();

  if (hasNoStore) {
    return <AgendaNoStoreMessage />;
  }

  if (isFocusMode) {
    return <FocusModeView />;
  }

  return <AgendaDefaultView />;
}
