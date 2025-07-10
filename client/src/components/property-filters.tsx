import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Search } from "lucide-react";

interface PropertyFiltersProps {
  onFiltersChange: (filters: any) => void;
  isLoading?: boolean;
}

export default function PropertyFilters({ onFiltersChange, isLoading }: PropertyFiltersProps) {
  const [filters, setFilters] = useState({
    location: "",
    state: "",
    priceMin: "",
    priceMax: "",
    propertyTypes: [] as string[],
    auctionTypes: [] as string[],
    minDiscount: [30]
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.propertyTypes, type]
      : filters.propertyTypes.filter(t => t !== type);
    handleFilterChange("propertyTypes", newTypes);
  };

  const handleAuctionTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.auctionTypes, type]
      : filters.auctionTypes.filter(t => t !== type);
    handleFilterChange("auctionTypes", newTypes);
  };

  const applyFilters = () => {
    const appliedFilters = {
      ...filters,
      priceMin: filters.priceMin ? parseInt(filters.priceMin) : undefined,
      priceMax: filters.priceMax ? parseInt(filters.priceMax) : undefined,
      minDiscount: filters.minDiscount[0],
      propertyTypes: filters.propertyTypes.length > 0 ? filters.propertyTypes : undefined,
      auctionTypes: filters.auctionTypes.length > 0 ? filters.auctionTypes : undefined,
    };
    onFiltersChange(appliedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      location: "",
      state: "",
      priceMin: "",
      priceMax: "",
      propertyTypes: [],
      auctionTypes: [],
      minDiscount: [30]
    };
    setFilters(clearedFilters);
    onFiltersChange({});
  };

  const propertyTypes = [
    { id: "casa", label: "Casa" },
    { id: "condominio", label: "Condominio" },
    { id: "townhouse", label: "Casa Adosada" },
    { id: "terreno", label: "Terreno" }
  ];

  const auctionTypes = [
    { id: "ejecucion", label: "Ejecución Hipotecaria" },
    { id: "bancarrota", label: "Bancarrota" },
    { id: "impuestos", label: "Impuestos" }
  ];

  const states = [
    { value: "FL", label: "Florida" },
    { value: "TX", label: "Texas" },
    { value: "CA", label: "California" },
    { value: "NY", label: "Nueva York" },
    { value: "AZ", label: "Arizona" }
  ];

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="space-y-2">
          <Label>Buscar por ubicación</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Ciudad, estado o código postal"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* State Filter */}
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={filters.state} onValueChange={(value) => handleFilterChange("state", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los estados</SelectItem>
              {states.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Rango de Precio</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Mínimo"
              type="number"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange("priceMin", e.target.value)}
            />
            <Input
              placeholder="Máximo"
              type="number"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange("priceMax", e.target.value)}
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label>Tipo de Propiedad</Label>
          <div className="space-y-2">
            {propertyTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={filters.propertyTypes.includes(type.id)}
                  onCheckedChange={(checked) => handlePropertyTypeChange(type.id, !!checked)}
                />
                <Label htmlFor={type.id} className="text-sm font-normal">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Auction Type */}
        <div className="space-y-2">
          <Label>Tipo de Subasta</Label>
          <div className="space-y-2">
            {auctionTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={filters.auctionTypes.includes(type.id)}
                  onCheckedChange={(checked) => handleAuctionTypeChange(type.id, !!checked)}
                />
                <Label htmlFor={type.id} className="text-sm font-normal">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Discount Range */}
        <div className="space-y-2">
          <Label>Descuento Mínimo</Label>
          <Slider
            value={filters.minDiscount}
            onValueChange={(value) => handleFilterChange("minDiscount", value)}
            max={70}
            min={0}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>0%</span>
            <span className="font-medium text-primary">{filters.minDiscount[0]}%</span>
            <span>70%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={applyFilters} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Aplicando..." : "Aplicar Filtros"}
          </Button>
          <Button 
            variant="ghost" 
            onClick={clearFilters} 
            className="w-full"
          >
            Limpiar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
