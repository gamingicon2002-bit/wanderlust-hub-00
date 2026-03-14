import SlideLayout from "./SlideLayout";
import { MapPin, Sun, Sparkles, Image, FileText, Hotel } from "lucide-react";

const features = [
  { icon: Sparkles, text: "Highlight key attractions & points of interest" },
  { icon: Sun, text: "Best time to visit recommendations" },
  { icon: Image, text: "Rich image galleries for each destination" },
  { icon: Hotel, text: "Link related hotels to destinations" },
  { icon: FileText, text: "Detailed & short descriptions with brochure support" },
];

const DestinationsSlide = () => (
  <SlideLayout>
    <div className="w-full h-full bg-gradient-to-br from-[hsl(220,20%,4%)] to-[hsl(220,18%,8%)] p-16 flex gap-16">
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(28,80%,52%/0.15)] flex items-center justify-center mb-6 border border-[hsl(28,80%,52%/0.3)]">
          <MapPin className="w-8 h-8 text-[hsl(28,80%,52%)]" />
        </div>
        <p className="text-[16px] uppercase tracking-[4px] text-[hsl(28,80%,52%)] font-semibold mb-2">Module 03</p>
        <h2 className="text-[56px] font-bold text-[hsl(40,20%,92%)] font-['Playfair_Display'] leading-tight">Destinations</h2>
        <p className="text-[20px] text-[hsl(220,10%,55%)] mt-4 leading-relaxed max-w-[600px]">
          Showcase travel destinations with rich media, highlights, and seasonal recommendations to inspire travelers.
        </p>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-5">
        {features.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-5 p-5 rounded-xl border border-[hsl(220,15%,18%)] bg-[hsl(220,18%,10%/0.4)]">
            <div className="w-10 h-10 rounded-lg bg-[hsl(28,80%,52%/0.1)] flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-[hsl(28,80%,52%)]" />
            </div>
            <span className="text-[18px] text-[hsl(40,20%,80%)] leading-snug">{text}</span>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);

export default DestinationsSlide;
