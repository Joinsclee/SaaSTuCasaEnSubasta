import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import DashboardStats from "@/components/dashboard-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { useLocation } from "wouter";

interface AuctionEvent {
  id: number;
  date: string;
  state?: string;
  city: string;
  auctionType: string;
  time: string;
  propertiesCount: number;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Lista de estados con emojis como placeholder hasta que subas las imágenes
  const states = [
    { code: "AL", name: "Alabama", emoji: "🏈" },
    { code: "AK", name: "Alaska", emoji: "🐻" },
    { code: "AZ", name: "Arizona", emoji: "🌵" },
    { code: "AR", name: "Arkansas", emoji: "💎" },
    { code: "CA", name: "California", emoji: "🌞" },
    { code: "CO", name: "Colorado", emoji: "🏔️" },
    { code: "CT", name: "Connecticut", emoji: "🦞" },
    { code: "DE", name: "Delaware", emoji: "🏖️" },
    { code: "FL", name: "Florida", emoji: "🐊" },
    { code: "GA", name: "Georgia", emoji: "🍑" },
    { code: "HI", name: "Hawaii", emoji: "🌺" },
    { code: "ID", name: "Idaho", emoji: "🥔" },
    { code: "IL", name: "Illinois", emoji: "🏢" },
    { code: "IN", name: "Indiana", emoji: "🏁" },
    { code: "IA", name: "Iowa", emoji: "🌽" },
    { code: "KS", name: "Kansas", emoji: "🌾" },
    { code: "KY", name: "Kentucky", emoji: "🐎" },
    { code: "LA", name: "Louisiana", emoji: "🎷" },
    { code: "ME", name: "Maine", emoji: "🦞" },
    { code: "MD", name: "Maryland", emoji: "🦀" },
    { code: "MA", name: "Massachusetts", emoji: "⚓" },
    { code: "MI", name: "Michigan", emoji: "🚗" },
    { code: "MN", name: "Minnesota", emoji: "❄️" },
    { code: "MS", name: "Mississippi", emoji: "🎣" },
    { code: "MO", name: "Missouri", emoji: "🎸" },
    { code: "MT", name: "Montana", emoji: "🦬" },
    { code: "NE", name: "Nebraska", emoji: "🌽" },
    { code: "NV", name: "Nevada", emoji: "🎰" },
    { code: "NH", name: "New Hampshire", emoji: "🍁" },
    { code: "NJ", name: "New Jersey", emoji: "🏖️" },
    { code: "NM", name: "New Mexico", emoji: "🌶️" },
    { code: "NY", name: "New York", emoji: "🗽" },
    { code: "NC", name: "North Carolina", emoji: "🏔️" },
    { code: "ND", name: "North Dakota", emoji: "🛢️" },
    { code: "OH", name: "Ohio", emoji: "✈️" },
    { code: "OK", name: "Oklahoma", emoji: "🤠" },
    { code: "OR", name: "Oregon", emoji: "🌲" },
    { code: "PA", name: "Pennsylvania", emoji: "🔔" },
    { code: "RI", name: "Rhode Island", emoji: "⛵" },
    { code: "SC", name: "South Carolina", emoji: "🏖️" },
    { code: "SD", name: "South Dakota", emoji: "🗿" },
    { code: "TN", name: "Tennessee", emoji: "🎤" },
    { code: "TX", name: "Texas", emoji: "⭐" },
    { code: "UT", name: "Utah", emoji: "🏔️" },
    { code: "VT", name: "Vermont", emoji: "🍁" },
    { code: "VA", name: "Virginia", emoji: "🏛️" },
    { code: "WA", name: "Washington", emoji: "🍎" },
    { code: "WV", name: "West Virginia", emoji: "⛰️" },
    { code: "WI", name: "Wisconsin", emoji: "🧀" },
    { code: "WY", name: "Wyoming", emoji: "🦬" }
  ];

  // Fetch auction events
  const { data: auctionEvents = [] } = useQuery<AuctionEvent[]>({
    queryKey: ["/api/auction-events", selectedState, currentDate.getFullYear(), currentDate.getMonth() + 1],
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Dashboard Stats */}
        <div className="mb-6 sm:mb-8">
          <DashboardStats />
        </div>

        {/* States Board */}
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
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-3">
                {states.map((state) => (
                  <Button
                    key={state.code}
                    variant={selectedState === state.code ? "default" : "outline"}
                    className="h-20 w-20 flex flex-col items-center justify-center p-2 text-xs"
                    onClick={() => setSelectedState(state.code === selectedState ? null : state.code)}
                  >
                    {/* Placeholder para imagen - se reemplazará cuando subas las imágenes */}
                    <div className="text-2xl mb-1">{state.emoji}</div>
                    <div className="text-center leading-tight">{state.code}</div>
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

        {/* Calendar Section */}
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
                              <div className="truncate">{event.auctionType}</div>
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
                      <div key={event.id} className="p-4 bg-white border rounded-lg">
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
                      <div key={event.id} className="p-3 bg-white border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium text-sm">
                            {event.state} - {event.city}
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
      </div>
    </div>
  );
}