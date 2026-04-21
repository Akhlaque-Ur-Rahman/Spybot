'use client';

import { useEffect, useRef } from 'react';

type ViewportVideoProps = {
  className: string;
  src: string;
  type: 'video/mp4' | 'video/webm';
  poster?: string;
  ariaLabel: string;
};

export default function ViewportVideo({
  className,
  src,
  type,
  poster,
  ariaLabel,
}: ViewportVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isInViewport = false;

    const syncPlayback = () => {
      if (document.hidden || !isInViewport) {
        video.pause();
        return;
      }

      void video.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewport = entry?.isIntersecting === true && entry.intersectionRatio >= 0.35;
        syncPlayback();
      },
      {
        threshold: [0, 0.35, 0.6],
      },
    );

    const onVisibilityChange = () => {
      syncPlayback();
    };

    observer.observe(video);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      video.pause();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-label={ariaLabel}
      disablePictureInPicture
      tabIndex={-1}
    >
      <source src={src} type={type} />
    </video>
  );
}
