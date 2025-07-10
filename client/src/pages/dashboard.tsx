import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import DashboardStats from "@/components/dashboard-stats";
import PropertyFilters from "@/components/property-filters";
import PropertyCard from "@/components/property-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Property } from "@shared/schema";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [filters, setFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState("discount");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [, setLocation] = useLocation();

  const { data: properties = [], isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/properties", { ...filters, sortBy, limit: 12 }],
  });

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handlePropertyClick = (property: Property) => {
    setLocation(`/propiedad/${property.id}`);
  };

  const PropertyGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <Skeleton className="w-full h-48" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Stats */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <PropertyFilters 
              onFiltersChange={handleFiltersChange}
              isLoading={isLoading}
            />
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Propiedades Disponibles
                {!isLoading && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    ({properties.length} resultados)
                  </span>
                )}
              </h2>
              
              {/* Sort Options */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Mayor Descuento</SelectItem>
                    <SelectItem value="price">Menor Precio</SelectItem>
                    <SelectItem value="auction_date">Fecha de Subasta</SelectItem>
                    <SelectItem value="recently_added">Más Recientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">Error al cargar las propiedades</div>
                <Button onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && <PropertyGridSkeleton />}

            {/* Properties Grid */}
            {!isLoading && !error && (
              <>
                {properties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onViewDetails={handlePropertyClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                      No se encontraron propiedades con los filtros seleccionados
                    </div>
                    <Button onClick={() => setFilters({})}>
                      Limpiar Filtros
                    </Button>
                  </div>
                )}

                {/* Load More / Pagination could go here */}
                {properties.length >= 12 && (
                  <div className="text-center mt-8">
                    <Button variant="outline" size="lg">
                      Ver Más Propiedades
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
