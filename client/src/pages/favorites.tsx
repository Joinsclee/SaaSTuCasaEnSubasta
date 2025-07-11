import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import { SavedProperty, Property } from "@shared/schema";
import { useLocation } from "wouter";

type SavedPropertyWithProperty = SavedProperty & { property: Property };

export default function Favorites() {
  const [, setLocation] = useLocation();

  const { data: savedProperties = [], isLoading, error } = useQuery<SavedPropertyWithProperty[]>({
    queryKey: ["/api/saved-properties"],
  });

  const handlePropertyClick = (property: Property) => {
    setLocation(`/propiedad/${property.id}`);
  };

  const PropertyGridSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <Skeleton className="w-full h-40 sm:h-48" />
          <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
            <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
            <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
            <div className="flex space-x-2 sm:space-x-4">
              <Skeleton className="h-3 sm:h-4 w-10 sm:w-12" />
              <Skeleton className="h-3 sm:h-4 w-10 sm:w-12" />
              <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
              <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Favoritos</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Todas las propiedades que has guardado para revisar más tarde
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">Error al cargar tus propiedades favoritas</div>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <PropertyGridSkeleton />}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {savedProperties.length > 0 ? (
              <>
                {/* Results Counter */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600">
                    {savedProperties.length} {savedProperties.length === 1 ? 'propiedad guardada' : 'propiedades guardadas'}
                  </p>
                </div>

                {/* Properties Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                  {savedProperties.map((savedProperty) => (
                    <PropertyCard
                      key={savedProperty.id}
                      property={{ ...savedProperty.property, isSaved: true }}
                      onViewDetails={handlePropertyClick}
                    />
                  ))}
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-12 sm:py-16 lg:py-20">
                <div className="bg-red-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Aún no tienes propiedades favoritas
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                  Explora nuestro catálogo de propiedades y guarda las que más te interesen haciendo clic en el corazón.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                  <Button onClick={() => setLocation("/propiedades")} size="lg" className="w-full sm:w-auto">
                    Explorar Propiedades
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation("/dashboard")} 
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Ir al Dashboard
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
