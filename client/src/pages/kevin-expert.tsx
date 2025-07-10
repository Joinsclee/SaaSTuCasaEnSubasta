import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Award, TrendingUp, Users } from "lucide-react";
import brandingImage from "@assets/77ac89ee4c464f16aa9189f5fcaa5bb77a5ac9fb6a514a00ac2579ac502f97df-md_1752164521536.png";

export default function KevinExpertPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Inicio</span>
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="default" size="lg">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Kevin Expert Profile */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  Experto Principal
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Conoce a Kevin
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Experto en bienes raíces con más de 15 años de experiencia en el mercado de subastas inmobiliarias. 
                  Kevin es quien evalúa cada propiedad en nuestra plataforma y determina las oportunidades de compra 
                  que ves representadas en las estrellas de calificación.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Award className="h-6 w-6 text-primary mr-2" />
                      <span className="text-2xl font-bold text-gray-900">15+</span>
                    </div>
                    <div className="text-gray-600">Años de experiencia</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-6 w-6 text-primary mr-2" />
                      <span className="text-2xl font-bold text-gray-900">2,500+</span>
                    </div>
                    <div className="text-gray-600">Propiedades evaluadas</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={brandingImage} 
                    alt="Kevin - Experto en Bienes Raíces de Tu Casa en Subasta" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Expertise Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Sistema de Evaluación</h3>
                  <p className="text-gray-600">
                    Kevin desarrolló nuestro sistema único de calificación por estrellas que evalúa cada propiedad 
                    basándose en potencial de inversión, ubicación y oportunidad de mercado.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Análisis de Mercado</h3>
                  <p className="text-gray-600">
                    Con su experiencia, Kevin identifica las mejores oportunidades de inversión y 
                    proporciona análisis detallados de ROI y potencial de crecimiento.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Asesoría Personalizada</h3>
                  <p className="text-gray-600">
                    Kevin y su equipo están disponibles para brindar asesoría personalizada 
                    y guiar a nuestros usuarios en sus decisiones de inversión.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comienza a Invertir con la Guía de Kevin
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Accede a las evaluaciones expertas de Kevin y descubre las mejores oportunidades 
                de inversión en el mercado de subastas inmobiliarias.
              </p>
              <Link href="/auth">
                <Button size="lg" className="px-8 py-4 text-lg">
                  Crear Cuenta y Comenzar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}