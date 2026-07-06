'use client';

import { useEffect, useState } from 'react';

interface Props {
  images: string[];
}

export default function HeroSlideshow({ images }: Props) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => {
      setPrev(current);
      setFading(true);
      const next = (current + 1) % images.length;
      setTimeout(() => {
        setCurrent(next);
        setFading(false);
        setPrev(null);
      }, 800);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, images.length]);

  if (!images.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Previous slide — fades out */}
      {prev !== null && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 opacity-0"
          style={{ backgroundImage: `url('${images[prev]}')` }}
        />
      )}
      {/* Current slide */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url('${images[current]}')` }}
      />
      {/* Dark overlay so text stays readable */}
      <div className="absolute inset-0 bg-gray-900/65" />

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-yellow-400 w-4' : 'bg-white/50 hover:bg-white/80'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
