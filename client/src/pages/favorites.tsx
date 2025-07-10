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
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
          </div>
          <p className="text-gray-600">
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <div className="text-center py-20">
                <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Aún no tienes propiedades favoritas
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Explora nuestro catálogo de propiedades y guarda las que más te interesen haciendo clic en el corazón.
                </p>
                <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                  <Button onClick={() => setLocation("/propiedades")} size="lg">
                    Explorar Propiedades
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation("/dashboard")} 
                    size="lg"
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
