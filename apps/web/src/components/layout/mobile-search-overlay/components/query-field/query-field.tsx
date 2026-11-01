import { ArrowLeft, CheckCircle2, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { TPopularQuery } from '../../mobile-search-overlay.types';

export type TQueryFieldConfig = {
  value: string;
  isActive: boolean;
  suggestions: string[];
  popularQueries: TPopularQuery[];
  onChange: (value: string) => void;
  onSelect: (query: string) => void;
  onClear: () => void;
  onToggleActive: () => void;
};

export const QueryField = ({
  value,
  isActive,
  suggestions,
  popularQueries,
  onChange,
  onSelect,
  onClear,
  onToggleActive,
}: TQueryFieldConfig) => {
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
        className={`w-full p-5 border-2 rounded-2xl text-left transition-all ${
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
              <Search className="w-5 h-5 text-[#2B2B2B]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#71717A] mb-1 uppercase tracking-wide">
              O que
            </div>
            {isActive ? (
              <input
                type="text"
                placeholder="Tipo de serviço"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="w-full text-[#0A0A0A] placeholder:text-[#A1A1AA] bg-transparent border-none outline-none"
              />
            ) : (
              <div className="text-[#0A0A0A] truncate">
                {value || 'Tipo de serviço'}
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

      {/* Service Suggestions */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3"
          >
            {/* Popular Services */}
            {value === '' && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-[#71717A] mb-2 px-1 uppercase tracking-wide">
                  Populares
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {popularQueries.map((query, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onSelect(query.name)}
                      className="px-4 py-3 bg-white border border-[#E4E4E7] rounded-xl text-left hover:bg-[#FAFAFA] hover:border-[#0A0A0A] transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{query.icon}</span>
                        <span className="text-sm text-[#0A0A0A]">
                          {query.name}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Service Suggestions */}
            <div className="space-y-2">
              {value && (
                <p className="text-xs font-semibold text-[#71717A] mb-2 px-1 uppercase tracking-wide">
                  Sugestões
                </p>
              )}
              {suggestions.length > 0
                ? suggestions.map((query, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onSelect(query)}
                      className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-xl text-left text-sm hover:bg-[#FAFAFA] hover:border-[#0A0A0A] transition-all flex items-center justify-between group"
                    >
                      <span className="text-[#0A0A0A]">{query}</span>
                      <ArrowLeft className="w-4 h-4 text-[#D4D4D8] group-hover:text-[#0A0A0A] rotate-180 transition-colors" />
                    </motion.button>
                  ))
                : value && (
                    <div className="px-4 py-8 text-center text-[#71717A] text-sm">
                      Nenhum serviço encontrado
                    </div>
                  )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
