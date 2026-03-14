import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Grid3X3, Maximize, X, Download } from "lucide-react";
import { generateProductPDF } from "@/utils/generateProductPDF";
import TitleSlide from "@/components/slides/TitleSlide";
import OverviewSlide from "@/components/slides/OverviewSlide";
import PackagesSlide from "@/components/slides/PackagesSlide";
import VehiclesSlide from "@/components/slides/VehiclesSlide";
import DestinationsSlide from "@/components/slides/DestinationsSlide";
import BookingsSlide from "@/components/slides/BookingsSlide";
import DriversSlide from "@/components/slides/DriversSlide";
import InvoicingSlide from "@/components/slides/InvoicingSlide";
import CommunicationSlide from "@/components/slides/CommunicationSlide";
import AdminSlide from "@/components/slides/AdminSlide";
import TechStackSlide from "@/components/slides/TechStackSlide";
import ClosingSlide from "@/components/slides/ClosingSlide";

const slides = [
  { component: TitleSlide, label: "Title" },
  { component: OverviewSlide, label: "Overview" },
  { component: PackagesSlide, label: "Packages" },
  { component: VehiclesSlide, label: "Vehicles" },
  { component: DestinationsSlide, label: "Destinations" },
  { component: BookingsSlide, label: "Bookings" },
  { component: DriversSlide, label: "Drivers" },
  { component: InvoicingSlide, label: "Invoicing" },
  { component: CommunicationSlide, label: "Communication" },
  { component: AdminSlide, label: "Admin Panel" },
  { component: TechStackSlide, label: "Tech Stack" },
  { component: ClosingSlide, label: "Closing" },
];

const Presentation = () => {
  const [current, setCurrent] = useState(0);
  const [showGrid, setShowGrid] = useState(false);

  const next = useCallback(() => setCurrent((c) => Math.min(c + 1, slides.length - 1)), []);
  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  const goFullscreen = () => document.documentElement.requestFullscreen?.();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") prev();
      if (e.key === "g" || e.key === "G") setShowGrid((v) => !v);
      if (e.key === "Escape") setShowGrid(false);
      if (e.key === "f" || e.key === "F") goFullscreen();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const CurrentSlide = slides[current].component;

  if (showGrid) {
    return (
      <div className="min-h-screen bg-[hsl(220,20%,4%)] p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[hsl(40,20%,92%)] font-['Playfair_Display']">All Slides</h2>
          <button onClick={() => setShowGrid(false)} className="p-2 rounded-lg bg-[hsl(220,18%,12%)] text-[hsl(40,20%,80%)] hover:bg-[hsl(220,18%,16%)]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setShowGrid(false); }}
              className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                i === current ? "border-[hsl(38,92%,50%)] ring-2 ring-[hsl(38,92%,50%/0.3)]" : "border-[hsl(220,15%,18%)] hover:border-[hsl(220,15%,30%)]"
              }`}
            >
              <div className="w-full h-full pointer-events-none"><slide.component /></div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <span className="text-xs text-[hsl(40,20%,80%)]">{i + 1}. {slide.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col">
      {/* Slide area */}
      <div className="flex-1 relative">
        <CurrentSlide />
      </div>

      {/* Bottom bar */}
      <div className="h-14 bg-[hsl(220,20%,4%)] border-t border-[hsl(220,15%,15%)] flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowGrid(true)} className="p-2 rounded-lg hover:bg-[hsl(220,18%,12%)] text-[hsl(40,20%,60%)] hover:text-[hsl(40,20%,90%)]" title="Grid (G)">
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={goFullscreen} className="p-2 rounded-lg hover:bg-[hsl(220,18%,12%)] text-[hsl(40,20%,60%)] hover:text-[hsl(40,20%,90%)]" title="Fullscreen (F)">
            <Maximize className="w-4 h-4" />
          </button>
          <button onClick={generateProductPDF} className="p-2 rounded-lg hover:bg-[hsl(220,18%,12%)] text-[hsl(40,20%,60%)] hover:text-[hsl(40,20%,90%)]" title="Download PDF">
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={prev} disabled={current === 0} className="p-2 rounded-lg hover:bg-[hsl(220,18%,12%)] text-[hsl(40,20%,60%)] disabled:opacity-30">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-[hsl(40,20%,60%)] min-w-[60px] text-center font-medium">
            {current + 1} / {slides.length}
          </span>
          <button onClick={next} disabled={current === slides.length - 1} className="p-2 rounded-lg hover:bg-[hsl(220,18%,12%)] text-[hsl(40,20%,60%)] disabled:opacity-30">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-[hsl(220,10%,35%)]">← → to navigate • G for grid • F for fullscreen</div>
      </div>
    </div>
  );
};

export default Presentation;
