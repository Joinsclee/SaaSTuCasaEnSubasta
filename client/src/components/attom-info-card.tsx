import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info, Zap, Database } from "lucide-react";

interface AttomInfoCardProps {
  source: string;
  notice?: string;
}

export default function AttomInfoCard({ source, notice }: AttomInfoCardProps) {
  const isDemo = source?.includes('Demo');
  const isEnhanced = source?.includes('Enhancement');
  
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Info className="h-5 w-5" />
          Estado de Datos ATTOM
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant={isDemo ? "secondary" : isEnhanced ? "default" : "outline"} className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {isDemo ? 'Prueba Gratuita' : isEnhanced ? 'Datos Básicos' : 'API Completa'}
          </Badge>
          <span className="text-sm text-blue-700">{source}</span>
        </div>
        
        {notice && (
          <p className="text-sm text-blue-700 bg-blue-100 p-3 rounded-md">
            {notice}
          </p>
        )}
        
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800">Prueba Gratuita Incluye:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Datos básicos de propiedades</li>
              <li>• 1,000 consultas/mes</li>
              <li>• Información de direcciones</li>
              <li>• Valores estimados</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800">Plan Completo Incluye:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Datos reales de foreclosures</li>
              <li>• Información de subastas</li>
              <li>• Contactos de trustees</li>
              <li>• Fechas exactas de subastas</li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          <Button size="sm" variant="outline" asChild>
            <a href="https://api.developer.attomdata.com/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              Portal ATTOM Data
            </a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="https://api.developer.attomdata.com/docs" target="_blank" rel="noopener noreferrer">
              <Zap className="h-4 w-4 mr-1" />
              Planes y Precios
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}