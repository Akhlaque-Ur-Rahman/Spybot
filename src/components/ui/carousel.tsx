'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType } from 'embla-carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './carousel.module.css';

export type CarouselApi = EmblaCarouselType;

type CarouselProps = React.ComponentProps<'div'> & {
  opts?: Parameters<typeof useEmblaCarousel>[0];
  plugins?: Parameters<typeof useEmblaCarousel>[1];
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi | undefined) => void;
};

type CarouselContextValue = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi | undefined;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  orientation: 'horizontal' | 'vertical';
};

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

export function useCarousel() {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  return ctx;
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(function Carousel(
  { orientation = 'horizontal', opts, setApi, plugins, className, children, ...props },
  ref
) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  );

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((emblaApi: CarouselApi) => {
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (orientation === 'horizontal') {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollNext();
        }
      } else {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          scrollNext();
        }
      }
    },
    [orientation, scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api) return;
    setApi?.(api);
    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);
    return () => {
      api.off('reInit', onSelect);
      api.off('select', onSelect);
    };
  }, [api, setApi, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        orientation,
      }}
    >
      <div
        ref={ref}
        className={cn(styles.root, className)}
        data-orientation={orientation}
        onKeyDownCapture={handleKeyDown}
        role="region"
        aria-roledescription="carousel"
        tabIndex={0}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});

const CarouselContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(function CarouselContent(
  { className, ...props },
  ref
) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className={cn(styles.viewport, className)}>
      <div
        ref={ref}
        className={cn(styles.container, orientation === 'vertical' && styles.containerVertical)}
        {...props}
      />
    </div>
  );
});

const CarouselItem = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(function CarouselItem(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(styles.slide, className)}
      {...props}
    />
  );
});

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>(function CarouselPrevious(
  { className, children, ...props },
  ref
) {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button
      type="button"
      ref={ref}
      className={cn(styles.navBtn, styles.prev, className)}
      disabled={!canScrollPrev}
      aria-label="Previous slide"
      onClick={scrollPrev}
      {...props}
    >
      {children ?? <ChevronLeft size={18} strokeWidth={2} aria-hidden />}
    </button>
  );
});

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>(function CarouselNext(
  { className, children, ...props },
  ref
) {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <button
      type="button"
      ref={ref}
      className={cn(styles.navBtn, styles.next, className)}
      disabled={!canScrollNext}
      aria-label="Next slide"
      onClick={scrollNext}
      {...props}
    >
      {children ?? <ChevronRight size={18} strokeWidth={2} aria-hidden />}
    </button>
  );
});

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
