import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, TrendingUp, Headphones } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to dashboard
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">Tu Casa en Subasta</span>
          </div>
          <Link href="/auth">
            <Button variant="secondary" size="lg">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Encuentra tu Casa Ideal con
              <span className="text-yellow-300 block">Descuentos hasta 70%</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Accede a propiedades exclusivas en subasta en Estados Unidos. 
              Invierte inteligentemente con nuestro análisis profesional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Comenzar Ahora
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                Ver Demo
              </Button>
            </div>
          </div>
          <div className="relative">
            <Card className="transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg mb-4">
                  <div className="text-3xl font-bold">70%</div>
                  <div className="text-sm">Descuento Máximo</div>
                </div>
                <h3 className="font-bold text-lg mb-2">Casa en Miami, FL</h3>
                <p className="text-gray-600 mb-4">3 hab • 2 baños • 1,850 sqft</p>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">$89,500</div>
                    <div className="text-sm text-gray-500 line-through">$235,000</div>
                  </div>
                  <div className="text-green-600 font-bold">Ahorras $145,500</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Tu Casa en Subasta?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Te ofrecemos las mejores oportunidades de inversión inmobiliaria con análisis profesional y soporte completo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Búsqueda Avanzada</h3>
                <p className="text-gray-600">
                  Filtra por ubicación, precio, tipo de subasta y más para encontrar exactamente lo que buscas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Análisis de Inversión</h3>
                <p className="text-gray-600">
                  Obtén análisis detallados de ROI, cap rate y valor de mercado para tomar decisiones informadas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Headphones className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Soporte Experto</h3>
                <p className="text-gray-600">
                  Nuestro equipo de expertos te guía en todo el proceso de compra en subastas inmobiliarias.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comienza tu Inversión Inmobiliaria Hoy
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete a miles de inversionistas que ya están aprovechando estas oportunidades únicas.
          </p>
          <Link href="/auth">
            <Button size="lg" className="px-8">
              Crear Cuenta Gratuita
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
