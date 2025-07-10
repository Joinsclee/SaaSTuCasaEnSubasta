import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import PropertyFilters from "@/components/property-filters";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Property } from "@shared/schema";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Properties() {
  const [filters, setFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState("discount");
  const [currentPage, setCurrentPage] = useState(1);
  const [, setLocation] = useLocation();
  
  const itemsPerPage = 12;
  const offset = (currentPage - 1) * itemsPerPage;

  const { data: properties = [], isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/properties", { ...filters, sortBy, limit: itemsPerPage, offset }],
  });

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePropertyClick = (property: Property) => {
    setLocation(`/propiedad/${property.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const PropertyGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(12)].map((_, i) => (
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
              <h1 className="text-3xl font-bold text-gray-900">
                Todas las Propiedades
                {!isLoading && (
                  <span className="text-lg font-normal text-gray-600 block sm:inline sm:ml-2">
                    Página {currentPage} de resultados
                  </span>
                )}
              </h1>
              
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
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {properties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          onViewDetails={handlePropertyClick}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {properties.length === itemsPerPage && (
                      <div className="mt-8 flex justify-center">
                        <nav className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          {/* Page Numbers */}
                          {[...Array(5)].map((_, i) => {
                            const pageNum = Math.max(1, currentPage - 2) + i;
                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className="w-10"
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={properties.length < itemsPerPage}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </nav>
                      </div>
                    )}
                  </>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
