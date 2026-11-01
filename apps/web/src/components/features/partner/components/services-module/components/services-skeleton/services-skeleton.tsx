import { Skeleton } from '@repo/ui';
import { SERVICES_KPI_GRID_CLASS } from '../../services-module.styles';

const BONE_CLASS = 'bg-[#EBE9F0]';
const SKELETON_ROWS = ['first', 'second', 'third'];

export const ServicesSkeleton = () => (
  <div
    role="status"
    aria-label="Carregando serviços"
    className="grid gap-[18px]"
  >
    <div className={SERVICES_KPI_GRID_CLASS}>
      <Skeleton className={`h-[106px] rounded-[22px] ${BONE_CLASS}`} />
      <Skeleton className={`h-[106px] rounded-[22px] ${BONE_CLASS}`} />
    </div>

    <Skeleton className={`h-12 rounded-full ${BONE_CLASS}`} />

    <div className="overflow-hidden rounded-[22px] border border-[#EBE9F0]">
      <div className="grid gap-2 bg-[#F7F6FA] px-5 py-3.5">
        <Skeleton className={`h-5 w-40 rounded-[14px] ${BONE_CLASS}`} />
        <Skeleton className={`h-4 w-28 rounded-[14px] ${BONE_CLASS}`} />
      </div>
      {SKELETON_ROWS.map((row) => (
        <div
          key={row}
          className="grid gap-2 border-t border-[#F0EEF4] px-5 py-4"
        >
          <Skeleton className={`h-5 w-48 max-w-full rounded-[14px] ${BONE_CLASS}`} />
          <Skeleton className={`h-4 w-72 max-w-full rounded-[14px] ${BONE_CLASS}`} />
          <Skeleton className={`h-4 w-32 rounded-[14px] ${BONE_CLASS}`} />
        </div>
      ))}
    </div>
  </div>
);
