import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { FileText, Plus, X, Download, MapPin, Car, User, Calendar, Phone, Save, Image as ImageIcon, IndianRupee } from "lucide-react";
import SearchableBookingPicker from "@/components/SearchableBookingPicker";
import { format } from "date-fns";

const db = (table: string) => (supabase as any).from(table);

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  hotel: string;
  meals: string;
  activities: string;
  image: string;
}

const emptyDay: ItineraryDay = { day: 1, title: "", description: "", hotel: "", meals: "", activities: "", image: "" };

const AdminItinerary = () => {
  const qc = useQueryClient();
  const [bookingId, setBookingId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [packageName, setPackageName] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [duration, setDuration] = useState("");
  const [numTravelers, setNumTravelers] = useState(1);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [days, setDays] = useState<ItineraryDay[]>([{ ...emptyDay }]);
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [priceIncludesDriver, setPriceIncludesDriver] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState("");

  const { data: bookings = [] } = useQuery({
    queryKey: ["itin-bookings"],
    queryFn: async () => { const { data } = await db("bookings").select("*").order("created_at", { ascending: false }); return data || []; },
  });

  const { data: packages = [] } = useQuery({
    queryKey: ["itin-packages"],
    queryFn: async () => { const { data } = await db("packages").select("*"); return data || []; },
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ["itin-hotels"],
    queryFn: async () => { const { data } = await db("hotels").select("id, name, location, destination"); return data || []; },
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ["itin-destinations"],
    queryFn: async () => { const { data } = await db("destinations").select("id, name"); return data || []; },
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["itin-vehicles"],
    queryFn: async () => { const { data } = await db("vehicles").select("id, name, type, capacity"); return data || []; },
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["itin-drivers"],
    queryFn: async () => { const { data } = await db("drivers").select("id, name, phone, license_number").eq("is_active", true); return data || []; },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["itin-brands"],
    queryFn: async () => { const { data } = await db("invoice_brands").select("*"); return data || []; },
  });

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => { const { data } = await db("site_settings").select("*").limit(1).single(); return data; },
  });

  const defaultBrand = brands.find((b: any) => b.is_default) || brands[0];

  const fillFromBooking = (id: string) => {
    const b = bookings.find((bk: any) => bk.id === id);
    if (!b) return;
    setBookingId(id);
    setCustomerName(b.customer_name || "");
    setCustomerPhone(b.customer_phone || "");
    setCustomerEmail(b.customer_email || "");
    setPackageName(b.reference_name || "");
    setTravelDate(b.travel_date || "");
    setPickupLocation(b.pickup_location || "");
    setDropLocation(b.drop_location || "");
    setVehicleType(b.vehicle_type || "");
    setNumTravelers(b.num_travelers || 1);

    if (b.reference_id) {
      const pkg = packages.find((p: any) => p.id === b.reference_id);
      if (pkg) {
        setDestination(pkg.destination || "");
        setDuration(pkg.duration || "");
        setInclusions((pkg.inclusions || []).join("\n"));
        setExclusions((pkg.exclusions || []).join("\n"));
        if (pkg.itinerary && pkg.itinerary.length > 0) {
          setDays(pkg.itinerary.map((it: string, idx: number) => ({
            day: idx + 1, title: `Day ${idx + 1}`, description: it, hotel: "", meals: "Breakfast, Dinner", activities: "", image: "",
          })));
        }
      }
    }

    if (b.driver_id) {
      const d = drivers.find((dr: any) => dr.id === b.driver_id);
      if (d) { setDriverName(d.name || ""); setDriverPhone(d.phone || ""); }
    }

    toast({ title: "Booking details loaded" });
  };

  const addDay = () => setDays([...days, { ...emptyDay, day: days.length + 1 }]);
  const removeDay = (idx: number) => setDays(days.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 })));
  const updateDay = (idx: number, field: keyof ItineraryDay, value: string) => {
    const updated = [...days];
    (updated[idx] as any)[field] = value;
    setDays(updated);
  };

  // Save to database
  const saveItinerary = useMutation({
    mutationFn: async () => {
      const payload = {
        booking_id: bookingId || null,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        package_name: packageName,
        destination,
        travel_date: travelDate || null,
        duration,
        num_travelers: numTravelers,
        pickup_location: pickupLocation,
        drop_location: dropLocation,
        vehicle_name: vehicleName,
        vehicle_type: vehicleType,
        driver_name: driverName,
        driver_phone: driverPhone,
        days: days as any,
        inclusions,
        exclusions,
        special_notes: specialNotes,
        emergency_contact: emergencyContact,
        total_price: totalPrice,
        price_includes_driver: priceIncludesDriver,
        background_image: backgroundImage,
      };
      const { error } = await db("itineraries").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-itineraries"] });
      toast({ title: "Itinerary saved to history" });
    },
    onError: (e: any) => toast({ title: "Error saving", description: e.message, variant: "destructive" }),
  });

  const generateItineraryPDF = () => {
    const brand = defaultBrand || {};
    const company = settings || {};
    const brandColor = settings?.doc_primary_color || "#1e3a5f";
    const accentColor = settings?.doc_accent_color || "#d4a843";
    const secondaryColor = settings?.doc_secondary_color || "#3a6b8c";
    const font = settings?.doc_font_family || "Plus Jakarta Sans";
    const companyName = brand.name || company.company_name || "Travel Company";
    const companyPhone = brand.phone || company.phone || "";
    const companyEmail = brand.email || company.contact_email || "";
    const companyAddress = (brand.address || company.office_address || "").replace(/\n/g, ", ");
    const logoUrl = brand.logo_url || "";

    let endDateStr = "";
    if (travelDate && duration) {
      const nights = parseInt(duration) || 0;
      if (nights > 0) {
        const end = new Date(travelDate);
        end.setDate(end.getDate() + nights);
        endDateStr = format(end, "dd MMM yyyy");
      }
    }

    const pageStyle = `min-height:100vh;display:flex;flex-direction:column;position:relative;background:#fff;`;
    const headerBar = `
      <div style="background:linear-gradient(135deg,${brandColor},${secondaryColor});padding:16px 40px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid ${accentColor}">
        <div style="display:flex;align-items:center;gap:14px">
          ${logoUrl ? `<img src="${logoUrl}" style="height:40px;object-fit:contain" />` : `<div style="width:40px;height:40px;border-radius:10px;background:${accentColor};display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:16px">${companyName.charAt(0)}</div>`}
          <div style="color:#fff;font-size:18px;font-weight:700;letter-spacing:0.5px">${companyName}</div>
        </div>
        <div style="color:rgba(255,255,255,0.6);font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:600">Travel Itinerary</div>
      </div>`;

    const footerBar = `
      <div style="background:linear-gradient(135deg,${brandColor},${secondaryColor});padding:14px 40px;display:flex;align-items:center;justify-content:center;gap:32px;border-top:3px solid ${accentColor};margin-top:auto">
        ${companyPhone ? `<span style="color:rgba(255,255,255,0.85);font-size:11px;letter-spacing:0.5px">☎ ${companyPhone}</span>` : ""}
        ${companyEmail ? `<span style="color:rgba(255,255,255,0.85);font-size:11px;letter-spacing:0.5px">✉ ${companyEmail}</span>` : ""}
        ${companyAddress ? `<span style="color:rgba(255,255,255,0.85);font-size:11px;letter-spacing:0.5px">⌂ ${companyAddress}</span>` : ""}
      </div>`;

    const sectionTitle = (title: string, icon: string = "") => `
      <div style="display:flex;align-items:center;gap:12px;margin:32px 0 20px">
        <div style="width:4px;height:28px;background:${accentColor};border-radius:2px"></div>
        <h2 style="font-size:22px;font-weight:800;color:${brandColor};letter-spacing:0.5px;margin:0">${icon} ${title}</h2>
      </div>`;

    const infoCell = (label: string, value: string) => `
      <td style="padding:14px 16px;vertical-align:top">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin-bottom:4px">${label}</div>
        <div style="font-size:14px;font-weight:600;color:#1e293b">${value || "—"}</div>
      </td>`;

    // ═══════════ PAGE 1: COVER ═══════════
    const coverPage = `
      <div style="${pageStyle}">
        ${headerBar}
        <div style="flex:1;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center">
          ${backgroundImage ? `<img src="${backgroundImage}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />` : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,${brandColor}08 0%,${secondaryColor}12 50%,${accentColor}08 100%)"></div>`}
          <div style="position:absolute;inset:0;background:${backgroundImage ? 'linear-gradient(135deg,rgba(0,0,0,0.5),rgba(0,0,0,0.35))' : 'transparent'}"></div>

          <div style="position:relative;z-index:1;text-align:center;padding:48px 40px;max-width:700px">
            <div style="display:inline-block;background:${accentColor};color:#fff;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:8px 24px;border-radius:30px;margin-bottom:28px">✦ Curated Travel Experience</div>
            <h1 style="font-size:44px;font-weight:900;color:${backgroundImage ? '#fff' : brandColor};letter-spacing:1px;margin:0 0 12px;line-height:1.2;text-transform:uppercase">${destination || "Your Dream Destination"}</h1>
            ${packageName ? `<p style="font-size:17px;color:${backgroundImage ? 'rgba(255,255,255,0.9)' : '#64748b'};font-weight:500;margin:8px 0 0;font-style:italic">${packageName}</p>` : ""}
            ${duration ? `<p style="font-size:13px;color:${backgroundImage ? 'rgba(255,255,255,0.7)' : '#94a3b8'};margin:10px 0 0;letter-spacing:1px">${duration} ${numTravelers > 1 ? `• ${numTravelers} Travelers` : ""}</p>` : ""}
          </div>

          ${days.filter(d => d.image).length > 0 ? `
          <div style="position:relative;z-index:1;display:flex;gap:16px;justify-content:center;margin:12px 0 28px;flex-wrap:wrap">
            ${days.filter(d => d.image).slice(0, 3).map(d => `
              <div style="width:170px;height:120px;border-radius:14px;overflow:hidden;border:3px solid rgba(255,255,255,0.85);box-shadow:0 8px 30px rgba(0,0,0,0.2)">
                <img src="${d.image}" style="width:100%;height:100%;object-fit:cover" />
              </div>
            `).join("")}
          </div>` : ""}

          <div style="position:relative;z-index:1;background:rgba(255,255,255,0.97);border-radius:16px;padding:28px 36px;margin:24px 40px;max-width:600px;width:90%;box-shadow:0 16px 48px rgba(0,0,0,0.12)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;gap:16px">
              <div>
                <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${accentColor};margin-bottom:4px">Guest</div>
                <div style="font-size:18px;font-weight:800;color:${brandColor}">${customerName}</div>
                <div style="font-size:12px;color:#64748b;margin-top:2px">${numTravelers} Traveler${numTravelers > 1 ? "s" : ""}</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${accentColor};margin-bottom:4px">Prepared By</div>
                <div style="font-size:14px;font-weight:700;color:${brandColor}">${companyName}</div>
              </div>
            </div>
            <div style="border-top:2px solid ${accentColor}20;padding-top:14px;display:flex;gap:28px;flex-wrap:wrap">
              ${travelDate ? `<div><span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;display:block;margin-bottom:2px">Starts</span><strong style="font-size:14px;color:${brandColor}">${format(new Date(travelDate), "dd MMM yyyy")}</strong></div>` : ""}
              ${endDateStr ? `<div><span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;display:block;margin-bottom:2px">Ends</span><strong style="font-size:14px;color:${brandColor}">${endDateStr}</strong></div>` : ""}
              ${duration ? `<div><span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;display:block;margin-bottom:2px">Duration</span><strong style="font-size:14px;color:${brandColor}">${duration}</strong></div>` : ""}
            </div>
          </div>
        </div>
        ${footerBar}
      </div>`;

    // ═══════════ PAGE 2: TRIP OVERVIEW & QUOTE ═══════════
    const overviewPage = `
      <div style="${pageStyle}page-break-before:always">
        ${headerBar}
        <div style="flex:1;padding:40px">
          <div style="background:linear-gradient(135deg,${brandColor}08,${accentColor}08);border:1px solid ${brandColor}15;border-radius:16px;padding:28px 32px;margin-bottom:32px">
            <p style="font-size:15px;color:#334155;margin:0 0 8px"><strong style="color:${brandColor}">Dear ${customerName},</strong></p>
            <p style="font-size:13px;color:#64748b;margin:0;line-height:1.8">Thank you for choosing <strong>${companyName}</strong>. We are delighted to present this customized travel itinerary for your upcoming journey. Please review the details below and feel free to reach out for any modifications.</p>
          </div>

          ${sectionTitle("Trip Summary", "✈")}
          <table style="width:100%;border-collapse:collapse;background:#fafbfc;border-radius:12px;overflow:hidden;border:1px solid #e8ecf0">
            <tr style="border-bottom:1px solid #e2e8f0">
              ${infoCell("Destination", destination)}
              ${infoCell("Start Date", travelDate ? format(new Date(travelDate), "dd MMMM, yyyy") : "—")}
              ${infoCell("Duration", duration)}
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0">
              ${infoCell("Travelers", `${numTravelers} Person${numTravelers > 1 ? "s" : ""}`)}
              ${infoCell("Package", packageName)}
              ${infoCell("Pickup", pickupLocation)}
            </tr>
            <tr>
              ${infoCell("Drop", dropLocation)}
              ${infoCell("Vehicle", `${vehicleName || "—"} ${vehicleType ? `(${vehicleType})` : ""}`)}
              ${infoCell("Driver", driverName || "—")}
            </tr>
          </table>

          ${totalPrice > 0 ? `
          ${sectionTitle("Package Cost", "💰")}
          <table style="width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
            <thead><tr style="background:linear-gradient(135deg,${brandColor},${secondaryColor})">
              <th style="padding:14px 16px;text-align:left;font-size:11px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:1px;text-transform:uppercase">Sr.</th>
              <th style="padding:14px 16px;text-align:left;font-size:11px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:1px;text-transform:uppercase">Description</th>
              <th style="padding:14px 16px;text-align:left;font-size:11px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:1px;text-transform:uppercase">Pax</th>
              <th style="padding:14px 16px;text-align:right;font-size:11px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:1px;text-transform:uppercase">Amount (INR)</th>
            </tr></thead>
            <tbody>
              <tr style="border-bottom:1px solid #e2e8f0">
                <td style="padding:16px;font-size:14px;color:#475569">1</td>
                <td style="padding:16px;font-size:14px;font-weight:600;color:#1e293b">${packageName || destination || "Travel Package"}<br><span style="font-size:11px;color:#94a3b8;font-weight:400">${duration || ""} ${vehicleName ? "• " + vehicleName : ""}</span></td>
                <td style="padding:16px;font-size:14px;color:#475569">${numTravelers}</td>
                <td style="padding:16px;text-align:right;font-size:18px;font-weight:800;color:${brandColor}">₹${totalPrice.toLocaleString("en-IN")}</td>
              </tr>
              <tr style="background:#f8fafc">
                <td colspan="3" style="padding:16px;text-align:right;font-size:14px;font-weight:700;color:${brandColor}">Grand Total</td>
                <td style="padding:16px;text-align:right;font-size:22px;font-weight:900;color:${brandColor}">₹${totalPrice.toLocaleString("en-IN")} /-</td>
              </tr>
            </tbody>
          </table>
          <p style="font-size:11px;color:#94a3b8;margin-top:8px;font-style:italic">${priceIncludesDriver ? "* Price is inclusive of driver charges, tolls & parking" : "* Price excludes GST and additional taxes"}</p>
          ` : ""}

          ${driverName ? `
          <div style="margin-top:28px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:12px;padding:20px 24px;border:1px solid #bbf7d0;display:flex;align-items:center;gap:20px">
            <div style="width:48px;height:48px;border-radius:50%;background:#22c55e;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;flex-shrink:0">${driverName.charAt(0)}</div>
            <div>
              <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#16a34a;margin-bottom:2px">Assigned Driver</div>
              <div style="font-size:16px;font-weight:700;color:#166534">${driverName}</div>
              ${driverPhone ? `<div style="font-size:12px;color:#22c55e;margin-top:2px">☎ ${driverPhone}</div>` : ""}
            </div>
          </div>` : ""}
        </div>
        ${footerBar}
      </div>`;

    // ═══════════ PAGE 3: HOTELS ═══════════
    const hotelsInDays = days.filter(d => d.hotel);
    const hotelsPage = hotelsInDays.length > 0 ? `
      <div style="${pageStyle}page-break-before:always">
        ${headerBar}
        <div style="flex:1;padding:40px">
          ${sectionTitle("Accommodation Details", "🏨")}
          <p style="font-size:13px;color:#64748b;margin-bottom:24px">Your carefully selected accommodations for each night of the journey.</p>
          ${hotelsInDays.map((d, idx) => {
            const nightNum = idx + 1;
            return `
            <div style="display:flex;gap:16px;margin-bottom:20px;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
              <div style="width:80px;background:${brandColor};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 0;flex-shrink:0">
                <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;opacity:0.7">Night</div>
                <div style="font-size:28px;font-weight:900;line-height:1">${nightNum}</div>
              </div>
              <div style="flex:1;padding:16px 20px">
                <div style="font-size:16px;font-weight:700;color:${brandColor};margin-bottom:4px">${d.hotel}</div>
                <div style="font-size:12px;color:#64748b">${d.title || `Day ${d.day}`}</div>
                <div style="display:flex;gap:20px;margin-top:10px">
                  <div style="font-size:11px;color:#94a3b8"><strong style="color:#475569">Rooms:</strong> ${Math.ceil(numTravelers / 2)}</div>
                  <div style="font-size:11px;color:#94a3b8"><strong style="color:#475569">Meals:</strong> ${d.meals || "As per package"}</div>
                </div>
              </div>
            </div>`;
          }).join("")}
        </div>
        ${footerBar}
      </div>` : "";

    // ═══════════ PAGE 4: DAY SERVICE SUMMARY ═══════════
    const summaryPage = `
      <div style="${pageStyle}page-break-before:always">
        ${headerBar}
        <div style="flex:1;padding:40px">
          ${sectionTitle("Day Service Summary", "📋")}
          <table style="width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
            <thead><tr style="background:linear-gradient(135deg,${brandColor},${secondaryColor})">
              <th style="padding:14px 16px;text-align:left;font-size:11px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:1px;text-transform:uppercase;width:80px">Day</th>
              <th style="padding:14px 16px;text-align:left;font-size:11px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:1px;text-transform:uppercase">Date</th>
              <th style="padding:14px 16px;text-align:left;font-size:11px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:1px;text-transform:uppercase">Activity</th>
              <th style="padding:14px 16px;text-align:left;font-size:11px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:1px;text-transform:uppercase">Hotel</th>
            </tr></thead>
            <tbody>
            ${days.map((d, i) => {
              let dateStr = "—";
              if (travelDate) {
                const dayDate = new Date(travelDate);
                dayDate.setDate(dayDate.getDate() + d.day - 1);
                dateStr = format(dayDate, "EEE, dd MMM");
              }
              return `<tr style="border-bottom:1px solid #e2e8f0;${i % 2 === 0 ? "" : "background:#f8fafc"}">
                <td style="padding:14px 16px;font-weight:800;color:${brandColor};font-size:14px">Day ${d.day}</td>
                <td style="padding:14px 16px;font-size:13px;color:#475569">${dateStr}</td>
                <td style="padding:14px 16px;font-size:13px;color:#1e293b;font-weight:500">${d.title || `Day ${d.day}`}</td>
                <td style="padding:14px 16px;font-size:12px;color:#64748b">${d.hotel || "—"}</td>
              </tr>`;
            }).join("")}
            </tbody>
          </table>
        </div>
        ${footerBar}
      </div>`;

    // ═══════════ PAGES 5+: DAY-WISE DETAILED ITINERARY ═══════════
    const dayPages = days.map(d => {
      let dateStr = "";
      if (travelDate) {
        const dayDate = new Date(travelDate);
        dayDate.setDate(dayDate.getDate() + d.day - 1);
        dateStr = format(dayDate, "EEEE, do MMMM yyyy");
      }
      const activitiesList = d.activities ? d.activities.split(",").map(a => a.trim()).filter(Boolean) : [];

      return `
      <div style="${pageStyle}page-break-before:always">
        ${headerBar}
        <div style="flex:1;padding:0">
          ${d.image ? `
          <div style="position:relative;height:280px;overflow:hidden">
            <img src="${d.image}" style="width:100%;height:100%;object-fit:cover" />
            <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.7) 100%)"></div>
            <div style="position:absolute;bottom:0;left:0;right:0;padding:24px 40px">
              <div style="display:inline-block;background:${accentColor};color:#fff;font-size:11px;font-weight:800;padding:6px 16px;border-radius:6px;margin-bottom:8px">DAY ${d.day}</div>
              <h2 style="font-size:28px;font-weight:900;color:#fff;margin:0;text-shadow:0 2px 8px rgba(0,0,0,0.3)">${d.title || `Day ${d.day}`}</h2>
              ${dateStr ? `<p style="font-size:13px;color:rgba(255,255,255,0.8);margin:4px 0 0">${dateStr}</p>` : ""}
            </div>
          </div>` : `
          <div style="background:linear-gradient(135deg,${brandColor},${secondaryColor});padding:40px;position:relative;overflow:hidden">
            <div style="position:absolute;top:-30px;right:-30px;width:200px;height:200px;border-radius:50%;background:${accentColor}15"></div>
            <div style="display:inline-block;background:${accentColor};color:#fff;font-size:11px;font-weight:800;padding:6px 16px;border-radius:6px;margin-bottom:12px">DAY ${d.day}</div>
            <h2 style="font-size:28px;font-weight:900;color:#fff;margin:0">${d.title || `Day ${d.day}`}</h2>
            ${dateStr ? `<p style="font-size:13px;color:rgba(255,255,255,0.75);margin:6px 0 0">${dateStr}</p>` : ""}
          </div>`}

          <div style="padding:32px 40px">
            ${d.description ? `
            <div style="margin-bottom:24px">
              <h3 style="font-size:14px;font-weight:800;color:${brandColor};text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;display:flex;align-items:center;gap:8px"><span style="width:20px;height:2px;background:${accentColor};display:inline-block"></span> Overview</h3>
              <p style="font-size:14px;color:#475569;line-height:2;margin:0">${d.description}</p>
            </div>` : ""}

            ${activitiesList.length > 0 ? `
            <div style="margin-bottom:24px">
              <h3 style="font-size:14px;font-weight:800;color:${brandColor};text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;display:flex;align-items:center;gap:8px"><span style="width:20px;height:2px;background:${accentColor};display:inline-block"></span> Activities</h3>
              <div style="display:flex;flex-wrap:wrap;gap:8px">
                ${activitiesList.map(a => `<span style="background:${brandColor}0a;border:1px solid ${brandColor}20;color:${brandColor};padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600">📍 ${a}</span>`).join("")}
              </div>
            </div>` : ""}

            <div style="display:flex;gap:16px;flex-wrap:wrap">
              ${d.hotel ? `
              <div style="flex:1;min-width:200px;background:#f8fafc;border-radius:12px;padding:16px 20px;border:1px solid #e2e8f0">
                <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin-bottom:6px">🏨 Accommodation</div>
                <div style="font-size:15px;font-weight:700;color:#1e293b">${d.hotel}</div>
              </div>` : ""}
              ${d.meals ? `
              <div style="flex:1;min-width:200px;background:#fefce8;border-radius:12px;padding:16px 20px;border:1px solid #fef08a">
                <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#a16207;margin-bottom:6px">🍽 Meals Included</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  ${d.meals.split(",").map(m => `<span style="background:#fef9c3;color:#854d0e;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600">${m.trim()}</span>`).join("")}
                </div>
              </div>` : ""}
            </div>
          </div>
        </div>
        ${footerBar}
      </div>`;
    }).join("");

    // ═══════════ INCLUSIONS / EXCLUSIONS PAGE ═══════════
    const inclusionsPage = (inclusions || exclusions) ? `
      <div style="${pageStyle}page-break-before:always">
        ${headerBar}
        <div style="flex:1;padding:40px">
          ${sectionTitle("What's Included & Excluded", "📝")}
          <div style="display:flex;gap:24px;margin-bottom:32px">
            ${inclusions ? `
            <div style="flex:1;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:16px;padding:28px;border:1px solid #bbf7d0">
              <div style="font-size:14px;font-weight:800;color:#166534;margin-bottom:16px;display:flex;align-items:center;gap:8px">✅ Inclusions</div>
              <ul style="font-size:13px;color:#374151;line-height:2.2;padding-left:20px;margin:0;list-style:none">
                ${inclusions.split("\n").filter(Boolean).map(i => `<li style="position:relative;padding-left:8px"><span style="position:absolute;left:-16px;color:#22c55e;font-weight:700">✓</span> ${i}</li>`).join("")}
              </ul>
            </div>` : ""}
            ${exclusions ? `
            <div style="flex:1;background:linear-gradient(135deg,#fef2f2,#fee2e2);border-radius:16px;padding:28px;border:1px solid #fecaca">
              <div style="font-size:14px;font-weight:800;color:#991b1b;margin-bottom:16px;display:flex;align-items:center;gap:8px">❌ Exclusions</div>
              <ul style="font-size:13px;color:#374151;line-height:2.2;padding-left:20px;margin:0;list-style:none">
                ${exclusions.split("\n").filter(Boolean).map(i => `<li style="position:relative;padding-left:8px"><span style="position:absolute;left:-16px;color:#ef4444;font-weight:700">✗</span> ${i}</li>`).join("")}
              </ul>
            </div>` : ""}
          </div>

          ${specialNotes ? `
          ${sectionTitle("Important Notes", "⚠")}
          <div style="background:#fffbeb;border-radius:12px;padding:24px;border:1px solid #fde68a;margin-bottom:24px">
            <p style="font-size:13px;color:#92400e;line-height:1.9;margin:0;white-space:pre-line">${specialNotes}</p>
          </div>` : ""}

          ${emergencyContact ? `
          <div style="background:linear-gradient(135deg,#fef2f2,#fff1f2);border-radius:12px;padding:20px 24px;border:1px solid #fecaca">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#dc2626;margin-bottom:6px">🆘 Emergency Contact (24x7)</div>
            <div style="font-size:16px;font-weight:800;color:#991b1b">${emergencyContact}</div>
          </div>` : ""}
        </div>
        ${footerBar}
      </div>` : "";

    // ═══════════ TERMS & CONDITIONS PAGE ═══════════
    const packageTermsContent = (settings as any)?.package_terms || `${companyName} provides local, outstation, and airport transfer services through company-owned or partner vehicles.
Booking is confirmed only after receiving confirmation via call, SMS, email, or official notification.
Fares are calculated based on distance, duration, vehicle category, tolls, parking, state taxes, and applicable charges.
Prices may vary due to route changes, traffic, peak hours, or government regulations without prior notice.
Payments can be made via cash, UPI, debit/credit cards, or other approved payment modes.
Passengers must provide accurate booking details and maintain proper behaviour during the trip.
Any misuse, damage, or illegal activity may result in trip cancellation without refund.
Vehicle images/models are indicative and may be substituted with a similar category if required.
${companyName} is not responsible for delays caused by traffic, weather, road conditions, strikes, or force majeure events.
Passengers are responsible for their luggage. The company is not liable for loss or damage to personal belongings.
Hotel check-in/check-out times are subject to hotel policy. Early check-in/late check-out is subject to availability.
Terms & conditions may be updated without prior notice and are governed by the laws of India.`;

    const cancellationContent = (settings as any)?.package_cancellation_policy || "";

    const termsPage = `
      <div style="${pageStyle}page-break-before:always">
        ${headerBar}
        <div style="flex:1;padding:40px">
          ${sectionTitle("Terms & Conditions", "📜")}
          <div style="columns:2;column-gap:32px">
            <ol style="font-size:12px;color:#475569;line-height:2;padding-left:20px;margin:0">
              ${packageTermsContent.split("\n").filter(Boolean).map((line: string) => `<li style="margin-bottom:6px">${line}</li>`).join("")}
            </ol>
          </div>

          ${cancellationContent ? `
          <div style="margin-top:32px">
            ${sectionTitle("Cancellation Policy", "🚫")}
            <div style="background:#fef2f2;border-radius:12px;padding:24px;border:1px solid #fecaca">
              <ul style="font-size:12px;color:#475569;line-height:2.2;padding-left:20px;margin:0;list-style:none">
                ${cancellationContent.split("\n").filter(Boolean).map((line: string) => `<li style="position:relative;padding-left:8px;margin-bottom:4px"><span style="position:absolute;left:-16px;color:#ef4444;font-weight:700">•</span> ${line}</li>`).join("")}
              </ul>
            </div>
          </div>` : ""}

          <div style="margin-top:48px;text-align:center;padding:32px;background:linear-gradient(135deg,${brandColor},${secondaryColor});border-radius:16px;color:#fff;border:2px solid ${accentColor}30">
            ${logoUrl ? `<img src="${logoUrl}" style="height:52px;margin-bottom:12px;filter:brightness(10)" />` : ""}
            <div style="font-size:24px;font-weight:900;letter-spacing:2px;margin-bottom:4px">${companyName}</div>
            <div style="font-size:13px;opacity:0.8;margin-bottom:12px">Making your journeys memorable</div>
            <div style="display:flex;justify-content:center;gap:24px;flex-wrap:wrap;font-size:12px;opacity:0.7">
              ${companyPhone ? `<span>☎ ${companyPhone}</span>` : ""}
              ${companyEmail ? `<span>✉ ${companyEmail}</span>` : ""}
            </div>
            ${companyAddress ? `<div style="font-size:11px;opacity:0.6;margin-top:8px">${companyAddress}</div>` : ""}
          </div>
        </div>
        ${footerBar}
      </div>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Itinerary - ${customerName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;500;600;700;800;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'${font}',system-ui,sans-serif;color:#1f2937;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    div[style*="page-break-before"]{page-break-before:always}
  }
</style></head><body>
${coverPage}
${overviewPage}
${hotelsPage}
${summaryPage}
${dayPages}
${inclusionsPage}
${termsPage}
</body></html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 600); }
  };

  const loadDummyData = () => {
    setCustomerName("Ananya & Vikram Mehta");
    setCustomerPhone("+91 98765 43210");
    setCustomerEmail("ananya.mehta@gmail.com");
    setPackageName("Royal Rajasthan Heritage Tour");
    setDestination("Jaipur - Jodhpur - Udaipur");
    setTravelDate(format(new Date(Date.now() + 10 * 86400000), "yyyy-MM-dd"));
    setDuration("5N/6D");
    setNumTravelers(4);
    setPickupLocation("Jaipur Airport (JAI)");
    setDropLocation("Udaipur Airport (UDR)");
    setVehicleName("Toyota Innova Crysta");
    setVehicleType("Premium SUV");
    setDriverName("Rajesh Singh");
    setDriverPhone("+91 99887 76655");
    setTotalPrice(68500);
    setPriceIncludesDriver(true);
    setBackgroundImage("https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200");
    setInclusions("5 Nights hotel accommodation (Deluxe rooms)\nDaily Breakfast & Dinner at hotel\nAC Toyota Innova Crysta for all transfers & sightseeing\nProfessional English-speaking driver\nAll toll taxes, parking charges & fuel costs\nMonument entry tickets for all listed places\nComplimentary bottled water daily\nWelcome drink on arrival at each hotel\nOne traditional Rajasthani dinner with folk dance");
    setExclusions("Airfare / Train tickets\nLunch during sightseeing\nPersonal expenses (laundry, phone calls)\nTips & gratuities\nTravel insurance\nCamera charges at monuments\nAny activity not mentioned in inclusions");
    setSpecialNotes("Family is vegetarian — please ensure all meals are pure veg.\nOne child (age 8) — child-friendly activities preferred.\nGuest prefers early morning starts for sightseeing.\nPlease arrange interconnecting rooms wherever possible.\nAllergic to nuts — inform all restaurants in advance.");
    setEmergencyContact("+91 98765 00000 (24x7 Travel Helpline)");
    setDays([
      { day: 1, title: "Arrival in Jaipur — The Pink City", description: "Arrive at Jaipur Airport. Meet & greet by our representative. Transfer to hotel for check-in and refreshments. Afternoon visit to the stunning Hawa Mahal (Palace of Winds) and explore the vibrant local bazaars of Johari Bazaar and Bapu Bazaar for traditional handicrafts. Evening at leisure. Welcome dinner featuring authentic Rajasthani cuisine.", hotel: "ITC Rajputana, Jaipur", meals: "Dinner", activities: "Airport Pickup, Hawa Mahal, Johari Bazaar, Bapu Bazaar, Welcome Dinner", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800" },
      { day: 2, title: "Jaipur — Forts & Palaces", description: "After breakfast, embark on a full-day exploration of Jaipur's magnificent heritage. Start with the iconic Amber Fort with elephant/jeep ride to the top. Visit the exquisite Sheesh Mahal (Mirror Palace) inside. Continue to City Palace and Jantar Mantar observatory (UNESCO World Heritage Site). Afternoon visit to Nahargarh Fort for breathtaking panoramic views of the city. Evening enjoy a cultural show with folk dance and music.", hotel: "ITC Rajputana, Jaipur", meals: "Breakfast, Dinner", activities: "Amber Fort, Sheesh Mahal, City Palace, Jantar Mantar, Nahargarh Fort, Folk Dance Show", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800" },
      { day: 3, title: "Jaipur to Jodhpur — The Blue City", description: "Check out after breakfast and drive to Jodhpur (approx. 5 hours) via the Ajmer-Pushkar highway. En route, stop at Pushkar for a visit to the sacred Pushkar Lake and the only Brahma Temple in the world. Arrive in Jodhpur by afternoon. Check into hotel. Evening visit to the Clock Tower market area and enjoy the local street food experience.", hotel: "Taj Hari Mahal, Jodhpur", meals: "Breakfast, Dinner", activities: "Pushkar Lake, Brahma Temple, Clock Tower Market, Street Food Tour", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800" },
      { day: 4, title: "Jodhpur — Mehrangarh & Heritage", description: "Full day exploring the magnificent city of Jodhpur. Start with the imposing Mehrangarh Fort — one of India's largest forts with stunning views of the blue city below. Explore the fort's museum showcasing royal artifacts, palanquins, and arms. Visit Jaswant Thada, a beautiful marble cenotaph. Afternoon visit to Umaid Bhawan Palace museum. Evening at leisure with optional zip-lining at the fort.", hotel: "Taj Hari Mahal, Jodhpur", meals: "Breakfast, Dinner", activities: "Mehrangarh Fort, Fort Museum, Jaswant Thada, Umaid Bhawan Palace, Optional Zip-line", image: "https://images.unsplash.com/photo-1585136917228-0baca95c0638?w=800" },
      { day: 5, title: "Jodhpur to Udaipur — City of Lakes", description: "Depart for Udaipur (approx. 5.5 hours) after breakfast. En route, visit the stunning Ranakpur Jain Temple, famous for its 1,444 intricately carved marble pillars — no two alike. Arrive in Udaipur by afternoon. Check into hotel. Evening boat ride on the serene Lake Pichola with views of the City Palace and Jag Mandir island. Special traditional Rajasthani dinner with live folk music and puppet show.", hotel: "The Leela Palace, Udaipur", meals: "Breakfast, Dinner", activities: "Ranakpur Jain Temple, Lake Pichola Boat Ride, Jag Mandir View, Rajasthani Cultural Dinner", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800" },
      { day: 6, title: "Udaipur Sightseeing & Departure", description: "After breakfast, visit the grand City Palace — the largest palace complex in Rajasthan overlooking Lake Pichola. Explore Saheliyon Ki Bari (Garden of the Maidens) with its beautiful fountains and marble elephants. Visit the Vintage Car Museum. Last-minute souvenir shopping at Hathi Pol bazaar. Transfer to Udaipur Airport for departure with cherished memories of Royal Rajasthan.", hotel: "", meals: "Breakfast", activities: "City Palace, Saheliyon Ki Bari, Vintage Car Museum, Hathi Pol Bazaar, Airport Drop", image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e13?w=800" },
    ]);
    toast({ title: "Sample data loaded — Royal Rajasthan Heritage Tour" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6 text-primary" /> Itinerary Maker</h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={loadDummyData}>Load Sample Data</Button>
          <Button variant="outline" onClick={() => saveItinerary.mutate()} disabled={saveItinerary.isPending || !customerName}>
            <Save className="w-4 h-4 mr-1" /> {saveItinerary.isPending ? "Saving..." : "Save to History"}
          </Button>
          <Button onClick={generateItineraryPDF} disabled={!customerName}>
            <Download className="w-4 h-4 mr-1" /> Generate PDF
          </Button>
        </div>
      </div>

      {/* Link Booking */}
      <Card>
        <CardHeader><CardTitle className="text-base">Load from Booking</CardTitle></CardHeader>
        <CardContent>
          <SearchableBookingPicker
            bookings={bookings}
            value={bookingId}
            onSelect={(id) => { if (id) fillFromBooking(id); else setBookingId(""); }}
            filterStatuses={["confirmed", "pending"]}
            placeholder="Search booking by customer name, package, date..."
          />
        </CardContent>
      </Card>

      {/* Intro / Background Image */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ImageIcon className="w-4 h-4 text-primary" /> Introduction Page</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Background Image URL (for cover page)</Label>
            <Input value={backgroundImage} onChange={e => setBackgroundImage(e.target.value)} placeholder="https://images.unsplash.com/..." />
          </div>
          {backgroundImage && (
            <div className="relative rounded-xl overflow-hidden h-40">
              <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-primary/30 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-xs uppercase tracking-widest opacity-80">Travel Itinerary</p>
                  <p className="text-xl font-bold">{packageName || "Package Name"}</p>
                  <p className="text-sm opacity-90">{destination || "Destination"}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guest Details */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Guest Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Name</Label><Input value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Travelers</Label><Input type="number" min={1} value={numTravelers} onChange={e => setNumTravelers(Number(e.target.value))} /></div>
            </div>
          </CardContent>
        </Card>

        {/* Trip Details */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Trip Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Package Name</Label><Input value={packageName} onChange={e => setPackageName(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Destination</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={destination} onChange={e => setDestination(e.target.value)}>
                  <option value="">Select / type</option>
                  {destinations.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Travel Date</Label><Input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Duration</Label><Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="3N/4D" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Pickup</Label><Input value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Drop Location</Label><Input value={dropLocation} onChange={e => setDropLocation(e.target.value)} /></div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><IndianRupee className="w-4 h-4 text-primary" /> Pricing (Optional)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Total Price (INR)</Label><Input type="number" min={0} value={totalPrice} onChange={e => setTotalPrice(Number(e.target.value))} placeholder="0" /></div>
              <div className="flex items-center gap-3 pt-5">
                <Switch checked={priceIncludesDriver} onCheckedChange={setPriceIncludesDriver} />
                <Label className="text-xs">{priceIncludesDriver ? "Price includes driver" : "Price excludes driver"}</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Car className="w-4 h-4 text-primary" /> Vehicle</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Vehicle</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={vehicleName} onChange={e => { setVehicleName(e.target.value); const v = vehicles.find((v: any) => v.name === e.target.value); if (v) setVehicleType(v.type); }}>
                  <option value="">Select</option>
                  {vehicles.map((v: any) => <option key={v.id} value={v.name}>{v.name} ({v.type})</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Vehicle Type</Label><Input value={vehicleType} onChange={e => setVehicleType(e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        {/* Driver */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Driver</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Driver</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={driverName} onChange={e => { setDriverName(e.target.value); const d = drivers.find((d: any) => d.name === e.target.value); if (d) setDriverPhone(d.phone); }}>
                  <option value="">Select</option>
                  {drivers.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Driver Phone</Label><Input value={driverPhone} onChange={e => setDriverPhone(e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day-wise Itinerary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Day-wise Itinerary</CardTitle>
            <Button size="sm" variant="outline" onClick={addDay}><Plus className="w-3 h-3 mr-1" /> Add Day</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {days.map((day, idx) => (
            <div key={idx} className="border border-border rounded-xl p-4 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary">Day {day.day}</span>
                {days.length > 1 && <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeDay(idx)}><X className="w-3 h-3" /></Button>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={day.title} onChange={e => updateDay(idx, "title", e.target.value)} placeholder={`Day ${day.day} - Arrival`} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Hotel</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={day.hotel} onChange={e => updateDay(idx, "hotel", e.target.value)}>
                    <option value="">Select hotel</option>
                    {hotels.map((h: any) => <option key={h.id} value={h.name}>{h.name} - {h.location}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea value={day.description} onChange={e => updateDay(idx, "description", e.target.value)} rows={3} placeholder="Detailed plan for the day..." /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Meals</Label><Input value={day.meals} onChange={e => updateDay(idx, "meals", e.target.value)} placeholder="Breakfast, Lunch, Dinner" /></div>
                <div className="space-y-1.5"><Label className="text-xs">Activities</Label><Input value={day.activities} onChange={e => updateDay(idx, "activities", e.target.value)} placeholder="Sightseeing, Water sports" /></div>
                <div className="space-y-1.5"><Label className="text-xs flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Day Image URL</Label><Input value={day.image} onChange={e => updateDay(idx, "image", e.target.value)} placeholder="https://..." /></div>
              </div>
              {day.image && <img src={day.image} alt="" className="w-full h-32 object-cover rounded-lg" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Inclusions, Exclusions, Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Inclusions</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={inclusions} onChange={e => setInclusions(e.target.value)} rows={5} placeholder="One per line:&#10;Hotel accommodation&#10;Breakfast & Dinner&#10;AC vehicle" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Exclusions</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={exclusions} onChange={e => setExclusions(e.target.value)} rows={5} placeholder="One per line:&#10;Airfare&#10;Personal expenses&#10;Entry tickets" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Special Notes & Emergency</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">Special Notes</Label><Textarea value={specialNotes} onChange={e => setSpecialNotes(e.target.value)} rows={3} placeholder="Any special instructions, dietary needs, etc." /></div>
          <div className="space-y-1.5"><Label className="text-xs">Emergency Contact</Label><Input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="+91 98765 43210 (24x7)" /></div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end pb-8">
        <Button variant="outline" onClick={() => saveItinerary.mutate()} disabled={saveItinerary.isPending || !customerName}>
          <Save className="w-4 h-4 mr-1" /> Save to History
        </Button>
        <Button size="lg" onClick={generateItineraryPDF} disabled={!customerName}>
          <Download className="w-4 h-4 mr-1" /> Generate & Download PDF
        </Button>
      </div>
    </div>
  );
};

export default AdminItinerary;
