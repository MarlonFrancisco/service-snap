import { CATEGORY_GUIDES } from '@/utils/constants/category-guides.constants';
import { describe, expect, it } from 'vitest';
import { CATEGORY_DIRECTORY_GROUPS } from './category-directory.constants';

describe('CATEGORY_DIRECTORY_GROUPS', () => {
  const slugs = CATEGORY_DIRECTORY_GROUPS.flatMap((group) =>
    group.items.map((item) => item.slug),
  );

  it('lista cada categoria com página uma única vez', () => {
    expect(new Set(slugs).size).toBe(slugs.length);
    expect([...slugs].sort()).toEqual(
      CATEGORY_GUIDES.map((guide) => guide.slug).sort(),
    );
  });
});
