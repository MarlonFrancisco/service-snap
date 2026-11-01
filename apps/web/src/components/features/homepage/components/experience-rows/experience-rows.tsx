import { getExperienceRows } from '../../homepage.data';
import { ExperienceCarousel } from '../experience-carousel';

const getSeeAllHref = (query: string, category?: string) => {
  const params = new URLSearchParams({ query });
  if (category) {
    params.set('category', category);
  }
  return `/booking?${params.toString()}`;
};

export const ExperienceRows = async () => {
  const rows = await getExperienceRows();

  return (
    <>
      {rows.map((row) => (
        <ExperienceCarousel
          key={row.id}
          title={row.title}
          seeAllHref={getSeeAllHref(row.query, row.category)}
          items={row.items}
        />
      ))}
    </>
  );
};
