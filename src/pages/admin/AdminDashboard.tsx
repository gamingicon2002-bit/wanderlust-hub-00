import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Package, Car, MapPin, Tag, Image, LogOut, LayoutDashboard,
  CalendarCheck, MessageSquare, Settings, ExternalLink, UserCheck,
  Hotel, Star, PenLine, MessageCircle, ListTree, Share2, Users,
  FileText, Home, Receipt, Building2, Bell, Route, ChevronDown,
  Sun, Moon, BedDouble, ClipboardList, Shield, PanelLeftClose, PanelLeftOpen, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/NotificationBell";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useModuleAccess } from "@/hooks/useModuleAccess";

interface SidebarItem {
  to: string;
  label: string;
  icon: any;
  moduleKey: string;
  superOnly?: boolean;
  adminOnly?: boolean;
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/admin/overview", label: "Dashboard", icon: LayoutDashboard, moduleKey: "dashboard" },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/homepage", label: "Homepage", icon: Home, moduleKey: "homepage" },
      { to: "/admin/landing-pages", label: "Landing Pages", icon: Globe, moduleKey: "landing_pages" },
      { to: "/admin/packages", label: "Packages", icon: Package, moduleKey: "packages" },
      { to: "/admin/vehicles", label: "Vehicles", icon: Car, moduleKey: "vehicles" },
      { to: "/admin/vehicle-types", label: "Vehicle Types", icon: ListTree, adminOnly: true, moduleKey: "vehicle_types" },
      { to: "/admin/destinations", label: "Destinations", icon: MapPin, moduleKey: "destinations" },
      { to: "/admin/hotels", label: "Hotels", icon: Hotel, moduleKey: "hotels" },
      { to: "/admin/offers", label: "Offers", icon: Tag, moduleKey: "offers" },
      { to: "/admin/gallery", label: "Gallery", icon: Image, moduleKey: "gallery" },
    ],
  },
  {
    label: "Hotels",
    items: [
      { to: "/admin/hotel-bookings", label: "Hotel Bookings", icon: BedDouble, moduleKey: "hotel_bookings" },
      { to: "/admin/hotel-reviews", label: "Hotel Reviews", icon: Star, moduleKey: "hotel_reviews" },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck, moduleKey: "bookings" },
      { to: "/admin/drivers", label: "Drivers", icon: UserCheck, adminOnly: true, moduleKey: "drivers" },
      { to: "/admin/customers", label: "Customers", icon: Users, moduleKey: "customers" },
      { to: "/admin/invoices", label: "Invoices", icon: Receipt, adminOnly: true, moduleKey: "invoices" },
      { to: "/admin/invoice-brands", label: "Invoice Brands", icon: Building2, adminOnly: true, moduleKey: "invoice_brands" },
      { to: "/admin/itinerary", label: "Itinerary Maker", icon: Route, moduleKey: "itinerary" },
      { to: "/admin/itinerary-history", label: "Itinerary History", icon: ClipboardList, moduleKey: "itinerary_history" },
    ],
  },
  {
    label: "Communication",
    items: [
      { to: "/admin/contacts", label: "Messages", icon: MessageSquare, moduleKey: "contacts" },
      { to: "/admin/notifications", label: "Notifications", icon: Bell, adminOnly: true, moduleKey: "notifications" },
      { to: "/admin/reviews", label: "Reviews", icon: Star, moduleKey: "reviews" },
      { to: "/admin/blogs", label: "Blogs", icon: PenLine, moduleKey: "blogs" },
      { to: "/admin/blog-comments", label: "Blog Comments", icon: MessageCircle, moduleKey: "blog_comments" },
      { to: "/admin/social-links", label: "Social Links", icon: Share2, adminOnly: true, moduleKey: "social_links" },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/users", label: "Admin Users", icon: Users, superOnly: true, moduleKey: "users" },
      { to: "/admin/pages", label: "Pages", icon: FileText, adminOnly: true, moduleKey: "pages" },
      { to: "/admin/role-permissions", label: "Role Permissions", icon: Shield, superOnly: true, moduleKey: "role_permissions" },
      { to: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true, moduleKey: "settings" },
    ],
  },
];

const AdminDashboard = () => {
  const { user, isAdmin, isSuperAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { mode, toggleMode } = useTheme();
  const { isModuleVisible } = useModuleAccess();

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  const filterItems = (items: SidebarItem[]) =>
    items.filter(t => {
      if (t.superOnly && !isSuperAdmin) return false;
      // useModuleAccess already handles business mode + role permissions
      if (!isModuleVisible(t.moduleKey)) return false;
      return true;
    });

  const allTabs = sidebarGroups.flatMap(g => filterItems(g.items));

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-300 h-screen",
        sidebarCollapsed ? "w-[60px]" : "w-60"
      )}>
        <div className="p-3 border-b border-border flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <span className="font-display text-base font-bold block leading-tight">Admin</span>
                <span className="text-[10px] text-muted-foreground">Dashboard</span>
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </Button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {sidebarGroups.map((group) => {
            const visibleItems = filterItems(group.items);
            if (visibleItems.length === 0) return null;
            const isCollapsed = collapsedGroups[group.label];

            return (
              <div key={group.label} className="mb-1">
                {!sidebarCollapsed && (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {group.label}
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isCollapsed && "-rotate-90")} />
                  </button>
                )}
                {(!isCollapsed || sidebarCollapsed) && (
                  <div className="space-y-0.5 mt-0.5">
                    {visibleItems.map((tab) => {
                      const active = location.pathname === tab.to;
                      return (
                        <Link key={tab.to} to={tab.to} title={sidebarCollapsed ? tab.label : undefined}>
                          <div className={cn(
                            "flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-all",
                            sidebarCollapsed ? "px-0 py-2 justify-center" : "px-3 py-2",
                            active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}>
                            <tab.icon className="w-4 h-4 shrink-0" />
                            {!sidebarCollapsed && tab.label}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-2 border-t border-border">
          <Link to="/">
            <Button variant="ghost" size="sm" className={cn("w-full gap-2 text-xs", sidebarCollapsed ? "justify-center px-0" : "justify-start")}>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {!sidebarCollapsed && "View Site"}
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex items-center justify-between h-14 px-6 border-b border-border bg-card/30 backdrop-blur-sm shrink-0 z-50">
          <div className="text-sm text-muted-foreground">
            {location.pathname.split("/").filter(Boolean).slice(1).map((seg, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1.5 text-border">/</span>}
                <span className="capitalize">{seg.replace(/-/g, " ")}</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMode} className="h-9 w-9">
              {mode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <NotificationBell />
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-destructive hover:text-destructive" onClick={signOut}>
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="bg-card/50 backdrop-blur-sm border-b border-border shrink-0 z-50 lg:hidden">
          <div className="flex items-center justify-between h-12 px-4">
            <div className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4 text-primary" /><span className="font-display text-base font-bold">Admin</span></div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" onClick={toggleMode} className="h-8 w-8">
                {mode === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </Button>
              <NotificationBell />
              <Link to="/"><Button variant="ghost" size="sm" className="text-xs">Site</Button></Link>
              <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-1 px-3 pb-2">
            {allTabs.map((tab) => (
              <Link key={tab.to} to={tab.to}>
                <Button variant={location.pathname === tab.to ? "default" : "ghost"} size="sm" className="gap-1 whitespace-nowrap text-[11px] h-7 px-2">
                  <tab.icon className="w-3 h-3" /> {tab.label}
                </Button>
              </Link>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl w-full mx-auto"><Outlet /></div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
