'use client';

import { Button } from '@repo/ui';
import {
  PROFILE_SECTION_LEAD_CLASS,
  PROFILE_SECTION_TITLE_CLASS,
} from '../../profile.styles';
import { useWaitlistSection } from './waitlist-section.hook';

/** Filas abertas do cliente; some quando não há nenhuma. */
export const WaitlistSection = () => {
  const { waitlistItems, leavingEntryId, handleLeave } = useWaitlistSection();

  if (waitlistItems.length === 0) return null;

  return (
    <section aria-labelledby="waitlist-section-title" className="mt-9 md:mt-11">
      <h2 id="waitlist-section-title" className={PROFILE_SECTION_TITLE_CLASS}>
        Minhas listas de espera
      </h2>
      <p className={PROFILE_SECTION_LEAD_CLASS}>
        Até 5 listas abertas por loja. Depois do aviso, a entrada sai daqui.
      </p>

      <ul>
        {waitlistItems.map((item) => {
          const isLeaving = leavingEntryId === item.id;

          return (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 border-t border-[#F0EEF4] py-3.5 text-sm"
            >
              <div className="min-w-0">
                <p className="font-bold text-[#0B0B0F]">{item.storeName}</p>
                <p className="text-[#5F5C6E]">{item.details}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleLeave(item)}
                disabled={isLeaving}
                aria-label={`Sair da lista de espera de ${item.storeName}`}
                className="h-11 shrink-0 rounded-full border-[#E3E1EA] bg-white px-4 text-[13px] font-bold text-[#0B0B0F] shadow-none hover:bg-[#F7F6FA]"
              >
                {isLeaving ? 'Saindo...' : 'Sair'}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
