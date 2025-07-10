import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Calendar } from "lucide-react";

interface PropertyFiltersProps {
  onFiltersChange: (filters: any) => void;
  isLoading?: boolean;
}

interface County {
  county: string;
  propertiesCount: number;
}

interface Property {
  id: number;
  address: string;
  city: string;
  state: string;
  county: string;
  auctionDate: string;
  auctionPrice: number;
  discount: number;
  propertyType: string;
  auctionType: string;
}

export default function PropertyFilters({ onFiltersChange, isLoading }: PropertyFiltersProps) {
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");

  // Fetch counties when state changes
  const { data: counties = [] } = useQuery<County[]>({
    queryKey: ["/api/counties", selectedState],
    enabled: selectedState !== "all",
  });

  // Fetch properties when county changes
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties", { state: selectedState !== "all" ? selectedState : undefined, county: selectedCounty !== "all" ? selectedCounty : undefined }],
    enabled: selectedState !== "all" && selectedCounty !== "all",
  });

  // Update filters when selections change
  useEffect(() => {
    const filters: any = {};
    
    if (selectedState !== "all") {
      filters.state = selectedState;
    }
    
    if (selectedCounty !== "all") {
      filters.county = selectedCounty;
    }

    if (selectedProperty !== "all") {
      filters.propertyId = parseInt(selectedProperty);
    }

    onFiltersChange(filters);
  }, [selectedState, selectedCounty, selectedProperty, onFiltersChange]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedCounty("all");
    setSelectedProperty("all");
  };

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county);
    setSelectedProperty("all");
  };

  const clearFilters = () => {
    setSelectedState("all");
    setSelectedCounty("all");
    setSelectedProperty("all");
    onFiltersChange({});
  };

  // Lista completa de estados estadounidenses
  const states = [
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" },
    { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" },
    { value: "DE", label: "Delaware" },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
    { value: "HI", label: "Hawaii" },
    { value: "ID", label: "Idaho" },
    { value: "IL", label: "Illinois" },
    { value: "IN", label: "Indiana" },
    { value: "IA", label: "Iowa" },
    { value: "KS", label: "Kansas" },
    { value: "KY", label: "Kentucky" },
    { value: "LA", label: "Louisiana" },
    { value: "ME", label: "Maine" },
    { value: "MD", label: "Maryland" },
    { value: "MA", label: "Massachusetts" },
    { value: "MI", label: "Michigan" },
    { value: "MN", label: "Minnesota" },
    { value: "MS", label: "Mississippi" },
    { value: "MO", label: "Missouri" },
    { value: "MT", label: "Montana" },
    { value: "NE", label: "Nebraska" },
    { value: "NV", label: "Nevada" },
    { value: "NH", label: "New Hampshire" },
    { value: "NJ", label: "New Jersey" },
    { value: "NM", label: "New Mexico" },
    { value: "NY", label: "New York" },
    { value: "NC", label: "North Carolina" },
    { value: "ND", label: "North Dakota" },
    { value: "OH", label: "Ohio" },
    { value: "OK", label: "Oklahoma" },
    { value: "OR", label: "Oregon" },
    { value: "PA", label: "Pennsylvania" },
    { value: "RI", label: "Rhode Island" },
    { value: "SC", label: "South Carolina" },
    { value: "SD", label: "South Dakota" },
    { value: "TN", label: "Tennessee" },
    { value: "TX", label: "Texas" },
    { value: "UT", label: "Utah" },
    { value: "VT", label: "Vermont" },
    { value: "VA", label: "Virginia" },
    { value: "WA", label: "Washington" },
    { value: "WV", label: "West Virginia" },
    { value: "WI", label: "Wisconsin" },
    { value: "WY", label: "Wyoming" }
  ];

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Búsqueda por Ubicación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: State Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
            Selecciona un Estado
          </Label>
          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {states.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Step 2: County Selection */}
        {selectedState !== "all" && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Selecciona un Condado
            </Label>
            <Select 
              value={selectedCounty} 
              onValueChange={handleCountyChange}
              disabled={!counties.length}
            >
              <SelectTrigger>
                <SelectValue placeholder={counties.length ? "Selecciona un condado" : "Cargando condados..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los condados</SelectItem>
                {counties.map((county) => (
                  <SelectItem key={county.county} value={county.county}>
                    <div className="flex justify-between items-center w-full">
                      <span>{county.county}</span>
                      <Badge variant="secondary" className="ml-2">
                        {county.propertiesCount} propiedades
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Step 3: Property Selection */}
        {selectedState !== "all" && selectedCounty !== "all" && properties.length > 0 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Ver Subastas Disponibles
            </Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {properties.map((property) => (
                <div 
                  key={property.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedProperty(property.id.toString())}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{property.address}</div>
                      <div className="text-xs text-gray-600">{property.city}, {property.state}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          {property.propertyType}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(property.auctionDate).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-green-600">
                        ${property.auctionPrice?.toLocaleString()}
                      </div>
                      <div className="text-xs text-red-600">
                        {property.discount}% descuento
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters Button */}
        {(selectedState !== "all" || selectedCounty !== "all" || selectedProperty !== "all") && (
          <Button 
            variant="outline" 
            onClick={clearFilters} 
            className="w-full"
          >
            Limpiar Filtros
          </Button>
        )}

        {/* Results Summary */}
        {selectedState !== "all" && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-900">
              Filtros Activos:
            </div>
            <div className="text-sm text-blue-700 mt-1">
              {selectedState !== "all" && (
                <div>• Estado: {states.find(s => s.value === selectedState)?.label}</div>
              )}
              {selectedCounty !== "all" && (
                <div>• Condado: {selectedCounty}</div>
              )}
              {selectedProperty !== "all" && (
                <div>• Propiedad seleccionada</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
