'use client';

import { TextAnimate } from '@repo/ui';

export const HeroTitle = () => {
  return (
    <h1
      className="font-display text-4xl font-medium tracking-tight text-balance text-neutral-950 sm:text-5xl md:text-6xl mb-6"
      id="service-snap-title"
    >
      <TextAnimate animation="slideLeft" by="text" as="span">
        ServiceSnap.
      </TextAnimate>
    </h1>
  );
};
