import {
  EXPERIENCE_SLIDE_CLASS,
  EXPERIENCE_TRACK_CLASS,
} from './experience-carousel.constants';

type TExperienceCarouselSkeletonConfig = {
  title: string;
};

export const ExperienceCarouselSkeleton = ({
  title,
}: TExperienceCarouselSkeletonConfig) => {
  return (
    <section className="mx-auto w-full max-w-[82.5rem] pt-9 md:px-10 md:pt-14">
      <div className="mb-4 px-5 md:mb-[22px] md:px-0">
        <h2 className="text-xl font-bold tracking-[-0.02em] text-[#0B0B0F] md:text-2xl md:tracking-[-0.025em]">
          {title}
        </h2>
      </div>
      <div className="overflow-hidden">
        <div className={`flex ${EXPERIENCE_TRACK_CLASS}`}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`${EXPERIENCE_SLIDE_CLASS} min-w-0 shrink-0 grow-0`}
            >
              <div className="aspect-square animate-pulse rounded-[20px] bg-[#EBE9F0] md:rounded-[22px]" />
              <div className="mt-3 space-y-2 md:mt-3.5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-[#EBE9F0]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-[#EBE9F0]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[#EBE9F0]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
