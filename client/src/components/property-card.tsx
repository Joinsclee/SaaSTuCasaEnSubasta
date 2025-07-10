import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Bed, Bath, Square, Heart, Calendar, Clock } from "lucide-react";
import { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property & { isSaved?: boolean };
  onViewDetails: (property: Property) => void;
}

export default function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(property.isSaved || false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        await apiRequest("DELETE", `/api/saved-properties/${property.id}`);
      } else {
        await apiRequest("POST", "/api/saved-properties", { propertyId: property.id });
      }
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      queryClient.invalidateQueries({ queryKey: ["/api/saved-properties"] });
      toast({
        title: isSaved ? "Propiedad removida de favoritos" : "Propiedad guardada en favoritos",
        description: isSaved ? "La propiedad se removió de tu lista de favoritos" : "La propiedad se agregó a tu lista de favoritos",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntilAuction = () => {
    const auctionDate = new Date(property.auctionDate);
    const today = new Date();
    const diffTime = auctionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAuctionTypeColor = (type: string) => {
    switch (type) {
      case 'ejecucion':
        return 'bg-blue-500';
      case 'bancarrota':
        return 'bg-purple-500';
      case 'impuestos':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAuctionTypeLabel = (type: string) => {
    switch (type) {
      case 'ejecucion':
        return 'Ejecución';
      case 'bancarrota':
        return 'Bancarrota';
      case 'impuestos':
        return 'Impuestos';
      default:
        return type;
    }
  };

  const daysUntilAuction = getDaysUntilAuction();
  const mainImage = property.images && property.images.length > 0 ? property.images[0] : 
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onViewDetails(property)}
    >
      <div className="relative">
        <img
          src={mainImage}
          alt={`Propiedad en ${property.city}, ${property.state}`}
          className="w-full h-48 object-cover"
        />
        
        {/* Discount Badge */}
        <Badge className="absolute top-3 left-3 bg-red-500 text-white font-bold px-3 py-1">
          -{property.discount}%
        </Badge>
        
        {/* Auction Type Badge */}
        <Badge className={`absolute top-3 right-3 text-white px-3 py-1 text-xs ${getAuctionTypeColor(property.auctionType)}`}>
          {getAuctionTypeLabel(property.auctionType)}
        </Badge>
        
        {/* Favorite Button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full p-0 shadow-md"
          onClick={handleToggleFavorite}
          disabled={toggleFavoriteMutation.isPending}
        >
          <Heart className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </Button>
      </div>
      
      <CardContent className="p-5">
        {/* Location */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{property.city}, {property.state} {property.zipCode}</span>
        </div>
        
        {/* Price Information */}
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(property.auctionPrice)}
            </span>
            <span className="text-lg text-gray-500 line-through">
              {formatPrice(property.originalPrice)}
            </span>
          </div>
          <p className="text-sm text-green-600 font-medium">
            Ahorras {formatPrice((parseFloat(property.originalPrice) - parseFloat(property.auctionPrice)).toString())}
          </p>
        </div>
        
        {/* Property Details */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.sqft && (
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>
        
        {/* Auction Information */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-600">Fecha de Subasta</p>
              <p className="text-sm font-medium text-gray-900 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(property.auctionDate)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Tiempo Restante</p>
              <p className={`text-sm font-medium flex items-center justify-end ${
                daysUntilAuction <= 7 ? "text-orange-600" : "text-green-600"
              }`}>
                <Clock className="h-3 w-3 mr-1" />
                {daysUntilAuction > 0 ? `${daysUntilAuction} días` : "Finalizada"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
