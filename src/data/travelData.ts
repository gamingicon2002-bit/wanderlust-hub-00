import destRajasthan from "@/assets/dest-rajasthan.jpg";
import destHimalaya from "@/assets/dest-himalaya.jpg";
import destGoa from "@/assets/dest-goa.jpg";
import destKerala from "@/assets/dest-kerala.jpg";
import vehicleCar from "@/assets/vehicle-car.jpg";
import vehicleTempo from "@/assets/vehicle-tempo.jpg";
import vehicleBus from "@/assets/vehicle-bus.jpg";

export interface TourPackage {
  id: string;
  name: string;
  destination: string;
  price: number;
  originalPrice?: number;
  duration: string;
  description: string;
  image: string;
  itinerary: string[];
  featured?: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  category: "cars" | "tempo" | "buses" | "maharaja" | "urbania";
  price: string;
  capacity: string;
  description: string;
  features: string[];
  image: string;
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  packageCount: number;
}

export interface SpecialOffer {
  id: string;
  packageName: string;
  originalPrice: number;
  offerPrice: number;
  validUntil: string;
  description: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
}

export const packages: TourPackage[] = [
  {
    id: "1",
    name: "Royal Rajasthan Heritage Tour",
    destination: "Rajasthan",
    price: 24999,
    originalPrice: 32000,
    duration: "7 Days / 6 Nights",
    description: "Explore the majestic forts, palaces, and vibrant culture of Rajasthan. Visit Jaipur, Udaipur, Jodhpur, and Jaisalmer.",
    image: destRajasthan,
    itinerary: ["Day 1: Arrive in Jaipur", "Day 2: Amber Fort & City Palace", "Day 3: Travel to Jodhpur", "Day 4: Mehrangarh Fort", "Day 5: Travel to Jaisalmer", "Day 6: Desert Safari", "Day 7: Departure"],
    featured: true,
  },
  {
    id: "2",
    name: "Himalayan Adventure Trek",
    destination: "Himalayas",
    price: 18999,
    duration: "5 Days / 4 Nights",
    description: "Trek through breathtaking Himalayan trails, camp under stars, and witness stunning mountain views.",
    image: destHimalaya,
    itinerary: ["Day 1: Base Camp Arrival", "Day 2: Trek to Alpine Meadows", "Day 3: Summit Day", "Day 4: Descent & Lake Visit", "Day 5: Return"],
    featured: true,
  },
  {
    id: "3",
    name: "Goa Beach Bliss Package",
    destination: "Goa",
    price: 14999,
    duration: "4 Days / 3 Nights",
    description: "Relax on pristine beaches, enjoy water sports, and explore the vibrant nightlife of Goa.",
    image: destGoa,
    itinerary: ["Day 1: Arrive & Beach Time", "Day 2: Water Sports & Old Goa", "Day 3: South Goa Exploration", "Day 4: Departure"],
    featured: true,
  },
  {
    id: "4",
    name: "Kerala Backwaters Escape",
    destination: "Kerala",
    price: 21999,
    duration: "6 Days / 5 Nights",
    description: "Cruise through serene backwaters, visit tea plantations in Munnar, and enjoy Ayurvedic spa treatments.",
    image: destKerala,
    itinerary: ["Day 1: Arrive in Kochi", "Day 2: Munnar Tea Gardens", "Day 3: Thekkady Wildlife", "Day 4: Alleppey Houseboat", "Day 5: Kovalam Beach", "Day 6: Departure"],
    featured: true,
  },
];

