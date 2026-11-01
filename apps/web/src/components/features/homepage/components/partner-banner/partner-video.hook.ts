import { useEffect, useRef } from 'react';

const VISIBLE_THRESHOLD = 0.5;

/** Baixa e toca o vídeo só quando ele aparece na tela, sem retomar se a pessoa pausou. */
export const usePartnerVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let hasBeenVisible = false;
    let shouldResume = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          hasBeenVisible = true;
          if (shouldResume) video.play().catch(() => undefined);
          return;
        }
        // A primeira chamada chega com o vídeo ainda fora da tela: não é uma pausa da pessoa.
        if (!hasBeenVisible) return;
        shouldResume = !video.paused;
        video.pause();
      },
      { threshold: VISIBLE_THRESHOLD },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return { videoRef };
};
