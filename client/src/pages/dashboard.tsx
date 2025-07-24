import Header from "@/components/header";
import DashboardStats from "@/components/dashboard-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Target, Star } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Dashboard Stats */}
        <div className="mb-6 sm:mb-8">
          <DashboardStats />
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Bienvenido a Tu Casa en Subasta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Descubre las mejores oportunidades de inversión en propiedades en subasta con descuentos de hasta 90%.
                Utiliza las herramientas de evaluación de Kevin para tomar decisiones informadas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setLocation('/propiedades')}
                  className="h-auto p-6 flex flex-col items-center gap-3"
                >
                  <BarChart3 className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold">Explorar Propiedades</div>
                    <div className="text-sm opacity-90">Busca y filtra propiedades</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/evaluacion')}
                  className="h-auto p-6 flex flex-col items-center gap-3"
                >
                  <Target className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold">Evaluar Propiedad</div>
                    <div className="text-sm opacity-70">Sistema de Kevin</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/favoritos')}
                  className="h-auto p-6 flex flex-col items-center gap-3"
                >
                  <Star className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold">Mis Favoritos</div>
                    <div className="text-sm opacity-70">Propiedades guardadas</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Consejos de Inversión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Utiliza el sistema de evaluación de Kevin antes de hacer ofertas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Busca propiedades con descuentos superiores al 60%
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Revisa el historial de precios del mercado local
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Considera los costos de renovación en tu análisis
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Próximas Características
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Notificaciones de nuevas subastas en tu área
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Análisis automático de ROI y cap rate
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Comparación de propiedades similares
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Calculadora de financiamiento
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}