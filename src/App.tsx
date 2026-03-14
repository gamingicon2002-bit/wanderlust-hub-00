import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import HotelLanding from "./pages/HotelLanding";
import InvoiceLanding from "./pages/InvoiceLanding";
import PackagesPage from "./pages/PackagesPage";
import PackageDetail from "./pages/PackageDetail";
import VehiclesPage from "./pages/VehiclesPage";
import VehicleDetail from "./pages/VehicleDetail";
import DestinationsPage from "./pages/DestinationsPage";
import DestinationDetail from "./pages/DestinationDetail";
import HotelsPage from "./pages/HotelsPage";
import HotelDetail from "./pages/HotelDetail";
import OffersPage from "./pages/OffersPage";
import GalleryPage from "./pages/GalleryPage";
import ContactPage from "./pages/ContactPage";
import BookingPage from "./pages/BookingPage";
import BlogsPage from "./pages/BlogsPage";
import BlogDetail from "./pages/BlogDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminDrivers from "./pages/admin/AdminDrivers";
import AdminHotels from "./pages/admin/AdminHotels";
import AdminHotelBookings from "./pages/admin/AdminHotelBookings";
import AdminHotelReviews from "./pages/admin/AdminHotelReviews";
import AdminDestinations from "./pages/admin/AdminDestinations";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminVehicleTypes from "./pages/admin/AdminVehicleTypes";
import AdminBlogComments from "./pages/admin/AdminBlogComments";
import AdminSocialLinks from "./pages/admin/AdminSocialLinks";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPages from "./pages/admin/AdminPages";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminLandingPages from "./pages/admin/AdminLandingPages";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminInvoiceBrands from "./pages/admin/AdminInvoiceBrands";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminItinerary from "./pages/admin/AdminItinerary";
import AdminItineraryHistory from "./pages/admin/AdminItineraryHistory";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminRolePermissions from "./pages/admin/AdminRolePermissions";
import StaticPage from "./pages/StaticPage";
import DriverLogin from "./pages/DriverLogin";
import DriverDashboard from "./pages/DriverDashboard";
import NotFound from "./pages/NotFound";
import Presentation from "./pages/Presentation";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const queryClient = new QueryClient();

const HomePage = () => {
  const { settings } = useSiteSettings();
  const mode = (settings as any)?.business_mode || "full";
  if (mode === "hotel_only") return <HotelLanding />;
  if (mode === "invoice_only") return <InvoiceLanding />;
  return <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/packages/:id" element={<PackageDetail />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/vehicles/:id" element={<VehicleDetail />} />
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route path="/destinations/:id" element={<DestinationDetail />} />
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/hotels/:id" element={<HotelDetail />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/blogs" element={<BlogsPage />} />
              <Route path="/blogs/:id" element={<BlogDetail />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />}>
                <Route index element={<Navigate to="/admin/overview" replace />} />
                <Route path="overview" element={<AdminOverview />} />
                <Route path="packages" element={<AdminPackages />} />
                <Route path="vehicles" element={<AdminVehicles />} />
                <Route path="drivers" element={<AdminDrivers />} />
                <Route path="hotels" element={<AdminHotels />} />
                <Route path="hotel-bookings" element={<AdminHotelBookings />} />
                <Route path="hotel-reviews" element={<AdminHotelReviews />} />
                <Route path="destinations" element={<AdminDestinations />} />
                <Route path="offers" element={<AdminOffers />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="contacts" element={<AdminContacts />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="blogs" element={<AdminBlogs />} />
                <Route path="blog-comments" element={<AdminBlogComments />} />
                <Route path="vehicle-types" element={<AdminVehicleTypes />} />
                <Route path="social-links" element={<AdminSocialLinks />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="pages" element={<AdminPages />} />
                <Route path="homepage" element={<AdminHomepage />} />
                <Route path="landing-pages" element={<AdminLandingPages />} />
                <Route path="invoices" element={<AdminInvoices />} />
                <Route path="invoice-brands" element={<AdminInvoiceBrands />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="itinerary" element={<AdminItinerary />} />
                <Route path="itinerary-history" element={<AdminItineraryHistory />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="role-permissions" element={<AdminRolePermissions />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="/driver/login" element={<DriverLogin />} />
              <Route path="/driver" element={<DriverDashboard />} />
              <Route path="/page/:slug" element={<StaticPage />} />
              <Route path="/presentation" element={<Presentation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
