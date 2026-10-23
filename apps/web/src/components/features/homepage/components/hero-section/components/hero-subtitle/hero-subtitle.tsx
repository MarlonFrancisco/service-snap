'use client';

import { TextAnimate } from '@repo/ui';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const HeroSubtitle = () => {
  return (
    <>
      <TextAnimate
        animation="slideLeft"
        by="word"
        as="p"
        className="text-base sm:text-lg text-neutral-600 mb-6 max-w-xl mx-auto"
      >
        Encontre e agende com os melhores profissionais perto de você. Simples,
        rápido e confiável.
      </TextAnimate>

      {/* AI-Powered Search Info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs sm:text-sm text-gray-500 mb-6 flex items-center justify-center gap-2"
      >
        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
        Digite naturalmente, nossa IA entende você
      </motion.p>
    </>
  );
};
