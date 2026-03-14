import SlideLayout from "./SlideLayout";
import { Rocket, ArrowRight } from "lucide-react";

const ClosingSlide = () => (
  <SlideLayout>
    <div className="w-full h-full bg-gradient-to-br from-[hsl(220,20%,4%)] via-[hsl(220,18%,8%)] to-[hsl(174,60%,10%)] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-[hsl(38,92%,50%/0.05)] blur-3xl" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-[hsl(174,60%,35%/0.05)] blur-3xl" />
      
      <div className="w-20 h-20 rounded-2xl bg-[hsl(38,92%,50%/0.15)] flex items-center justify-center mb-8 border border-[hsl(38,92%,50%/0.3)]">
        <Rocket className="w-10 h-10 text-[hsl(38,92%,50%)]" />
      </div>
      
      <h2 className="text-[72px] font-bold text-[hsl(40,20%,92%)] font-['Playfair_Display'] text-center leading-tight">
        Ready to Transform Your<br />Travel Business?
      </h2>
      <p className="text-[24px] text-[hsl(220,10%,55%)] mt-6 max-w-[700px] text-center leading-relaxed">
        One platform. Every module you need. From bookings to billing, from destinations to driver management.
      </p>
      
      <div className="flex gap-6 mt-14">
        <div className="px-10 py-5 rounded-xl bg-[hsl(38,92%,50%)] text-[hsl(220,20%,6%)] text-[20px] font-bold flex items-center gap-3 cursor-pointer">
          Get Started <ArrowRight className="w-5 h-5" />
        </div>
        <div className="px-10 py-5 rounded-xl border-2 border-[hsl(220,15%,25%)] text-[hsl(40,20%,85%)] text-[20px] font-medium cursor-pointer">
          Schedule a Demo
        </div>
      </div>
      
      <p className="absolute bottom-12 text-[16px] text-[hsl(220,10%,35%)]">
        © 2026 Tour & Travel Platform • All Rights Reserved
      </p>
    </div>
  </SlideLayout>
);

export default ClosingSlide;
