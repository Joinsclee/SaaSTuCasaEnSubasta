import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Home, Star, AlertCircle, TrendingUp, Calendar } from "lucide-react";

interface ForeclosureProperty {
  id: number;
  address: string;
  city: string;
  state: string;
  county: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lienAmount: number;
  openingBid: number;
  estimatedValue: number;
  discount: number;
  opportunityScore: number;
  auctionDate: string;
  foreclosureType: string;
  yearBuilt?: number;
  lotSize?: number;
  trusteePhone?: string;
}

export default function Foreclosures() {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const states = [
    { code: "AL", name: "Alabama" },
    { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California" },
    { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },
    { code: "DE", name: "Delaware" },
    { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" },
    { code: "HI", name: "Hawaii" },
    { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" },
    { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" },
    { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" },
    { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" },
    { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" },
    { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" },
    { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" },
    { code: "NY", name: "New York" },
    { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" },
    { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" },
    { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" },
    { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" },
    { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" },
    { code: "WA", name: "Washington" },
    { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" },
    { code: "WY", name: "Wyoming" }
  ];

  const { data: foreclosureData, isLoading, error } = useQuery({
    queryKey: ["/api/foreclosures", selectedState, selectedCity, zipCode, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: "25"
      });
      
      if (selectedState) params.append("state", selectedState);
      if (selectedCity) params.append("city", selectedCity);
      if (zipCode) params.append("zipCode", zipCode);
      
      const response = await fetch(`/api/foreclosures?${params}`);
      if (!response.ok) {
        throw new Error('Error al obtener datos de foreclosure');
      }
      return response.json();
    },
    enabled: !!selectedState // Only fetch when a state is selected
  });

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Home className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Datos Reales de Foreclosure</h1>
            <Badge className="bg-green-100 text-green-800">ATTOM Data</Badge>
          </div>
          <p className="text-gray-600">
            Propiedades en foreclosure con datos en tiempo real de ATTOM Data
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad (Opcional)
                </label>
                <Input
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  placeholder="Ej: Miami"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal (Opcional)
                </label>
                <Input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Ej: 33101"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                onClick={() => setCurrentPage(1)}
                disabled={!selectedState}
                className="w-full md:w-auto"
              >
                Buscar Propiedades
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {!selectedState ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona un Estado para Empezar
              </h3>
              <p className="text-gray-600">
                Elige un estado de la lista para ver propiedades en foreclosure reales
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="py-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error al Cargar Datos
              </h3>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : 'Error desconocido'}
              </p>
              <Button onClick={() => setCurrentPage(1)}>
                Intentar de Nuevo
              </Button>
            </CardContent>
          </Card>
        ) : foreclosureData?.properties?.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Propiedades en Foreclosure</span>
                <Badge variant="outline">
                  {foreclosureData.pagination.total} resultados
                </Badge>
              </CardTitle>
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
                      <TableHead>Gravamen</TableHead>
                      <TableHead>Valor Est.</TableHead>
                      <TableHead>Descuento</TableHead>
                      <TableHead>Oportunidad</TableHead>
                      <TableHead>Fecha Subasta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foreclosureData.properties.map((property: ForeclosureProperty) => (
                      <TableRow key={property.id}>
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
                          <div className="text-sm font-medium text-red-600">
                            {formatCurrency(property.lienAmount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {formatCurrency(property.estimatedValue)}
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
                          <div className="text-sm">
                            {formatDate(property.auctionDate)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Página {foreclosureData.pagination.page} de {Math.ceil(foreclosureData.pagination.total / 25)}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage <= 1}
                  >
                    Anterior
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= Math.ceil(foreclosureData.pagination.total / 25)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron propiedades
              </h3>
              <p className="text-gray-600">
                Intenta con diferentes filtros de búsqueda
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}