const SLIDE_BASIS = 'basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-[14.2857%]';

type TExperienceCarouselSkeletonConfig = {
  title: string;
};

export const ExperienceCarouselSkeleton = ({
  title,
}: TExperienceCarouselSkeletonConfig) => {
  return (
    <section className="mx-auto w-full max-w-[90rem] px-6 py-6 lg:px-12">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-[#0A0A0A] sm:text-2xl">
          {title}
        </h2>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className={`${SLIDE_BASIS} min-w-0 shrink-0 grow-0`}
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
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
