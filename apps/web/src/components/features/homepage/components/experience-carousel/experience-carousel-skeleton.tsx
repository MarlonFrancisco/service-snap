const SLIDE_BASIS =
  'basis-[82%] sm:basis-[46%] md:basis-[31%] lg:basis-[19%] xl:basis-[14.2857%]';

type TExperienceCarouselSkeletonConfig = {
  title: string;
};

export const ExperienceCarouselSkeleton = ({
  title,
}: TExperienceCarouselSkeletonConfig) => {
  return (
    <section className="mx-auto w-full max-w-[90rem] px-4 py-4 sm:px-6 sm:py-6 lg:px-12">
      <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#0A0A0A] sm:text-xl md:text-2xl">
          {title}
        </h2>
      </div>
      <div className="-ml-3 flex items-stretch overflow-hidden py-3 sm:-ml-4 lg:-ml-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`${SLIDE_BASIS} min-w-0 shrink-0 grow-0 pl-3 sm:pl-4 lg:pl-5`}
          >
            <div className="h-full w-full min-w-0 overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="aspect-square animate-pulse bg-[#E4E4E7]" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-[#E4E4E7]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-[#E4E4E7]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[#E4E4E7]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
