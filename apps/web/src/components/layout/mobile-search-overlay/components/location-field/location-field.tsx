import { ArrowLeft, CheckCircle2, MapPin, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export type TLocationFieldConfig = {
  value: string;
  isActive: boolean;
  suggestions: string[];
  onChange: (value: string) => void;
  onSelect: (location: string) => void;
  onClear: () => void;
  onToggleActive: () => void;
};

export const LocationField = ({
  value,
  isActive,
  suggestions,
  onChange,
  onSelect,
  onClear,
  onToggleActive,
}: TLocationFieldConfig) => {
  return (
    <motion.div
      initial={false}
      animate={{
        scale: isActive ? 1.02 : 1,
      }}
      className="relative"
    >
      <button
        onClick={onToggleActive}
        className={`w-full p-5 border-2 rounded-2xl text-left transition-all relative ${
          isActive
            ? 'border-[#0A0A0A] bg-white shadow-lg'
            : value
              ? 'border-green-500 bg-white hover:border-green-600 hover:shadow-md'
              : 'border-[#E4E4E7] bg-white hover:border-[#D4D4D8] hover:shadow-md'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              value ? 'bg-green-100' : 'bg-[#F4F4F5]'
            }`}
          >
            {value ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <MapPin className="w-5 h-5 text-[#2B2B2B]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#71717A] mb-1 uppercase tracking-wide">
              Onde
            </div>
            {isActive ? (
              <input
                type="text"
                placeholder="Buscar destinos"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="w-full text-[#0A0A0A] placeholder:text-[#A1A1AA] bg-transparent border-none outline-none"
              />
            ) : (
              <div className="text-[#0A0A0A] truncate">
                {value || 'Buscar destinos'}
              </div>
            )}
          </div>
          {value && !isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-[#F4F4F5] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-[#71717A]" />
            </button>
          )}
        </div>
      </button>

      {/* Location Suggestions */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 space-y-2"
          >
            {suggestions.length > 0 ? (
              suggestions.map((location, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelect(location)}
                  className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-xl text-left text-sm hover:bg-[#FAFAFA] hover:border-[#0A0A0A] transition-all flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 bg-[#F4F4F5] rounded-lg flex items-center justify-center group-hover:bg-[#0A0A0A] transition-colors flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#A1A1AA] group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-[#0A0A0A] flex-1">{location}</span>
                  <ArrowLeft className="w-4 h-4 text-[#D4D4D8] group-hover:text-[#0A0A0A] rotate-180 transition-colors" />
                </motion.button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-[#71717A] text-sm">
                Nenhuma localização encontrada
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
