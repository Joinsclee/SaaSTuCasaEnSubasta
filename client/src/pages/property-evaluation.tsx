import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle, XCircle, Star, Info, Home, AlertCircle, FileText, DollarSign, MapPin, Users, Search, Trash2 } from 'lucide-react';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { PropertyEvaluation, InsertPropertyEvaluation } from '@shared/schema';

interface PropertyData {
  address: string;
  price: string;
  location: string;
  accessibility: string;
  demographics: string;
  inspection: string;
  ownerMatch: boolean | null;
  loansMatch: boolean | null;
  isHouse: boolean | null;
  maxOffer: string;
  score: number;
}

export default function PropertyEvaluationPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    address: '',
    price: '',
    location: '',
    accessibility: '',
    demographics: '',
    inspection: '',
    ownerMatch: null,
    loansMatch: null,
    isHouse: null,
    maxOffer: '',
    score: 0
  });

  // Queries and mutations
  const { data: evaluations = [], isLoading } = useQuery<PropertyEvaluation[]>({
    queryKey: ["/api/evaluations"],
  });

  const createEvaluationMutation = useMutation({
    mutationFn: async (evaluationData: InsertPropertyEvaluation) => {
      const res = await apiRequest("POST", "/api/evaluations", evaluationData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluations"] });
      toast({
        title: "¡Evaluación guardada!",
        description: "La evaluación de la propiedad se ha guardado exitosamente.",
      });
      resetEvaluation();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEvaluationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/evaluations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluations"] });
      toast({
        title: "Evaluación eliminada",
        description: "La evaluación ha sido eliminada correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateScore = () => {
    let score = 0;
    if (propertyData.price && parseInt(propertyData.price) < 100000) score++;
    if (propertyData.location === 'excellent') score++;
    if (propertyData.accessibility === 'easy') score++;
    if (propertyData.demographics === 'growing') score++;
    if (propertyData.inspection === 'good') score++;
    return score;
  };

  const handleSuperficialEvaluation = () => {
    const score = calculateScore();
    setPropertyData({...propertyData, score});
    
    if (score >= 3) {
      setCurrentStep(2);
    } else {
      toast({
        title: "Evaluación insuficiente",
        description: "Esta propiedad no cumple con los criterios mínimos. Se recomienda buscar otra.",
        variant: "destructive",
      });
      resetEvaluation();
    }
  };

  const handleDeepInvestigation = () => {
    if (propertyData.ownerMatch && propertyData.loansMatch && propertyData.isHouse) {
      setCurrentStep(3);
    } else {
      toast({
        title: "Investigación fallida",
        description: "La investigación profunda reveló problemas. Se recomienda descartar esta propiedad.",
        variant: "destructive",
      });
      resetEvaluation();
    }
  };

  const saveEvaluation = () => {
    const evaluation: InsertPropertyEvaluation = {
      address: propertyData.address,
      price: parseInt(propertyData.price),
      location: propertyData.location,
      accessibility: propertyData.accessibility,
      demographics: propertyData.demographics,
      inspection: propertyData.inspection,
      ownerMatch: propertyData.ownerMatch,
      loansMatch: propertyData.loansMatch,
      isHouse: propertyData.isHouse,
      maxOffer: parseInt(propertyData.maxOffer),
      score: 5,
      status: 'completed'
    };
    
    createEvaluationMutation.mutate(evaluation);
  };

  const resetEvaluation = () => {
    setCurrentStep(1);
    setPropertyData({
      address: '',
      price: '',
      location: '',
      accessibility: '',
      demographics: '',
      inspection: '',
      ownerMatch: null,
      loansMatch: null,
      isHouse: null,
      maxOffer: '',
      score: 0
    });
  };

  const handleDeleteEvaluation = (id: number) => {
    deleteEvaluationMutation.mutate(id);
  };

  const InfoTooltip = ({ id, content }: { id: string; content: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-4 h-4 text-primary cursor-help ml-2" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm max-w-64">{content}</p>
      </TooltipContent>
    </Tooltip>
  );

  const StarRating = ({ score }: { score: number }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= score ? 'fill-primary text-primary' : 'text-gray-300'}`}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{score}/5</span>
    </div>
  );

  const isStep1Complete = propertyData.address && 
                          propertyData.price && 
                          propertyData.location && 
                          propertyData.accessibility && 
                          propertyData.demographics && 
                          propertyData.inspection;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sistema de Evaluación</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Evalúa propiedades antes de hacer ofertas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</div>
                <span className="font-medium text-sm sm:text-base">Investigación Superficial</span>
              </div>
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</div>
                <span className="font-medium text-sm sm:text-base">Investigación Profunda</span>
              </div>
              <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>3</div>
                <span className="font-medium text-sm sm:text-base">Oferta Final</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`bg-primary h-2 rounded-full transition-all duration-300`} style={{width: `${(currentStep / 3) * 100}%`}}></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Evaluation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4 sm:p-6">
                {/* Step 1: Investigación Superficial */}
                {currentStep === 1 && (
                  <div>
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="flex items-center text-lg sm:text-xl">
                        <Search className="w-5 w-6 h-5 sm:h-6 mr-2 text-primary" />
                        Investigación Superficial
                      </CardTitle>
                    </CardHeader>
                    
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dirección de la Propiedad
                        </label>
                        <Input
                          type="text"
                          value={propertyData.address}
                          onChange={(e) => setPropertyData({...propertyData, address: e.target.value})}
                          placeholder="123 Main St, Ciudad, Estado"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Precio de Subasta
                            <InfoTooltip id="price" content="Busca propiedades con precio menor al 50% del valor de mercado" />
                          </div>
                        </label>
                        <Input
                          type="number"
                          value={propertyData.price}
                          onChange={(e) => setPropertyData({...propertyData, price: e.target.value})}
                          placeholder="$0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            Ubicación
                            <InfoTooltip id="location" content="Evalúa el potencial del vecindario y proximidad a servicios" />
                          </div>
                        </label>
                        <Select value={propertyData.location} onValueChange={(value) => setPropertyData({...propertyData, location: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excelente - Zona A</SelectItem>
                            <SelectItem value="good">Buena - Zona B</SelectItem>
                            <SelectItem value="regular">Regular - Zona C</SelectItem>
                            <SelectItem value="poor">Mala - Zona D</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center">
                            Facilidad de Acceso
                            <InfoTooltip id="access" content="¿Es fácil llegar a la propiedad? ¿Hay transporte público?" />
                          </div>
                        </label>
                        <Select value={propertyData.accessibility} onValueChange={(value) => setPropertyData({...propertyData, accessibility: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Fácil acceso</SelectItem>
                            <SelectItem value="moderate">Acceso moderado</SelectItem>
                            <SelectItem value="difficult">Difícil acceso</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            Demografía
                            <InfoTooltip id="demo" content="Evalúa el crecimiento poblacional y económico de la zona" />
                          </div>
                        </label>
                        <Select value={propertyData.demographics} onValueChange={(value) => setPropertyData({...propertyData, demographics: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="growing">En crecimiento</SelectItem>
                            <SelectItem value="stable">Estable</SelectItem>
                            <SelectItem value="declining">En declive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Inspección Visual Preliminar
                        </label>
                        <Select value={propertyData.inspection} onValueChange={(value) => setPropertyData({...propertyData, inspection: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="good">Buena condición</SelectItem>
                            <SelectItem value="needs-work">Necesita trabajo</SelectItem>
                            <SelectItem value="poor">Mala condición</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleSuperficialEvaluation}
                        className="w-full"
                        disabled={!isStep1Complete}
                      >
                        Evaluar Propiedad
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Investigación Profunda */}
                {currentStep === 2 && (
                  <div>
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="flex items-center text-lg sm:text-xl">
                        <FileText className="w-5 w-6 h-5 sm:h-6 mr-2 text-primary" />
                        Investigación Profunda
                      </CardTitle>
                    </CardHeader>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <p className="text-green-800 font-medium">¡Excelente! La propiedad pasó la evaluación inicial.</p>
                      <div className="mt-2">
                        <StarRating score={propertyData.score} />
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          ¿El propietario registrado coincide con la información de la subasta?
                        </label>
                        <div className="flex gap-4">
                          <Button
                            variant={propertyData.ownerMatch === true ? "default" : "outline"}
                            onClick={() => setPropertyData({...propertyData, ownerMatch: true})}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Sí coincide
                          </Button>
                          <Button
                            variant={propertyData.ownerMatch === false ? "default" : "outline"}
                            onClick={() => setPropertyData({...propertyData, ownerMatch: false})}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            No coincide
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          ¿Los préstamos/hipotecas están claramente definidos?
                        </label>
                        <div className="flex gap-4">
                          <Button
                            variant={propertyData.loansMatch === true ? "default" : "outline"}
                            onClick={() => setPropertyData({...propertyData, loansMatch: true})}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Sí están claros
                          </Button>
                          <Button
                            variant={propertyData.loansMatch === false ? "default" : "outline"}
                            onClick={() => setPropertyData({...propertyData, loansMatch: false})}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            No están claros
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          ¿Es una casa unifamiliar?
                        </label>
                        <div className="flex gap-4">
                          <Button
                            variant={propertyData.isHouse === true ? "default" : "outline"}
                            onClick={() => setPropertyData({...propertyData, isHouse: true})}
                          >
                            <Home className="w-4 h-4 mr-2" />
                            Sí es casa
                          </Button>
                          <Button
                            variant={propertyData.isHouse === false ? "default" : "outline"}
                            onClick={() => setPropertyData({...propertyData, isHouse: false})}
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            No es casa
                          </Button>
                        </div>
                      </div>

                      <Button
                        onClick={handleDeepInvestigation}
                        className="w-full"
                        disabled={propertyData.ownerMatch === null || propertyData.loansMatch === null || propertyData.isHouse === null}
                      >
                        Continuar Investigación
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Oferta Final */}
                {currentStep === 3 && (
                  <div>
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="flex items-center text-lg sm:text-xl">
                        <DollarSign className="w-5 w-6 h-5 sm:h-6 mr-2 text-primary" />
                        Calcular Oferta Máxima
                      </CardTitle>
                    </CardHeader>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <p className="text-green-800 font-medium">¡Perfecta! Esta propiedad cumple todos los criterios.</p>
                      <div className="mt-2">
                        <StarRating score={5} />
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Oferta Máxima Recomendada
                        </label>
                        <Input
                          type="number"
                          value={propertyData.maxOffer}
                          onChange={(e) => setPropertyData({...propertyData, maxOffer: e.target.value})}
                          placeholder="$0"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button
                          onClick={saveEvaluation}
                          disabled={!propertyData.maxOffer || createEvaluationMutation.isPending}
                        >
                          {createEvaluationMutation.isPending ? 'Guardando...' : 'Guardar Evaluación'}
                        </Button>
                        <Button variant="outline" onClick={resetEvaluation}>
                          Nueva Evaluación
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Property Info */}
            {propertyData.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Propiedad Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Dirección:</span> {propertyData.address}</p>
                    <p><span className="font-medium">Precio:</span> ${parseInt(propertyData.price || '0').toLocaleString()}</p>
                    {propertyData.score > 0 && (
                      <div>
                        <span className="font-medium">Puntuación:</span>
                        <div className="mt-1">
                          <StarRating score={propertyData.score} />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Evaluation History */}
            {!isLoading && evaluations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historial de Evaluaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {evaluations.slice(0, 5).map((evaluation) => (
                      <div key={evaluation.id} className="border-b pb-3 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{evaluation.address}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(evaluation.createdAt).toLocaleDateString('es-ES')}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <StarRating score={evaluation.score} />
                              {evaluation.maxOffer && (
                                <Badge variant="secondary">${evaluation.maxOffer.toLocaleString()}</Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvaluation(evaluation.id)}
                            disabled={deleteEvaluationMutation.isPending}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading skeleton for history */}
            {isLoading && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historial de Evaluaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border-b pb-3 last:border-b-0">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-20 mb-2" />
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-5 w-12" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consejos de Kevin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p>Siempre verifica la información del propietario antes de ofertar.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p>Las propiedades en zonas en crecimiento tienen mejor potencial de apreciación.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p>No ofertes más del 70% del valor de mercado estimado.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}