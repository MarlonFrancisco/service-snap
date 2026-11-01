import { motion } from 'motion/react';

export type TProgressBarConfig = {
  current: number;
  total: number;
};

export const ProgressBar = ({ current, total }: TProgressBarConfig) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#71717A]">
          {current === total
            ? 'Pronto para buscar! ✨'
            : `${current} de ${total} campos preenchidos`}
        </span>
        <span className="text-xs font-medium text-[#2B2B2B]">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-[#F4F4F5] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-[#2B2B2B] to-[#0A0A0A] rounded-full"
        />
      </div>
    </div>
  );
};
