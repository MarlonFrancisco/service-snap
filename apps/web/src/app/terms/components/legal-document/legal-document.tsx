import { Footer, Header } from '@/components/layout';
import Link from 'next/link';
import { LEGAL_BODY_CLASS, LEGAL_TABS } from './legal-document.constants';
import type { TLegalDocumentConfig } from './legal-document.types';
import { LegalToc } from './legal-toc';

export const LegalDocument = ({
  activeTab,
  title,
  updatedAt,
  sections,
}: TLegalDocumentConfig) => {
  const tocItems = sections.map(({ id, title: sectionTitle }) => ({
    id,
    title: sectionTitle,
  }));

  return (
    <Header>
      <main className="mx-auto max-w-[82.5rem] px-5 pb-10 md:px-10 md:pb-0">
        <nav
          aria-label="Documentos legais"
          className="flex flex-wrap gap-2 pt-2 md:pt-6"
        >
          {LEGAL_TABS.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex h-11 items-center rounded-full border px-[18px] text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F] ${
                  isActive
                    ? 'border-[#0B0B0F] bg-[#0B0B0F] text-white'
                    : 'border-[#E3E1EA] hover:border-[#0B0B0F]'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-start gap-x-16 gap-y-8 pt-8">
          <LegalToc items={tocItems} />

          <article className="max-w-[45rem] min-w-0 flex-[999_1_560px]">
            <h1 className="text-[34px] leading-[1.08] font-extrabold tracking-[-0.035em] md:text-[44px]">
              {title}
            </h1>
            <p className="mt-2.5 text-sm text-[#5F5C6E]">{updatedAt}</p>

            <div className={LEGAL_BODY_CLASS}>
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-16 pt-9 md:scroll-mt-20"
                >
                  <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">
                    {section.title}
                  </h2>
                  {section.content}
                </section>
              ))}
            </div>
          </article>
        </div>
      </main>
      <Footer compact />
    </Header>
  );
};
