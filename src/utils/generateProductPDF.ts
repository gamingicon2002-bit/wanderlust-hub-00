import jsPDF from "jspdf";

interface Module {
  number: string;
  title: string;
  subtitle: string;
  color: [number, number, number];
  features: string[];
}

const modules: Module[] = [
  {
    number: "01",
    title: "Tour Packages",
    subtitle: "Create and manage comprehensive tour packages with rich details, pricing tiers, and downloadable brochures.",
    color: [218, 165, 32],
    features: [
      "Group & Private tour types with customizable itineraries",
      "Dynamic pricing with original price & discount display",
      "Destination-based categorization & featured packages",
      "Brochure upload & download for each package",
      "Duration, inclusions, exclusions & special features",
      "Multi-image gallery with primary image selection",
    ],
  },
  {
    number: "02",
    title: "Vehicle Fleet",
    subtitle: "Manage your entire fleet with categorized vehicle types, pricing models, and driver assignments.",
    color: [0, 150, 136],
    features: [
      "Hierarchical vehicle types & sub-types (Car, Bus, Tempo, etc.)",
      "Fuel type, transmission & detailed specifications",
      "Seating capacity & rental option management",
      "Per-km and per-day pricing models",
      "Feature list, multi-image gallery & brochure support",
      "Driver assignment linking vehicles to available drivers",
    ],
  },
  {
    number: "03",
    title: "Destinations",
    subtitle: "Showcase travel destinations with stunning galleries, highlights, and linked packages.",
    color: [156, 39, 176],
    features: [
      "Rich destination pages with description & highlights",
      "Best time to visit information",
      "Multi-image gallery for each destination",
      "Auto-linked packages by destination name",
      "Brochure upload & download support",
      "Short descriptions for card previews",
    ],
  },
  {
    number: "04",
    title: "Booking System",
    subtitle: "End-to-end booking lifecycle from customer inquiry to trip completion with automated workflows.",
    color: [56, 142, 60],
    features: [
      "Multi-type bookings: package, vehicle rental, custom trips",
      "Travel date, time, pickup & drop location management",
      "Assign drivers & vehicles directly from booking view",
      "Filter by status: pending, confirmed, completed, cancelled",
      "Auto-notifications on status changes via email & WhatsApp",
      "One-click invoice generation from any booking",
    ],
  },
  {
    number: "05",
    title: "Driver Management",
    subtitle: "Complete driver lifecycle — from onboarding and vehicle assignment to their own login portal.",
    color: [3, 169, 244],
    features: [
      "License number, experience tracking & verification",
      "Assign primary & secondary vehicles to each driver",
      "Contact details: phone, email for quick communication",
      "Dedicated driver login portal for trip management",
      "Driver dashboard to view assigned bookings & trips",
    ],
  },
  {
    number: "06",
    title: "Invoicing & Billing",
    subtitle: "GST-compliant invoicing with multi-brand support, itemized billing, and professional PDF output.",
    color: [233, 30, 99],
    features: [
      "Multiple invoice brands with logo, GST & bank details",
      "CGST, SGST, IGST tax calculations built-in",
      "Line items with quantity, unit price & amount",
      "Payment tracking: pending, paid, overdue statuses",
      "Professional PDF generation & download",
    ],
  },
  {
    number: "07",
    title: "SMTP Email Integration",
    subtitle: "Automated emails for booking confirmations, status updates & custom templates.",
    color: [218, 165, 32],
    features: [
      "Configurable SMTP settings (host, port, credentials)",
      "Custom email templates with variable placeholders",
      "Auto-send on booking creation & status changes",
      "Admin notification emails for new bookings",
      "Support for Gmail, Zoho, SendGrid & more",
    ],
  },
  {
    number: "08",
    title: "WhatsApp Business API",
    subtitle: "Instant booking notifications to customers & admins via WhatsApp.",
    color: [56, 142, 60],
    features: [
      "WhatsApp Business API integration",
      "Customizable message templates for bookings",
      "Auto-send booking confirmations to customers",
      "Admin alerts for new bookings via WhatsApp",
      "Support for Meta Cloud API & third-party providers",
    ],
  },
  {
    number: "09",
    title: "In-App Notifications",
    subtitle: "Real-time notification bell for admin dashboard with read/unread tracking.",
    color: [244, 67, 54],
    features: [
      "Real-time notification bell in admin header",
      "Read/unread status tracking per notification",
      "Clickable notifications linking to relevant pages",
      "Auto-generated on booking & contact events",
      "Mark all as read functionality",
    ],
  },
  {
    number: "10",
    title: "Reviews & Ratings",
    subtitle: "Polymorphic reviews for packages, vehicles & hotels with moderation workflow.",
    color: [255, 193, 7],
    features: [
      "Star rating system (1-5) with text reviews",
      "Polymorphic: reviews for packages, vehicles & hotels",
      "Admin moderation: approve, reject, pending workflow",
      "Public display of approved reviews on detail pages",
      "Reviewer name & email collection",
    ],
  },
  {
    number: "11",
    title: "Blog & CMS",
    subtitle: "Full blog engine with comments, moderation & rich text editing.",
    color: [0, 150, 136],
    features: [
      "Rich text editor for blog content creation",
      "Blog categories with featured images",
      "Comment system with moderation workflow",
      "Draft/Published status management",
      "SEO-friendly blog detail pages",
    ],
  },
  {
    number: "12",
    title: "Hotels Management",
    subtitle: "Manage hotel listings with amenities, pricing, and destination linking.",
    color: [63, 81, 181],
    features: [
      "Hotel listings with amenities, rating & pricing",
      "Contact details: phone, email for reservations",
      "Multi-image gallery per hotel",
      "Destination-based categorization",
      "Link hotels to related packages",
      "Active/inactive status management",
    ],
  },
  {
    number: "13",
    title: "Admin Panel & RBAC",
    subtitle: "Complete admin dashboard with role-based access control and user management.",
    color: [121, 85, 72],
    features: [
      "Role-based access: Super Admin, Admin, Moderator, User",
      "Dashboard overview with key metrics & charts",
      "User management with role assignment",
      "Homepage section editor with drag & sort",
      "Static pages CMS with rich text editor",
      "Social links management with floating drawer",
      "Site settings: company info, branding & config",
    ],
  },
  {
    number: "14",
    title: "Special Offers",
    subtitle: "Promotional offers with discount management and validity periods.",
    color: [255, 87, 34],
    features: [
      "Create time-limited promotional offers",
      "Discount percentage & custom discount text",
      "Validity period (from/until) management",
      "Featured image for each offer",
      "Active/inactive toggle for quick control",
    ],
  },
  {
    number: "15",
    title: "Gallery & Media",
    subtitle: "Centralized media gallery with categorization and sorting.",
    color: [0, 188, 212],
    features: [
      "Centralized image gallery management",
      "Category-based organization",
      "Sort order control for display sequence",
      "Title & description per image",
      "Used across public gallery page",
    ],
  },
];

