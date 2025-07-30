import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Calendar, 
  Clock, 
  Download,
  ArrowLeft,
  Car,
  Home as HomeIcon,
  TrendingUp
} from "lucide-react";
import { Property } from "@shared/schema";

export default function PropertyDetail() {
  const [, params] = useRoute("/propiedades/:id");
  const [, setLocation] = useLocation();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const propertyId = params?.id ? parseInt(params.id) : 0;

  // Get selected auction from localStorage to maintain navigation context
  const [selectedAuction, setSelectedAuction] = useState<any>(null);

  useEffect(() => {
    const storedAuction = localStorage.getItem('selectedAuction');
    if (storedAuction) {
      setSelectedAuction(JSON.parse(storedAuction));
    }
  }, []);

  const { data: property, isLoading, error } = useQuery<Property & { isSaved: boolean }>({
    queryKey: ["/api/properties", propertyId],
    enabled: !!propertyId,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (property?.isSaved) {
        await apiRequest("DELETE", `/api/saved-properties/${propertyId}`);
      } else {
        await apiRequest("POST", "/api/saved-properties", { propertyId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-properties"] });
      toast({
        title: property?.isSaved ? "Propiedad removida de favoritos" : "Propiedad guardada en favoritos",
        description: property?.isSaved 
          ? "La propiedad se removió de tu lista de favoritos" 
          : "La propiedad se agregó a tu lista de favoritos",
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Skeleton className="w-full h-80 rounded-xl mb-4" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-20 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">Propiedad no encontrada</div>
            <Button onClick={() => setLocation("/propiedades")}>
              Volver a Propiedades
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilAuction = () => {
    const auctionDate = new Date(property.auctionDate);
    const today = new Date();
    const diffTime = auctionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAuctionTypeLabel = (type: string) => {
    switch (type) {
      case 'ejecucion':
        return 'Ejecución Hipotecaria';
      case 'bancarrota':
        return 'Bancarrota';
      case 'impuestos':
        return 'Impuestos';
      default:
        return type;
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'casa':
        return 'Casa Unifamiliar';
      case 'condominio':
        return 'Condominio';
      case 'townhouse':
        return 'Casa Adosada';
      case 'terreno':
        return 'Terreno';
      default:
        return type;
    }
  };

  const daysUntilAuction = getDaysUntilAuction();
  const totalSavings = parseFloat(property.originalPrice) - parseFloat(property.auctionPrice);
  
  // Default images if none provided
  const defaultImages = [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  ];
  
  const images = property.images && property.images.length > 0 ? property.images : defaultImages;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Buttons */}
        <div className="flex flex-col gap-2 mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/propiedades")}
            className="self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Propiedades
          </Button>
          
          {selectedAuction && (
            <Button
              variant="outline"
              onClick={() => {
                // Store the selected auction and navigate back to dashboard
                localStorage.setItem('selectedAuction', JSON.stringify(selectedAuction));
                setLocation("/dashboard");
              }}
              className="self-start border-primary text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la Lista de la Subasta
            </Button>
          )}
        </div>

        {/* Property Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {property.address}
            </h1>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{property.city}, {property.state} {property.zipCode}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className="bg-red-500 text-white font-bold px-4 py-2 text-lg">
              -{property.discount}%
            </Badge>
            <Button
              variant="outline"
              size="lg"
              onClick={() => toggleFavoriteMutation.mutate()}
              disabled={toggleFavoriteMutation.isPending}
            >
              <Heart className={`h-5 w-5 mr-2 ${property.isSaved ? "fill-red-500 text-red-500" : ""}`} />
              {property.isSaved ? "Guardado" : "Guardar"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div>
            {/* Main Image */}
            <div className="relative mb-4">
              <img
                src={images[selectedImageIndex]}
                alt={`Propiedad principal ${selectedImageIndex + 1}`}
                className="w-full h-80 object-cover rounded-xl"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Vista ${index + 1}`}
                  className={`w-full h-20 object-cover rounded-lg cursor-pointer transition-opacity ${
                    selectedImageIndex === index ? "opacity-100 ring-2 ring-primary" : "opacity-75 hover:opacity-100"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
            
            {/* Property Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Detalles de la Propiedad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <span className="ml-2 font-medium">{getPropertyTypeLabel(property.propertyType)}</span>
                  </div>
                  {property.yearBuilt && (
                    <div>
                      <span className="text-gray-600">Año:</span>
                      <span className="ml-2 font-medium">{property.yearBuilt}</span>
                    </div>
                  )}
                  {property.lotSize && (
                    <div>
                      <span className="text-gray-600">Lote:</span>
                      <span className="ml-2 font-medium">{property.lotSize}</span>
                    </div>
                  )}
                  {property.parking && (
                    <div>
                      <span className="text-gray-600">Estacionamiento:</span>
                      <span className="ml-2 font-medium">{property.parking}</span>
                    </div>
                  )}
                  {property.condition && (
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <span className="ml-2 font-medium text-green-600">{property.condition}</span>
                    </div>
                  )}
                  {property.hoa && (
                    <div>
                      <span className="text-gray-600">HOA:</span>
                      <span className="ml-2 font-medium">{formatPrice(property.hoa)}/mes</span>
                    </div>
                  )}
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                  {property.bedrooms && (
                    <div className="text-center">
                      <Bed className="h-6 w-6 mx-auto text-gray-600 mb-1" />
                      <div className="font-semibold">{property.bedrooms}</div>
                      <div className="text-xs text-gray-600">Habitaciones</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center">
                      <Bath className="h-6 w-6 mx-auto text-gray-600 mb-1" />
                      <div className="font-semibold">{property.bathrooms}</div>
                      <div className="text-xs text-gray-600">Baños</div>
                    </div>
                  )}
                  {property.sqft && (
                    <div className="text-center">
                      <Square className="h-6 w-6 mx-auto text-gray-600 mb-1" />
                      <div className="font-semibold">{property.sqft.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Pies²</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Details Section */}
          <div className="space-y-6">
            {/* Price Information */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Información de Precios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Precio Original:</span>
                    <span className="text-xl text-gray-500 line-through">{formatPrice(property.originalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Precio de Subasta:</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(property.auctionPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-primary/20 pt-3">
                    <span className="font-medium text-gray-900">Ahorro Total:</span>
                    <span className="text-xl font-bold text-green-600">{formatPrice(totalSavings.toString())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Investment Analysis */}
            {(property.marketValue || property.monthlyRent || property.annualROI || property.capRate) && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Análisis de Inversión
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {property.marketValue && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Valor de Mercado Estimado:</span>
                        <span className="font-bold text-gray-900">{formatPrice(property.marketValue)}</span>
                      </div>
                    )}
                    {property.monthlyRent && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Renta Mensual Estimada:</span>
                        <span className="font-bold text-gray-900">{formatPrice(property.monthlyRent)}</span>
                      </div>
                    )}
                    {property.annualROI && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">ROI Anual:</span>
                        <span className="font-bold text-green-600">{property.annualROI}%</span>
                      </div>
                    )}
                    {property.capRate && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Cap Rate:</span>
                        <span className="font-bold text-green-600">{property.capRate}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Auction Information */}
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800">
                  <Calendar className="h-5 w-5 mr-2" />
                  Información de Subasta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tipo de Subasta:</span>
                    <span className="font-medium">{getAuctionTypeLabel(property.auctionType)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fecha y Hora:</span>
                    <span className="font-medium">{formatDate(property.auctionDate)}</span>
                  </div>
                  {property.auctionLocation && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ubicación:</span>
                      <span className="font-medium">{property.auctionLocation}</span>
                    </div>
                  )}
                  {property.depositRequired && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Depósito Requerido:</span>
                      <span className="font-medium text-orange-600">
                        {formatPrice(property.depositRequired)} (10%)
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t border-orange-200 pt-3">
                    <span className="text-gray-600">Tiempo Restante:</span>
                    <span className={`font-bold flex items-center ${
                      daysUntilAuction <= 7 ? "text-orange-600" : "text-green-600"
                    }`}>
                      <Clock className="h-4 w-4 mr-1" />
                      {daysUntilAuction > 0 ? `${daysUntilAuction} días` : "Finalizada"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button variant="outline" size="lg" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Descargar Reporte
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
