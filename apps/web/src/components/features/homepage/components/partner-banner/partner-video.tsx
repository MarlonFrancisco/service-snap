'use client';

import { usePartnerVideo } from './partner-video.hook';

type TPartnerVideoProps = {
  src: string;
  poster: string;
  width: number;
  height: number;
  className: string;
};

export const PartnerVideo = ({
  src,
  poster,
  width,
  height,
  className,
}: TPartnerVideoProps) => {
  const { videoRef } = usePartnerVideo();

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      preload="none"
      width={width}
      height={height}
      muted
      loop
      playsInline
      controls
      aria-label="Demonstração do ServiceSnap: o cliente agenda pelo site ou pelo WhatsApp, e o negócio acompanha a agenda, a equipe e os resultados."
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
};
