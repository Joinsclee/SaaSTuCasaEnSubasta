import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Bed, Bath, Square, Heart, Calendar, Clock, Star } from "lucide-react";
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

  // Función para generar estrellas al azar basado en el ID de la propiedad
  const getOpportunityStars = () => {
    // Usamos el ID de la propiedad como semilla para tener consistencia
    const seed = property.id;
    // Generamos un número entre 1 y 5 basado en el ID
    const stars = ((seed * 9301 + 49297) % 233280) % 5 + 1;
    return stars;
  };

  const renderStars = () => {
    const stars = getOpportunityStars();
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= stars 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white rounded-lg"
      onClick={() => onViewDetails(property)}
    >
      <div className="relative">
        <img
          src={mainImage}
          alt={`Propiedad en ${property.city}, ${property.state}`}
          className="w-full h-48 object-cover"
        />
        
        {/* Stars Rating - Opportunity Score */}
        <div className="absolute top-3 right-3">
          {renderStars()}
        </div>
        
      </div>
      
      <CardContent className="p-4">
        {/* Address Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {property.address}
        </h3>
        
        {/* Location with icon */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1 text-orange-500" />
          <span>{property.city}, {property.state}, FL</span>
        </div>
        
        {/* Property characteristics in one line */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <span>{property.bedrooms} habitaciones</span>
          <span>{property.bathrooms} baños</span>
          <span>{property.sqft.toLocaleString()}sq ft</span>
        </div>
        
        {/* Current Price */}
        <div className="mb-1">
          <span className="text-2xl font-bold text-gray-900">
            ${parseInt(property.auctionPrice).toLocaleString()}
          </span>
        </div>
        
        {/* Estimated Value */}
        <div className="mb-3">
          <span className="text-sm text-gray-600">
            Valor estimado: {formatPrice(property.marketValue)}
          </span>
        </div>
        
        {/* Auction Date with calendar icon */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Calendar className="h-4 w-4 mr-1 text-orange-500" />
          <span>{formatDate(property.auctionDate)}</span>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {property.propertyType === 'casa' ? 'Casa Unifamiliar' : 
           property.propertyType === 'condominio' ? 'Condominio' : 
           property.propertyType === 'townhouse' ? 'Casa Adosada' : property.propertyType} en {property.city}, {property.state}. Construida en {property.yearBuilt}, con {property.bedrooms} habitaciones y {property.bathrooms} baños. Condición: {property.condition}.
        </p>
        
        {/* View Complete Property Button - Orange */}
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-md"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(property);
          }}
        >
          Ver Propiedad Completa
        </Button>
      </CardContent>
    </Card>
  );
}
