import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, TrendingUp, Headphones } from "lucide-react";
import brandingImage from "@assets/77ac89ee4c464f16aa9189f5fcaa5bb77a5ac9fb6a514a00ac2579ac502f97df-md_1752164521536.png";

export default function LandingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to dashboard when they click login or access protected routes
  // But let them see the landing page to logout or learn more

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900">Tu Casa en Subasta</span>
            </div>
            {user ? (
              <Link href="/dashboard">
                <Button variant="default" size="lg">
                  Ir al Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant="default" size="lg">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      {/* Hero Section with Branding Image */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={brandingImage} 
            alt="Tu Casa en Subasta - Profesional Inmobiliario" 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Encuentra tu Casa Ideal con
                <span className="text-primary block">Descuentos hasta 90%</span>
              </h1>
              <p className="text-xl mb-8 text-gray-200 leading-relaxed">
                Accede a propiedades exclusivas en subasta en Estados Unidos. 
                Invierte inteligentemente con nuestro análisis profesional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 text-lg">
                    Comenzar Ahora
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
                >
                  Ver Demo
                </Button>
              </div>
            </div>
            
            <div className="relative z-10">
              <Card className="transform hover:scale-105 transition-transform duration-300 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-4 rounded-lg mb-4">
                    <div className="text-3xl font-bold">90%</div>
                    <div className="text-sm opacity-90">Descuento Máximo</div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Casa en Miami, FL</h3>
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
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Análisis de Inversión</h3>
                <p className="text-gray-600">
                  Obtén análisis detallados de ROI, cap rate y valor de mercado para tomar decisiones informadas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Headphones className="h-8 w-8 text-primary" />
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
      {/* Professional Team Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Respaldados por Expertos en Bienes Raíces
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Nuestro equipo de profesionales en bienes raíces te acompaña en cada paso del proceso de inversión. 
                Con años de experiencia en el mercado de subastas inmobiliarias, te ayudamos a identificar las mejores oportunidades 
                y tomar decisiones informadas que maximicen tu retorno de inversión.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">15+</div>
                  <div className="text-gray-600">Años de experiencia</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">2,500+</div>
                  <div className="text-gray-600">Inversores satisfechos</div>
                </div>
              </div>
              <Link href="/kevin">
                <Button size="lg" className="px-8">
                  Conoce a Kevin
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src={brandingImage} 
                  alt="Equipo profesional de Tu Casa en Subasta" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
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
