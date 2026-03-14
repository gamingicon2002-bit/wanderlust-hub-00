import { Link } from "react-router-dom";
import { Clock, MapPin, IndianRupee } from "lucide-react";
import { TourPackage } from "@/data/travelData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PackageCard = ({ pkg }: { pkg: TourPackage }) => {
  return (
    <div className="bg-card rounded-lg overflow-hidden card-hover group">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {pkg.originalPrice && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
            {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}% OFF
          </Badge>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <MapPin className="w-3.5 h-3.5" /> {pkg.destination}
          <span className="mx-1">•</span>
          <Clock className="w-3.5 h-3.5" /> {pkg.duration}
        </div>
        <h3 className="font-display text-lg font-semibold mb-2 line-clamp-1">{pkg.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{pkg.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center text-xl font-bold text-primary">
              <IndianRupee className="w-4 h-4" />{pkg.price.toLocaleString()}
            </span>
            {pkg.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">₹{pkg.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <Link to={`/packages/${pkg.id}`}>
            <Button size="sm" variant="outline">View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
