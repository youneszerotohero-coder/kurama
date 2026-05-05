import React from 'react';

const ImageCard = ({ src, alt, mb = false }) => (
  <div className={`relative overflow-hidden rounded-2xl group cursor-pointer h-[8em] aspect-[9/10] ${mb ? 'mb-[1em]' : ''} border border-border`}>
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
    />
    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
      <span className="text-foreground text-xs font-bold tracking-widest uppercase py-1 px-3 border border-border rounded-full bg-foreground/10">
        View
      </span>
    </div>
  </div>
);

function TestimonialsGrid() {
  return (
    <div className="flex gap-4 md:gap-6 px-4">
      <div className="hidden md:block mt-[4em]">
        <ImageCard src="/portrait1.png" alt="Testimonial 1" mb />
        <ImageCard src="/portrait2.png" alt="Testimonial 2" />
      </div>
      <div className="hidden md:block">
        <ImageCard src="/portrait11.png" alt="Testimonial 3" mb />
        <ImageCard src="/portrait9.png" alt="Testimonial 4" />
      </div>
      <div className="hidden md:block mt-[5em]">
        <ImageCard src="/portrait5.png" alt="Testimonial 5" />
      </div>
      <div className="mt-[1em]">
        <ImageCard src="/portrait10.png" alt="Testimonial 6" />
      </div>
      <div className="mt-[3em]">
        <ImageCard src="/portrait7.png" alt="Testimonial 7" />
      </div>
      <div className="mt-[1em]">
        <ImageCard src="/portrait2.png" alt="Testimonial 8" />
      </div>
      <div className="hidden md:block mt-[5em]">
        <ImageCard src="/portrait9.png" alt="Testimonial 9" />
      </div>
      <div className="hidden md:block">
        <ImageCard src="/portrait10.png" alt="Testimonial 10" mb />
        <ImageCard src="/portrait11.png" alt="Testimonial 11" />
      </div>
      <div className="hidden md:block mt-[4em]">
        <ImageCard src="/portrait1.png" alt="Testimonial 12" mb />
        <ImageCard src="/portrait2.png" alt="Testimonial 13" />
      </div>
    </div>
  );
}

export default TestimonialsGrid;