function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number) {
  doc.roundedRect(x, y, w, h, r, r, "F");
}

export function generateProductPDF() {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 18;
  const contentW = pageW - margin * 2;

  // ═══════════════════════ COVER PAGE ═══════════════════════
  doc.setFillColor(15, 18, 25);
  doc.rect(0, 0, pageW, pageH, "F");

  // Accent bar
  doc.setFillColor(218, 165, 32);
  doc.rect(0, 0, 5, pageH, "F");

  // Title
  doc.setTextColor(240, 235, 220);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("Travel CRM", margin + 8, 80);

  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(218, 165, 32);
  doc.text("Product Feature Documentation", margin + 8, 95);

  doc.setFontSize(11);
  doc.setTextColor(140, 140, 150);
  doc.text("Complete Module-by-Module Breakdown", margin + 8, 110);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, margin + 8, 118);

  // Stats boxes
  const statsY = 145;
  const stats = [
    { label: "Modules", value: "15+" },
    { label: "Database Tables", value: "25+" },
    { label: "API Endpoints", value: "50+" },
    { label: "Edge Functions", value: "3" },
  ];
  const boxW = (contentW - 10) / 4;
  stats.forEach((s, i) => {
    const bx = margin + 8 + i * (boxW + 3);
    doc.setFillColor(25, 30, 42);
    drawRoundedRect(doc, bx, statsY, boxW - 2, 28, 3);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(218, 165, 32);
    doc.text(s.value, bx + (boxW - 2) / 2, statsY + 13, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(140, 140, 150);
    doc.text(s.label, bx + (boxW - 2) / 2, statsY + 21, { align: "center" });
  });

  // Tech stack footer
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 110);
  doc.text("Built with React • TypeScript • Tailwind CSS • Supabase • Edge Functions • Framer Motion", margin + 8, 260);

  // ═══════════════════════ TABLE OF CONTENTS ═══════════════════════
  doc.addPage();
  doc.setFillColor(15, 18, 25);
  doc.rect(0, 0, pageW, pageH, "F");
  doc.setFillColor(218, 165, 32);
  doc.rect(0, 0, 5, pageH, "F");

  doc.setTextColor(240, 235, 220);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Table of Contents", margin + 8, 30);

  doc.setFontSize(10);
  modules.forEach((m, i) => {
    const ty = 48 + i * 14;
    doc.setFillColor(25, 30, 42);
    drawRoundedRect(doc, margin + 8, ty - 5, contentW - 10, 11, 2);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(`${m.number}`, margin + 12, ty + 2);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 215, 200);
    doc.text(m.title, margin + 26, ty + 2);

    doc.setTextColor(100, 100, 110);
    doc.text(`${m.features.length} features`, margin + contentW - 18, ty + 2, { align: "right" });
  });

  // ═══════════════════════ MODULE PAGES ═══════════════════════
  modules.forEach((mod) => {
    doc.addPage();
    doc.setFillColor(15, 18, 25);
    doc.rect(0, 0, pageW, pageH, "F");

    // Left accent bar
    doc.setFillColor(mod.color[0], mod.color[1], mod.color[2]);
    doc.rect(0, 0, 5, pageH, "F");

    // Module number badge
    doc.setFillColor(mod.color[0], mod.color[1], mod.color[2]);
    drawRoundedRect(doc, margin + 8, 20, 30, 12, 3);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(`MODULE ${mod.number}`, margin + 23, 28, { align: "center" });

    // Title
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(240, 235, 220);
    doc.text(mod.title, margin + 8, 52);

    // Subtitle
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(140, 140, 150);
    const subtitleLines = doc.splitTextToSize(mod.subtitle, contentW - 20);
    doc.text(subtitleLines, margin + 8, 64);

    // Divider
    const divY = 64 + subtitleLines.length * 6 + 8;
    doc.setDrawColor(mod.color[0], mod.color[1], mod.color[2]);
    doc.setLineWidth(0.5);
    doc.line(margin + 8, divY, margin + 60, divY);

    // Features heading
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(mod.color[0], mod.color[1], mod.color[2]);
    doc.text("KEY FEATURES", margin + 8, divY + 14);

    // Feature items
    mod.features.forEach((feat, fi) => {
      const fy = divY + 26 + fi * 20;

      // Feature card bg
      doc.setFillColor(25, 30, 42);
      drawRoundedRect(doc, margin + 8, fy - 5, contentW - 10, 16, 3);

      // Numbered circle
      doc.setFillColor(mod.color[0], mod.color[1], mod.color[2]);
      doc.circle(margin + 16, fy + 3, 4, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`${fi + 1}`, margin + 16, fy + 4.5, { align: "center" });

      // Feature text
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(220, 215, 200);
      doc.text(feat, margin + 25, fy + 4);
    });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 90);
    doc.text("Travel CRM — Product Documentation", margin + 8, pageH - 12);
    doc.text(`Module ${mod.number}: ${mod.title}`, pageW - margin - 8, pageH - 12, { align: "right" });
  });

  // ═══════════════════════ TECH STACK PAGE ═══════════════════════
  doc.addPage();
  doc.setFillColor(15, 18, 25);
  doc.rect(0, 0, pageW, pageH, "F");
  doc.setFillColor(0, 150, 136);
  doc.rect(0, 0, 5, pageH, "F");

  doc.setTextColor(240, 235, 220);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Technology Stack", margin + 8, 30);

  const techStack = [
    { title: "Frontend", items: ["React 18 with TypeScript", "Tailwind CSS + shadcn/ui components", "Framer Motion animations", "React Router v6 navigation", "TanStack Query for data fetching"], color: [66, 133, 244] },
    { title: "Backend", items: ["Supabase PostgreSQL database", "Row-Level Security (RLS) policies", "Edge Functions (Deno runtime)", "Real-time subscriptions", "File storage for images & brochures"], color: [56, 142, 60] },
    { title: "Authentication", items: ["Email-based authentication", "Role-based access control (RBAC)", "Super Admin, Admin, Moderator, User roles", "Protected routes & middleware", "Driver portal authentication"], color: [233, 30, 99] },
    { title: "Integrations", items: ["SMTP email (Gmail, Zoho, SendGrid)", "WhatsApp Business API", "PDF invoice generation", "Image upload & management", "Brochure file management"], color: [218, 165, 32] },
  ];

  let techY = 44;
  techStack.forEach((section) => {
    doc.setFillColor(section.color[0], section.color[1], section.color[2]);
    drawRoundedRect(doc, margin + 8, techY, contentW - 10, 8, 2);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(section.title, margin + 12, techY + 6);
    techY += 12;

    section.items.forEach((item) => {
      doc.setFillColor(25, 30, 42);
      drawRoundedRect(doc, margin + 8, techY, contentW - 10, 9, 2);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 200, 210);
      doc.text(`•  ${item}`, margin + 14, techY + 6);
      techY += 11;
    });
    techY += 6;
  });

  // ═══════════════════════ CLOSING PAGE ═══════════════════════
  doc.addPage();
  doc.setFillColor(15, 18, 25);
  doc.rect(0, 0, pageW, pageH, "F");
  doc.setFillColor(218, 165, 32);
  doc.rect(0, 0, 5, pageH, "F");

  doc.setTextColor(218, 165, 32);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("Thank You", margin + 8, 100);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(240, 235, 220);
  doc.text("Travel CRM — Complete Travel Business Solution", margin + 8, 120);

  doc.setFontSize(10);
  doc.setTextColor(140, 140, 150);
  doc.text("15+ Modules • 25+ Database Tables • 50+ API Endpoints", margin + 8, 135);
  doc.text("Built with modern tech stack for scalability & performance", margin + 8, 145);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 110);
  doc.text(`Document generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, margin + 8, 170);

  // Save
  doc.save("Travel_CRM_Product_Features.pdf");
}
