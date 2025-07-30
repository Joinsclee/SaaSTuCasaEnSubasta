import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import DashboardStats from "@/components/dashboard-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Star, ArrowLeft, Home, DollarSign, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuctionEvent {
  id: number;
  date: string;
  state?: string;
  city: string;
  auctionType: string;
  time: string;
  propertiesCount: number;
}

interface AuctionProperty {
  id: number;
  address: string;
  city: string;
  state: string;
  county: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  originalPrice: number;
  auctionPrice: number;
  discount: number;
  auctionType: string;
  auctionDate: string;
  opportunityScore: number;
  lienAmount: number;
  estimatedValue: number;
  openingBid: number;
  kevinNotes: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAuction, setSelectedAuction] = useState<AuctionEvent | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Lista de estados con imágenes reales
  const states = [
    { code: "AL", name: "Alabama", emoji: "🏈", hasImage: true },
    { code: "AK", name: "Alaska", emoji: "🐻", hasImage: true },
    { code: "AZ", name: "Arizona", emoji: "🌵", hasImage: true },
    { code: "AR", name: "Arkansas", emoji: "💎", hasImage: true },
    { code: "CA", name: "California", emoji: "🌞", hasImage: true },
    { code: "CO", name: "Colorado", emoji: "🏔️", hasImage: true },
    { code: "CT", name: "Connecticut", emoji: "🦞", hasImage: true },
    { code: "DE", name: "Delaware", emoji: "🏖️", hasImage: true },
    { code: "FL", name: "Florida", emoji: "🐊", hasImage: true },
    { code: "GA", name: "Georgia", emoji: "🍑", hasImage: true },
    { code: "HI", name: "Hawaii", emoji: "🌺", hasImage: true },
    { code: "ID", name: "Idaho", emoji: "🥔", hasImage: true },
    { code: "IL", name: "Illinois", emoji: "🏢", hasImage: true },
    { code: "IN", name: "Indiana", emoji: "🏁", hasImage: true },
    { code: "IA", name: "Iowa", emoji: "🌽", hasImage: true },
    { code: "KS", name: "Kansas", emoji: "🌾", hasImage: true },
    { code: "KY", name: "Kentucky", emoji: "🐎", hasImage: true },
    { code: "LA", name: "Louisiana", emoji: "🎷", hasImage: true },
    { code: "ME", name: "Maine", emoji: "🦞", hasImage: true },
    { code: "MD", name: "Maryland", emoji: "🦀", hasImage: true },
    { code: "MA", name: "Massachusetts", emoji: "⚓", hasImage: true },
    { code: "MI", name: "Michigan", emoji: "🚗", hasImage: true },
    { code: "MN", name: "Minnesota", emoji: "❄️", hasImage: true },
    { code: "MS", name: "Mississippi", emoji: "🎣", hasImage: true },
    { code: "MO", name: "Missouri", emoji: "🎸", hasImage: true },
    { code: "MT", name: "Montana", emoji: "🦬", hasImage: true },
    { code: "NE", name: "Nebraska", emoji: "🌽", hasImage: true },
    { code: "NV", name: "Nevada", emoji: "🎰", hasImage: true },
    { code: "NH", name: "New Hampshire", emoji: "🍁", hasImage: true },
    { code: "NJ", name: "New Jersey", emoji: "🏖️", hasImage: true },
    { code: "NM", name: "New Mexico", emoji: "🌶️", hasImage: true },
    { code: "NY", name: "New York", emoji: "🗽", hasImage: true },
    { code: "NC", name: "North Carolina", emoji: "🏔️", hasImage: true },
    { code: "ND", name: "North Dakota", emoji: "🛢️", hasImage: true },
    { code: "OH", name: "Ohio", emoji: "✈️", hasImage: true },
    { code: "OK", name: "Oklahoma", emoji: "🤠", hasImage: true },
    { code: "OR", name: "Oregon", emoji: "🌲", hasImage: true },
    { code: "PA", name: "Pennsylvania", emoji: "🔔", hasImage: true },
    { code: "RI", name: "Rhode Island", emoji: "⛵", hasImage: true },
    { code: "SC", name: "South Carolina", emoji: "🏖️", hasImage: true },
    { code: "SD", name: "South Dakota", emoji: "🗿", hasImage: true },
    { code: "TN", name: "Tennessee", emoji: "🎤", hasImage: true },
    { code: "TX", name: "Texas", emoji: "⭐", hasImage: true },
    { code: "UT", name: "Utah", emoji: "🏔️", hasImage: true },
    { code: "VT", name: "Vermont", emoji: "🍁", hasImage: true },
    { code: "VA", name: "Virginia", emoji: "🏛️", hasImage: true },
    { code: "WA", name: "Washington", emoji: "🍎", hasImage: true },
    { code: "WV", name: "West Virginia", emoji: "⛰️", hasImage: true },
    { code: "WI", name: "Wisconsin", emoji: "🧀", hasImage: true },
    { code: "WY", name: "Wyoming", emoji: "🦬", hasImage: true }
  ];

  // Fetch auction events
  const { data: auctionEvents = [] } = useQuery<AuctionEvent[]>({
    queryKey: ["/api/auction-events", selectedState, currentDate.getFullYear(), currentDate.getMonth() + 1],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: String(currentDate.getFullYear()),
        month: String(currentDate.getMonth() + 1)
      });
      
      if (selectedState) {
        params.append('state', selectedState);
      }
      
      const response = await fetch(`/api/auction-events?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch auction events');
      }
      return response.json();
    }
  });

  // Fetch properties for selected auction
  const { data: auctionProperties = [] } = useQuery<AuctionProperty[]>({
    queryKey: ["/api/auction", selectedAuction?.id, "properties", selectedAuction?.state, selectedAuction?.date],
    queryFn: async () => {
      if (!selectedAuction) return [];
      
      const params = new URLSearchParams({
        state: selectedAuction.state,
        date: selectedAuction.date
      });
      
      const response = await fetch(`/api/auction/${selectedAuction.id}/properties?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch auction properties');
      }
      return response.json();
    },
    enabled: !!selectedAuction
  });

  // Save/remove favorite property mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      const response = await apiRequest(`/api/properties/${propertyId}/favorite`, "POST");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar los favoritos",
        variant: "destructive",
      });
    },
  });

  // Navigation and helper functions
  const handlePropertyClick = (propertyId: number) => {
    setLocation(`/propiedades/${propertyId}`);
  };

  const handleToggleFavorite = (propertyId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking heart
    toggleFavoriteMutation.mutate(propertyId);
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDay = (day: number) => {
    const dayString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return auctionEvents.filter(event => event.date === dayString);
  };

  const getAuctionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'foreclosure': return 'bg-blue-100 text-blue-800';
      case 'bankruptcy': return 'bg-purple-100 text-purple-800'; 
      case 'tax': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= score 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleAuctionClick = (auction: AuctionEvent) => {
    setSelectedAuction(auction);
  };

  const handleBackToCalendar = () => {
    setSelectedAuction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Dashboard Stats */}
        <div className="mb-6 sm:mb-8">
          <DashboardStats />
        </div>

        {/* States Board - Hide when auction is selected */}
        {!selectedAuction && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Selecciona un Estado
                {selectedState && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedState(null)}
                    className="ml-auto"
                  >
                    Ver Todos
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {states.map((state) => (
                  <Button
                    key={state.code}
                    variant={selectedState === state.code ? "default" : "outline"}
                    className="h-44 w-full flex flex-col items-center justify-center p-4 text-xs relative overflow-hidden hover:scale-105 transition-transform"
                    onClick={() => setSelectedState(state.code === selectedState ? null : state.code)}
                  >
                    {state.hasImage ? (
                      <div className="flex flex-col items-center justify-center h-full w-full">
                        <img 
                          src={`/attached_assets/states/${state.code}.png`}
                          alt={state.name}
                          className="w-24 h-24 object-contain mb-2"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="text-4xl mb-2">${state.emoji}</div><div class="text-center leading-tight text-xs font-medium">${state.name}</div>`;
                            }
                          }}
                        />
                        <div className="text-center leading-tight text-xs font-medium">{state.name}</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full w-full">
                        <div className="text-4xl mb-2">{state.emoji}</div>
                        <div className="text-center leading-tight text-xs font-medium">{state.name}</div>
                      </div>
                    )}
                  </Button>
                ))}
              </div>
              {selectedState && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium">
                    Estado seleccionado: {states.find(s => s.code === selectedState)?.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    El calendario mostrará solo las subastas de este estado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Calendar Section - Hide when auction is selected */}
        {!selectedAuction && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Calendario de Subastas
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium min-w-48 text-center capitalize">
                    {getMonthName(currentDate)}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Days of week header */}
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                
                {/* Empty cells for days before month starts */}
                {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
                  <div key={`empty-${index}`} className="p-2 h-24"></div>
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) => {
                  const day = index + 1;
                  const events = getEventsForDay(day);
                  const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                  
                  return (
                    <div 
                      key={day} 
                      className={`p-2 h-24 border rounded-lg relative ${
                        isToday ? 'bg-primary/10 border-primary' : 'bg-white border-gray-200'
                      } ${events.length > 0 ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    >
                      <div className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-gray-900'}`}>
                        {day}
                      </div>
                      {events.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {events.slice(0, 2).map((event) => (
                            <div 
                              key={event.id}
                              className="text-xs p-1 rounded bg-primary/20 text-primary truncate"
                            >
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.time}
                              </div>
                              <div className="truncate">
                                {selectedState ? event.auctionType : `${states.find(s => s.code === event.state)?.name || event.state}`}
                              </div>
                            </div>
                          ))}
                          {events.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{events.length - 2} más
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Event Details for Selected State */}
              {selectedState && auctionEvents.length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Subastas en {states.find(s => s.code === selectedState)?.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {auctionEvents.slice(0, 6).map((event) => (
                      <div 
                        key={event.id} 
                        className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleAuctionClick(event)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium text-sm">
                            {new Date(event.date).toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getAuctionTypeColor(event.auctionType)}`}
                          >
                            {event.auctionType}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          {event.city}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </div>
                          <div>
                            {event.propertiesCount} propiedades
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Events Summary when no state selected */}
              {!selectedState && auctionEvents.length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Próximas Subastas - {getMonthName(currentDate)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {auctionEvents.slice(0, 8).map((event) => (
                      <div 
                        key={event.id} 
                        className="p-3 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleAuctionClick(event)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium text-sm">
                            {states.find(s => s.code === event.state)?.name || event.state} - {event.city}
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getAuctionTypeColor(event.auctionType)}`}
                          >
                            {event.auctionType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div>
                            {new Date(event.date).toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Auction Properties Table */}
        {selectedAuction && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    Propiedades en Subasta - {selectedAuction.city}, {states.find(s => s.code === selectedAuction.state)?.name}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToCalendar}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Calendario
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(selectedAuction.date).toLocaleDateString('es-ES', { 
                    weekday: 'long',
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })} a las {selectedAuction.time}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dirección</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Hab/Baños</TableHead>
                        <TableHead>Pies²</TableHead>
                        <TableHead>Condado</TableHead>
                        <TableHead>Gravamen</TableHead>
                        <TableHead>Oferta Inicial</TableHead>
                        <TableHead>Valor Est.</TableHead>
                        <TableHead>Descuento</TableHead>
                        <TableHead>Oportunidad</TableHead>
                        <TableHead>Favoritos</TableHead>
                        <TableHead>Notas de Kevin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auctionProperties.map((property) => (
                        <TableRow 
                          key={property.id} 
                          className="hover:bg-gray-50 cursor-pointer" 
                          onClick={() => handlePropertyClick(property.id)}
                        >
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold text-sm">{property.address}</div>
                              <div className="text-xs text-gray-500">{property.city}, {property.state}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {property.propertyType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {property.bedrooms}h / {property.bathrooms}b
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {property.sqft?.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{property.county}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-red-600">
                              ${property.lienAmount?.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-blue-600">
                              ${property.openingBid?.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              ${property.estimatedValue?.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {property.discount}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {renderStars(property.opportunityScore)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 h-8 w-8"
                              onClick={(e) => handleToggleFavorite(property.id, e)}
                              disabled={toggleFavoriteMutation.isPending}
                            >
                              <Heart className="h-4 w-4 text-red-500 hover:fill-red-500 transition-colors" />
                            </Button>
                          </TableCell>
                          <TableCell className="max-w-48">
                            <div className="text-xs text-gray-600 truncate" title={property.kevinNotes}>
                              {property.kevinNotes}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {auctionProperties.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Cargando propiedades de la subasta...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}