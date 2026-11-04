import {
  businessPagePath,
  type TBusinessPage,
} from '@/utils/constants/business-pages.constants';
import { SITE_URL } from '@/utils/constants/site.constants';

export function buildBusinessJsonLd(page: TBusinessPage) {
  const pageUrl = `${SITE_URL}${businessPagePath(page.slug)}`;
  const crumbs = [
    { name: 'Início', item: SITE_URL },
    { name: 'Para negócios', item: `${SITE_URL}${businessPagePath('')}` },
    ...(page.slug ? [{ name: page.heading, item: pageUrl }] : []),
  ];

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        ...crumb,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ];
}
