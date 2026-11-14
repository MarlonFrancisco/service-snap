'use client';

import { WhatsappBotQr, WhatsappGlyph } from '@/components/ui/whatsapp-bot-qr';
import { useBookingWhatsappLink } from './booking-whatsapp-card.hook';

/** Coluna lateral do passo de serviços: atalho para agendar pela conversa com o bot. */
export const BookingWhatsappCard = () => {
  const { whatsappBot, handleClick } =
    useBookingWhatsappLink('booking_sidebar');

  if (!whatsappBot) return null;

  return (
    <section
      aria-labelledby="booking-whatsapp-title"
      className="mb-5 flex flex-col gap-3.5 rounded-3xl bg-white p-6 text-[#0B0B0F] shadow-[0_12px_40px_rgba(15,12,30,0.1)]"
    >
      <h2
        id="booking-whatsapp-title"
        className="text-lg font-extrabold tracking-[-0.01em]"
      >
        Prefere marcar pelo WhatsApp?
      </h2>
      <p className="text-sm leading-normal text-[#5F5C6E]">
        Agende, remarque ou cancele pela conversa, sem criar conta.
      </p>
      <a
        href={whatsappBot.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-[#0B0B0F] px-[22px] text-[15px] font-bold text-white transition-colors hover:bg-[#2B2B2B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]"
      >
        <WhatsappGlyph />
        Agendar pelo WhatsApp
      </a>
      <div className="flex items-center gap-[18px]">
        <WhatsappBotQr link={whatsappBot.link} size={96} />
        <small className="text-[13px] leading-[1.45] text-[#5F5C6E]">
          No computador, aponte a câmera do celular para abrir a conversa.
          <b className="block font-bold text-[#0B0B0F]">
            {whatsappBot.displayPhoneNumber}
          </b>
        </small>
      </div>
    </section>
  );
};
