import SlideLayout from "./SlideLayout";
import { Package, Car, MapPin, Hotel, CalendarCheck, Receipt, Star, PenLine, Bell, Share2, Settings, Image, Tag, UserCheck, FileText, Route } from "lucide-react";

const modules = [
  { icon: Package, label: "Tour Packages", color: "38,92%,50%" },
  { icon: Car, label: "Vehicle Fleet", color: "174,60%,35%" },
  { icon: MapPin, label: "Destinations", color: "28,80%,52%" },
  { icon: Hotel, label: "Hotels", color: "260,60%,55%" },
  { icon: CalendarCheck, label: "Bookings", color: "150,60%,40%" },
  { icon: UserCheck, label: "Drivers", color: "200,70%,50%" },
  { icon: Receipt, label: "Invoicing", color: "340,70%,55%" },
  { icon: Tag, label: "Offers", color: "15,80%,55%" },
  { icon: Image, label: "Gallery", color: "280,50%,55%" },
  { icon: Star, label: "Reviews", color: "45,90%,50%" },
  { icon: PenLine, label: "Blogs & CMS", color: "170,50%,45%" },
  { icon: Bell, label: "Notifications", color: "0,70%,55%" },
  { icon: Share2, label: "Social Links", color: "210,60%,55%" },
  { icon: Route, label: "Itinerary", color: "120,50%,40%" },
  { icon: FileText, label: "Static Pages", color: "220,40%,55%" },
  { icon: Settings, label: "Settings", color: "220,10%,50%" },
];

const OverviewSlide = () => (
  <SlideLayout>
    <div className="w-full h-full bg-gradient-to-br from-[hsl(220,20%,4%)] to-[hsl(220,18%,8%)] p-16 flex flex-col">
      <div className="mb-10">
        <p className="text-[16px] uppercase tracking-[4px] text-[hsl(38,92%,50%)] font-semibold mb-2">Platform Overview</p>
        <h2 className="text-[52px] font-bold text-[hsl(40,20%,92%)] font-['Playfair_Display']">All Modules at a Glance</h2>
      </div>
      
      <div className="grid grid-cols-4 gap-5 flex-1">
        {modules.map(({ icon: Icon, label, color }) => (
          <div key={label} className="rounded-2xl border border-[hsl(220,15%,18%)] bg-[hsl(220,18%,10%/0.6)] p-6 flex flex-col items-center justify-center gap-4 hover:border-[hsl(38,92%,50%/0.3)] transition-colors">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `hsl(${color} / 0.15)` }}>
              <Icon className="w-7 h-7" style={{ color: `hsl(${color})` }} />
            </div>
            <span className="text-[18px] font-medium text-[hsl(40,20%,85%)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);

export default OverviewSlide;
