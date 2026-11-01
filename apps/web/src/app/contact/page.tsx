'use client';

import { Footer, Header } from '@/components/layout';
import {
  PUBLIC_CONTACT_EMAIL,
  SOCIAL_LINKS,
} from '@/utils/constants/contact.constants';
import Link from 'next/link';
import { useContact } from './contact.hook';

const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';
const LABEL_CLASS = 'grid gap-[7px] text-sm font-semibold';
const FIELD_CLASS = `w-full rounded-[14px] border border-[#E3E1EA] bg-white px-4 text-[15px] font-medium text-[#0B0B0F] ${FOCUS_CLASS}`;
const PANEL_TITLE_CLASS = 'mb-1.5 text-lg font-extrabold tracking-[-0.015em]';
const PANEL_TEXT_CLASS = 'text-sm leading-[1.6] text-[#5F5C6E]';
const PANEL_LINK_CLASS = `mt-1.5 inline-flex min-h-11 items-center text-[15px] font-bold underline ${FOCUS_CLASS}`;
const PANEL_DIVIDER_CLASS = 'border-t border-[#F0EEF4] pt-[22px]';

export default function ContactPage() {
  const { form, handleFieldChange, handleSubmit } = useContact();

  return (
    <Header>
      <main className="mx-auto max-w-[82.5rem] px-5 pb-10 md:px-10 md:pb-0">
        <div className="mx-auto grid max-w-[67.5rem] grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] items-start gap-x-16 gap-y-10 pt-4 md:pt-10">
          <section>
            <h1 className="text-[34px] leading-[1.08] font-extrabold tracking-[-0.035em] md:text-[44px]">
              Entre em contato
            </h1>
            <p className="mt-3 mb-6 text-base leading-[1.6] text-[#5F5C6E]">
              Tem alguma dúvida, sugestão ou precisa de ajuda? Escreva para nós.
              Abrimos seu cliente de e-mail com a mensagem pronta.
            </p>

            <form className="grid gap-3.5" onSubmit={handleSubmit}>
              <label className={LABEL_CLASS}>
                Nome completo
                <input
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleFieldChange('name')}
                  className={`h-[52px] ${FIELD_CLASS}`}
                  required
                />
              </label>

              <label className={LABEL_CLASS}>
                E-mail
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleFieldChange('email')}
                  className={`h-[52px] ${FIELD_CLASS}`}
                  required
                />
              </label>

              <label className={LABEL_CLASS}>
                Assunto
                <input
                  type="text"
                  value={form.subject}
                  onChange={handleFieldChange('subject')}
                  className={`h-[52px] ${FIELD_CLASS}`}
                />
              </label>

              <label className={LABEL_CLASS}>
                Mensagem
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={handleFieldChange('message')}
                  className={`min-h-[130px] resize-y pt-3.5 ${FIELD_CLASS}`}
                  required
                />
              </label>

              <button
                type="submit"
                className={`h-[54px] cursor-pointer rounded-full bg-[#0B0B0F] text-[15px] font-bold text-white transition-colors hover:bg-[#2B2B2B] ${FOCUS_CLASS}`}
              >
                Abrir e-mail para enviar
              </button>
            </form>
          </section>

          <aside className="grid gap-[22px] rounded-[28px] p-7 shadow-[0_12px_40px_rgba(15,12,30,0.1)]">
            <div>
              <h2 className={PANEL_TITLE_CLASS}>Atendimento</h2>
              <p className={PANEL_TEXT_CLASS}>
                Respondemos por e-mail em dias úteis.
              </p>
              <a
                href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
                className={PANEL_LINK_CLASS}
              >
                {PUBLIC_CONTACT_EMAIL}
              </a>
            </div>

            {SOCIAL_LINKS.length > 0 ? (
              <div className={PANEL_DIVIDER_CLASS}>
                <h2 className={PANEL_TITLE_CLASS}>Redes sociais</h2>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {SOCIAL_LINKS.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex h-11 items-center rounded-full border border-[#E3E1EA] px-4 text-[13px] font-semibold transition-colors hover:border-[#0B0B0F] ${FOCUS_CLASS}`}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className={PANEL_DIVIDER_CLASS}>
              <h2 className={PANEL_TITLE_CLASS}>Quer ser parceiro?</h2>
              <p className={PANEL_TEXT_CLASS}>
                Conheça os planos e cadastre seu negócio no ServiceSnap.
              </p>
              <Link href="/pricing" className={PANEL_LINK_CLASS}>
                Ver planos →
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <Footer compact />
    </Header>
  );
}
