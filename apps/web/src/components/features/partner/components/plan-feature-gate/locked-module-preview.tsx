import type { TLockedModulePreviewConfig } from './plan-feature-gate.types';

const BLOCK = 'rounded-[20px] bg-surface';
const BAR_HEIGHTS = ['40%', '65%', '50%', '80%', '60%', '90%', '70%'];
const HEAT_TONES = ['var(--ss-brand-200)', 'var(--ss-brand-300)', 'var(--ss-brand-tint)'];

const KpiRow = () => (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
    {[0, 1, 2, 3].map((item) => (
      <div key={item} className={`h-28 ${BLOCK}`} />
    ))}
  </div>
);

/** Só blocos, sem números: mostra que o módulo existe sem inventar dados. */
export const LockedModulePreview = ({
  variant,
}: TLockedModulePreviewConfig) => {
  if (variant === 'form') {
    return (
      <div className="flex max-w-[760px] flex-col gap-4 rounded-[24px] border border-line p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-surface-2" />
            <div className="h-4 w-48 rounded-md bg-line" />
          </div>
          <div className="h-7 w-13 rounded-full bg-line" />
        </div>
        <div className="h-[50px] rounded-[14px] bg-surface" />
        <div className="h-28 rounded-[14px] bg-surface" />
        <div className="flex justify-between">
          <div className="h-12 w-44 rounded-full bg-surface-2" />
          <div className="h-12 w-48 rounded-full bg-line" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <KpiRow />
      {variant === 'heatmap' ? (
        <div className={`grid grid-cols-7 gap-2 p-6 ${BLOCK}`}>
          {Array.from({ length: 28 }, (_, index) => (
            <div
              key={index}
              className="h-8 rounded-lg"
              style={{ background: HEAT_TONES[(index * 5) % 3] }}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div
            className={`flex h-[280px] items-end gap-3.5 p-6 lg:col-span-2 ${BLOCK}`}
          >
            {BAR_HEIGHTS.map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-lg bg-brand-200"
                style={{ height }}
              />
            ))}
          </div>
          <div className={`h-[280px] ${BLOCK}`} />
        </div>
      )}
    </div>
  );
};
