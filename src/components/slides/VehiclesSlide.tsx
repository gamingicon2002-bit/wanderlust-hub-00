import SlideLayout from "./SlideLayout";
import { Car, Fuel, Users, Gauge, ListTree, IndianRupee, Settings2 } from "lucide-react";

const features = [
  { icon: ListTree, text: "Hierarchical vehicle types & sub-types (Car, Bus, Tempo, etc.)" },
  { icon: Fuel, text: "Fuel type, transmission & detailed specifications" },
  { icon: Users, text: "Seating capacity & rental option management" },
  { icon: IndianRupee, text: "Per-km and per-day pricing models" },
  { icon: Settings2, text: "Feature list, multi-image gallery & brochure support" },
  { icon: Gauge, text: "Driver assignment linking vehicles to available drivers" },
];

const VehiclesSlide = () => (
  <SlideLayout>
    <div className="w-full h-full bg-gradient-to-br from-[hsl(220,20%,4%)] to-[hsl(220,18%,8%)] p-16 flex gap-16">
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(174,60%,35%/0.15)] flex items-center justify-center mb-6 border border-[hsl(174,60%,35%/0.3)]">
          <Car className="w-8 h-8 text-[hsl(174,60%,35%)]" />
        </div>
        <p className="text-[16px] uppercase tracking-[4px] text-[hsl(174,60%,35%)] font-semibold mb-2">Module 02</p>
        <h2 className="text-[56px] font-bold text-[hsl(40,20%,92%)] font-['Playfair_Display'] leading-tight">Vehicle Fleet</h2>
        <p className="text-[20px] text-[hsl(220,10%,55%)] mt-4 leading-relaxed max-w-[600px]">
          Manage your entire fleet with categorized vehicle types, pricing models, and driver assignments.
        </p>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-5">
        {features.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-5 p-5 rounded-xl border border-[hsl(220,15%,18%)] bg-[hsl(220,18%,10%/0.4)]">
            <div className="w-10 h-10 rounded-lg bg-[hsl(174,60%,35%/0.1)] flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-[hsl(174,60%,35%)]" />
            </div>
            <span className="text-[18px] text-[hsl(40,20%,80%)] leading-snug">{text}</span>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);

export default VehiclesSlide;
