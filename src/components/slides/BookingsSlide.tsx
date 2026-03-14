import SlideLayout from "./SlideLayout";
import { CalendarCheck, Clock, UserCheck, Bell, Filter, FileText } from "lucide-react";

const features = [
  { icon: CalendarCheck, text: "Multi-type bookings: package, vehicle rental, custom trips" },
  { icon: Clock, text: "Travel date, time, pickup & drop location management" },
  { icon: UserCheck, text: "Assign drivers & vehicles directly from booking view" },
  { icon: Filter, text: "Filter by status: pending, confirmed, completed, cancelled" },
  { icon: Bell, text: "Auto-notifications on status changes via email & WhatsApp" },
  { icon: FileText, text: "One-click invoice generation from any booking" },
];

const BookingsSlide = () => (
  <SlideLayout>
    <div className="w-full h-full bg-gradient-to-br from-[hsl(220,20%,4%)] to-[hsl(220,18%,8%)] p-16 flex gap-16">
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(150,60%,40%/0.15)] flex items-center justify-center mb-6 border border-[hsl(150,60%,40%/0.3)]">
          <CalendarCheck className="w-8 h-8 text-[hsl(150,60%,40%)]" />
        </div>
        <p className="text-[16px] uppercase tracking-[4px] text-[hsl(150,60%,40%)] font-semibold mb-2">Module 04</p>
        <h2 className="text-[56px] font-bold text-[hsl(40,20%,92%)] font-['Playfair_Display'] leading-tight">Booking System</h2>
        <p className="text-[20px] text-[hsl(220,10%,55%)] mt-4 leading-relaxed max-w-[600px]">
          End-to-end booking lifecycle management from customer inquiry to trip completion with automated workflows.
        </p>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-5">
        {features.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-5 p-5 rounded-xl border border-[hsl(220,15%,18%)] bg-[hsl(220,18%,10%/0.4)]">
            <div className="w-10 h-10 rounded-lg bg-[hsl(150,60%,40%/0.1)] flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-[hsl(150,60%,40%)]" />
            </div>
            <span className="text-[18px] text-[hsl(40,20%,80%)] leading-snug">{text}</span>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);

export default BookingsSlide;