export const vehicles: Vehicle[] = [
  {
    id: "v1",
    name: "Toyota Innova Crysta",
    category: "cars",
    price: "₹15/km",
    capacity: "6+1 Seater",
    description: "Premium MPV perfect for family trips with spacious interiors and smooth ride quality.",
    features: ["AC", "Music System", "Reclining Seats", "Ample Luggage Space"],
    image: vehicleCar,
  },
  {
    id: "v2",
    name: "Tempo Traveller 12-Seater",
    category: "tempo",
    price: "₹22/km",
    capacity: "12 Seater",
    description: "Ideal for group tours with push-back seats, AC, and entertainment system.",
    features: ["AC", "Push-back Seats", "LCD Screen", "Mic System", "Large Windows"],
    image: vehicleTempo,
  },
  {
    id: "v3",
    name: "Luxury Coach Bus",
    category: "buses",
    price: "₹35/km",
    capacity: "35-45 Seater",
    description: "Perfect for large groups and corporate outings with premium amenities.",
    features: ["AC", "Reclining Seats", "Washroom", "WiFi", "Charging Points"],
    image: vehicleBus,
  },
  {
    id: "v4",
    name: "Maharaja Tempo Traveller",
    category: "maharaja",
    price: "₹30/km",
    capacity: "9 Seater",
    description: "Ultra-luxury tempo traveller with sofa-style seating and premium interiors.",
    features: ["AC", "Sofa Seats", "Mini Fridge", "LED TV", "Premium Sound"],
    image: vehicleTempo,
  },
  {
    id: "v5",
    name: "Force Urbania",
    category: "urbania",
    price: "₹28/km",
    capacity: "10-17 Seater",
    description: "Modern, stylish, and comfortable van perfect for premium group travel.",
    features: ["AC", "Captain Seats", "Reading Lights", "USB Charging", "Large Boot"],
    image: vehicleBus,
  },
];

export const destinations: Destination[] = [
  { id: "d1", name: "Rajasthan", description: "Land of kings, majestic forts, and golden deserts.", image: destRajasthan, packageCount: 5 },
  { id: "d2", name: "Himalayas", description: "Snow-capped peaks, lush valleys, and serene monasteries.", image: destHimalaya, packageCount: 4 },
  { id: "d3", name: "Goa", description: "Sun-kissed beaches, vibrant nightlife, and Portuguese heritage.", image: destGoa, packageCount: 3 },
  { id: "d4", name: "Kerala", description: "Backwaters, tea gardens, and tropical paradise.", image: destKerala, packageCount: 4 },
];

export const specialOffers: SpecialOffer[] = [
  {
    id: "so1",
    packageName: "Royal Rajasthan Heritage Tour",
    originalPrice: 32000,
    offerPrice: 24999,
    validUntil: "2026-04-30",
    description: "Save ₹7,001 on our most popular Rajasthan tour! Limited time spring offer.",
    image: destRajasthan,
  },
  {
    id: "so2",
    packageName: "Goa Monsoon Special",
    originalPrice: 18000,
    offerPrice: 11999,
    validUntil: "2026-03-31",
    description: "Experience Goa in the magical monsoon season at an unbeatable price.",
    image: destGoa,
  },
];

export const testimonials: Testimonial[] = [
  { id: "t1", name: "Priya Sharma", location: "Delhi", rating: 5, text: "The Rajasthan tour was absolutely magical! Every detail was perfectly planned. Highly recommend!" },
  { id: "t2", name: "Rahul Verma", location: "Mumbai", rating: 5, text: "Kerala backwaters trip was the best vacation we've ever had. The houseboat experience was unforgettable." },
  { id: "t3", name: "Anita Desai", location: "Bangalore", rating: 4, text: "Great service and amazing vehicles. The tempo traveller was super comfortable for our group trip to Manali." },
];

export const galleryImages = [
  { id: "g1", src: destRajasthan, category: "destination", label: "Rajasthan" },
  { id: "g2", src: destHimalaya, category: "destination", label: "Himalayas" },
  { id: "g3", src: destGoa, category: "destination", label: "Goa" },
  { id: "g4", src: destKerala, category: "destination", label: "Kerala" },
  { id: "g5", src: vehicleCar, category: "vehicle", label: "SUV" },
  { id: "g6", src: vehicleTempo, category: "vehicle", label: "Tempo Traveller" },
  { id: "g7", src: vehicleBus, category: "vehicle", label: "Coach Bus" },
];
