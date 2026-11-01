import { Calendar as CalendarIcon, MapPin, Search, X } from 'lucide-react';
import { motion } from 'motion/react';

export type TFilterChipsConfig = {
  location?: string;
  query?: string;
  date?: Date;
  onClearLocation: () => void;
  onClearQuery: () => void;
  onClearDate: () => void;
};

export const FilterChips = ({
  location,
  query,
  date,
  onClearLocation,
  onClearQuery,
  onClearDate,
}: TFilterChipsConfig) => {
  const activeFiltersCount = [location, query, date].filter(Boolean).length;

  if (activeFiltersCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 pb-3"
    >
      <div className="flex flex-wrap gap-2">
        {location && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F5] text-[#0A0A0A] rounded-full text-xs"
          >
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearLocation();
              }}
              className="ml-1 hover:bg-[#E4E4E7] rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
        {query && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F5] text-[#0A0A0A] rounded-full text-xs"
          >
            <Search className="w-3 h-3" />
            <span>{query}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearQuery();
              }}
              className="ml-1 hover:bg-[#E4E4E7] rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
        {date && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F5] text-[#0A0A0A] rounded-full text-xs"
          >
            <CalendarIcon className="w-3 h-3" />
            <span>
              {date.toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearDate();
              }}
              className="ml-1 hover:bg-[#E4E4E7] rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
