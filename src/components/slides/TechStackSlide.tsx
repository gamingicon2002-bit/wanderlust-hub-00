import SlideLayout from "./SlideLayout";
import { Code2, Database, Cloud, Palette, Zap, Lock } from "lucide-react";

const stack = [
  { icon: Code2, title: "React + TypeScript", desc: "Modern frontend with type safety, React Router, and TanStack Query for data fetching", color: "210,90%,55%" },
  { icon: Palette, title: "Tailwind CSS + shadcn/ui", desc: "Utility-first styling with premium component library and dark mode support", color: "280,60%,55%" },
  { icon: Database, title: "Supabase (Cloud)", desc: "PostgreSQL database with real-time subscriptions, RLS policies & edge functions", color: "150,60%,45%" },
  { icon: Lock, title: "Auth & Security", desc: "Email-based authentication, role-based access (RBAC), and row-level security", color: "0,70%,55%" },
  { icon: Cloud, title: "Edge Functions", desc: "Serverless backend for email sending, notifications, and admin management APIs", color: "38,92%,50%" },
  { icon: Zap, title: "Vite + Framer Motion", desc: "Lightning-fast builds, hot reload, and smooth UI animations throughout", color: "174,60%,35%" },
];

const TechStackSlide = () => (
  <SlideLayout>
    <div className="w-full h-full bg-gradient-to-br from-[hsl(220,20%,4%)] to-[hsl(220,18%,8%)] p-16 flex flex-col">
      <div className="mb-10">
        <p className="text-[16px] uppercase tracking-[4px] text-[hsl(174,60%,35%)] font-semibold mb-2">Technology</p>
        <h2 className="text-[52px] font-bold text-[hsl(40,20%,92%)] font-['Playfair_Display']">Built with Modern Tech Stack</h2>
      </div>
      
      <div className="grid grid-cols-3 gap-6 flex-1">
        {stack.map(({ icon: Icon, title, desc, color }) => (
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

export default TechStackSlide;
