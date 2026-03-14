import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageSliderProps {
  images: string[];
  alt: string;
}

const ImageSlider = ({ images, alt }: ImageSliderProps) => {
  const [current, setCurrent] = useState(0);
  const imgs = images.length > 0 ? images : ["/placeholder.svg"];

  const prev = () => setCurrent((c) => (c === 0 ? imgs.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === imgs.length - 1 ? 0 : c + 1));

  return (
    <div className="relative rounded-xl overflow-hidden aspect-video">
      <img src={imgs[current]} alt={`${alt} ${current + 1}`} className="w-full h-full object-cover" />
      {imgs.length > 1 && (
        <>
          <Button size="icon" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/80" onClick={prev}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/80" onClick={next}>
            <ChevronRight className="w-5 h-5" />
          </Button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {imgs.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-background/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageSlider;
