import { TrackedSummary } from '@/components/ui/tracked-summary';
import { serializeJsonLd } from '@/utils/helpers/json-ld.helper';
import { HOME_FAQ } from './home-faq.constants';

const FAQ_JSON_LD = serializeJsonLd({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQ.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
});

export const HomeFaq = () => {
  return (
    <section
      aria-labelledby="perguntas-frequentes"
      className="mx-auto w-full max-w-[82.5rem] px-5 pt-12 md:px-10 md:pt-20"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: FAQ_JSON_LD }}
      />
      <h2
        id="perguntas-frequentes"
        className="text-[22px] leading-[1.15] font-extrabold tracking-[-0.025em] md:text-[28px]"
      >
        Perguntas frequentes
      </h2>
      <div className="mt-4 max-w-[48rem] divide-y divide-[#EBE9F0] border-y border-[#EBE9F0] md:mt-5">
        {HOME_FAQ.map((item, index) => (
          <details key={item.question} open={index === 0} className="py-4">
            <TrackedSummary
              event="faq_opened"
              properties={{ page: 'home', question_index: index }}
              className="cursor-pointer text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]"
            >
              {item.question}
            </TrackedSummary>
            <p className="mt-2 text-sm leading-[1.6] text-[#5F5C6E] md:text-[15px]">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
};
