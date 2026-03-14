import SlideLayout from "./SlideLayout";
import { Globe, Sparkles } from "lucide-react";

const TitleSlide = () => (
  <SlideLayout>
    <div className="w-full h-full bg-gradient-to-br from-[hsl(220,20%,4%)] via-[hsl(220,18%,8%)] to-[hsl(174,60%,10%)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-[hsl(38,92%,50%/0.06)] blur-3xl" />
      <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-[hsl(174,60%,35%/0.06)] blur-3xl" />
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-2xl bg-[hsl(38,92%,50%/0.15)] flex items-center justify-center border border-[hsl(38,92%,50%/0.3)]">
          <Globe className="w-10 h-10 text-[hsl(38,92%,50%)]" />
        </div>
      </div>
      
      <h1 className="text-[80px] font-bold text-[hsl(40,20%,92%)] font-['Playfair_Display'] leading-tight text-center">
        Tour & Travel Platform
      </h1>
      <p className="text-[32px] text-[hsl(38,92%,50%)] mt-4 font-medium tracking-wide">
        Complete Business Management Suite
      </p>
      <p className="text-[22px] text-[hsl(220,10%,55%)] mt-6 max-w-[800px] text-center leading-relaxed">
        A full-stack platform to manage packages, vehicles, bookings, invoicing, and customer communication — all in one place.
      </p>
      
      <div className="flex gap-6 mt-16">
        {["15+ Modules", "Real-time Dashboard", "Multi-role Access", "Automated Notifications"].map((t) => (
          <div key={t} className="px-6 py-3 rounded-full border border-[hsl(220,15%,20%)] bg-[hsl(220,18%,10%/0.6)] text-[16px] text-[hsl(40,20%,80%)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[hsl(38,92%,50%)]" /> {t}
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);

export default TitleSlide;
