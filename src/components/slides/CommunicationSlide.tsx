import SlideLayout from "./SlideLayout";
import { MessageSquare, Mail, Bell, Star, PenLine, Share2 } from "lucide-react";

const modules = [
  { icon: Mail, title: "SMTP Email", desc: "Automated emails for booking confirmations, status updates & custom templates", color: "38,92%,50%" },
  { icon: MessageSquare, title: "WhatsApp API", desc: "Business WhatsApp integration for instant booking notifications to customers & admins", color: "150,60%,45%" },
  { icon: Bell, title: "In-App Notifications", desc: "Real-time notification bell for admin dashboard with read/unread tracking", color: "0,70%,55%" },
  { icon: Star, title: "Reviews System", desc: "Polymorphic reviews for packages, vehicles & hotels with moderation workflow", color: "45,90%,50%" },
  { icon: PenLine, title: "Blog & CMS", desc: "Full blog engine with comments, moderation & rich text editing", color: "174,60%,35%" },
  { icon: Share2, title: "Social Links", desc: "Configurable social media links with floating drawer on public pages", color: "210,60%,55%" },
];

const CommunicationSlide = () => (
  <SlideLayout>
    <div className="w-full h-full bg-gradient-to-br from-[hsl(220,20%,4%)] to-[hsl(220,18%,8%)] p-16 flex flex-col">
      <div className="mb-10">
        <p className="text-[16px] uppercase tracking-[4px] text-[hsl(38,92%,50%)] font-semibold mb-2">Modules 07–12</p>
        <h2 className="text-[52px] font-bold text-[hsl(40,20%,92%)] font-['Playfair_Display']">Communication & Content</h2>
      </div>
      
      <div className="grid grid-cols-3 gap-6 flex-1">
        {modules.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="rounded-2xl border border-[hsl(220,15%,18%)] bg-[hsl(220,18%,10%/0.4)] p-8 flex flex-col">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `hsl(${color} / 0.15)` }}>
              <Icon className="w-6 h-6" style={{ color: `hsl(${color})` }} />
            </div>
            <h3 className="text-[22px] font-bold text-[hsl(40,20%,92%)] mb-3">{title}</h3>
            <p className="text-[16px] text-[hsl(220,10%,55%)] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);

export default CommunicationSlide;
