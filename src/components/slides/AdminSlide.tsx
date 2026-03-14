import SlideLayout from "./SlideLayout";
import { LayoutDashboard, Shield, Users, Home, Settings, FileText } from "lucide-react";

const features = [
  { icon: Shield, title: "Role-Based Access", desc: "Super Admin, Admin, Moderator & User roles with granular permissions" },
  { icon: LayoutDashboard, title: "Dashboard Overview", desc: "Key metrics: total bookings, revenue, recent activities at a glance" },
  { icon: Home, title: "Homepage Builder", desc: "Dynamic homepage sections with drag-and-drop ordering and CTA management" },
  { icon: FileText, title: "Static Pages", desc: "Create custom pages (Terms, Privacy, About) with rich text editor" },
  { icon: Users, title: "User Management", desc: "Super admin can create, manage & remove admin users securely" },
  { icon: Settings, title: "Site Settings", desc: "Company name, contact info, SMTP config, WhatsApp API — all configurable" },
];

const AdminSlide = () => (
  <SlideLayout>
    <div className="w-full h-full bg-gradient-to-br from-[hsl(220,20%,4%)] to-[hsl(220,18%,8%)] p-16 flex flex-col">
      <div className="mb-10">
        <p className="text-[16px] uppercase tracking-[4px] text-[hsl(38,92%,50%)] font-semibold mb-2">Module 13</p>
        <h2 className="text-[52px] font-bold text-[hsl(40,20%,92%)] font-['Playfair_Display']">Admin Panel & Access Control</h2>
      </div>
      
      <div className="grid grid-cols-3 gap-6 flex-1">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-2xl border border-[hsl(220,15%,18%)] bg-[hsl(220,18%,10%/0.4)] p-8 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[hsl(38,92%,50%/0.1)] flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-[hsl(38,92%,50%)]" />
            </div>
            <h3 className="text-[22px] font-bold text-[hsl(40,20%,92%)] mb-3">{title}</h3>
            <p className="text-[16px] text-[hsl(220,10%,55%)] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);

export default AdminSlide;
