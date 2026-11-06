'use client';

import { formatBusinessHours } from '@/utils/helpers/business-hours.helper';
import {
  useBusinessData,
  useBusinessInfoActions,
} from '../business-showcase.hook';

const INFO_ROW_CLASS =
  'flex justify-between gap-4 border-b border-[#EBE9F0] py-3 md:block md:border-0 md:p-0';
const INFO_LABEL_CLASS =
  'shrink-0 font-medium text-[#5F5C6E] md:mb-1 md:block md:text-xs md:font-bold md:tracking-[0.06em] md:uppercase';
const INFO_VALUE_CLASS = 'text-right md:block md:text-left';

export function BusinessInfo() {
  const data = useBusinessData();
  const { handleInstagramClick } = useBusinessInfoActions();

  if (!data) {
    return null;
  }

  const {
    businessAddress,
    description,
    amenities,
    openTime,
    closeTime,
    businessDays,
    instagramUrl,
    instagramLabel,
  } = data;

  return (
    <div>
      {description && (
        <p className="text-[15px] leading-[1.6] text-[#0B0B0F] md:text-[17px]">
          {description}
        </p>
      )}

      {amenities.length > 0 && (
        <div className="-mx-5 mt-3.5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:mt-4 md:flex-wrap md:overflow-visible md:px-0">
          {amenities.map((amenity) => (
            <span
              key={amenity}
              className="shrink-0 rounded-full bg-[#F4F3F7] px-3 py-2 text-xs font-semibold text-[#0B0B0F] md:px-3.5 md:text-[13px]"
            >
              {amenity}
            </span>
          ))}
        </div>
      )}

      <div className="mt-[18px] border-t border-[#EBE9F0] text-sm text-[#0B0B0F] md:mt-6 md:grid md:grid-cols-3 md:gap-6 md:border-b md:py-5">
        <div className={INFO_ROW_CLASS}>
          <span className={INFO_LABEL_CLASS}>Horário</span>
          <span className={INFO_VALUE_CLASS}>
            {formatBusinessHours(openTime, closeTime, businessDays)}
          </span>
        </div>
        <div className={INFO_ROW_CLASS}>
          <span className={INFO_LABEL_CLASS}>Endereço</span>
          <span className={INFO_VALUE_CLASS}>{businessAddress}</span>
        </div>
        {instagramUrl && instagramLabel ? (
          <div className={INFO_ROW_CLASS}>
            <span className={INFO_LABEL_CLASS}>Instagram</span>
            <span className={INFO_VALUE_CLASS}>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleInstagramClick}
                className="underline"
              >
                {instagramLabel}
              </a>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
