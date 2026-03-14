import SlideLayout from "./SlideLayout";
import { UserCheck, Shield, Car, Phone, Eye, LogIn } from "lucide-react";

const features = [
  { icon: Shield, text: "License number, experience tracking & verification" },
  { icon: Car, text: "Assign primary & secondary vehicles to each driver" },
  { icon: Phone, text: "Contact details: phone, email for quick communication" },
  { icon: LogIn, text: "Dedicated driver login portal for trip management" },
  { icon: Eye, text: "Driver dashboard to view assigned bookings & trips" },
];

const DriversSlide = () => (
  <SlideLayout>
    <div className="w-full h-full bg-gradient-to-br from-[hsl(220,20%,4%)] to-[hsl(220,18%,8%)] p-16 flex gap-16">
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(200,70%,50%/0.15)] flex items-center justify-center mb-6 border border-[hsl(200,70%,50%/0.3)]">
          <UserCheck className="w-8 h-8 text-[hsl(200,70%,50%)]" />
        </div>
        <p className="text-[16px] uppercase tracking-[4px] text-[hsl(200,70%,50%)] font-semibold mb-2">Module 05</p>
        <h2 className="text-[56px] font-bold text-[hsl(40,20%,92%)] font-['Playfair_Display'] leading-tight">Driver Management</h2>
        <p className="text-[20px] text-[hsl(220,10%,55%)] mt-4 leading-relaxed max-w-[600px]">
          Complete driver lifecycle — from onboarding and vehicle assignment to their own login portal for trip visibility.
        </p>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-5">
        {features.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-5 p-5 rounded-xl border border-[hsl(220,15%,18%)] bg-[hsl(220,18%,10%/0.4)]">
            <div className="w-10 h-10 rounded-lg bg-[hsl(200,70%,50%/0.1)] flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-[hsl(200,70%,50%)]" />
            </div>
            <span className="text-[18px] text-[hsl(40,20%,80%)] leading-snug">{text}</span>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);

export default DriversSlide;
