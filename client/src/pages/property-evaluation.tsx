import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { CheckCircle, XCircle, Star, Info, Home, AlertCircle, FileText, DollarSign, MapPin, Users, Search, Trash2, X, Download } from 'lucide-react';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { PropertyEvaluation, InsertPropertyEvaluation } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

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
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showProblemsDialog, setShowProblemsDialog] = useState(false);
  const [detectedProblems, setDetectedProblems] = useState<string[]>([]);
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

  // Function to download evaluations as Excel with formatting
  const downloadEvaluationsExcel = () => {
    if (!evaluations.length) return;
    
    // Create headers with puntuación at the end
    const headers = [
      'Fecha',
      'Dirección',
      'Precio de Subasta',
      'Oferta Máxima',
      'Ubicación',
      'Accesibilidad',
      'Demografía',
      'Inspección',
      'Propietario Coincide',
      'Préstamos Claros',
      'Es Casa Unifamiliar',
      'Puntuación ⭐' // Moved to the end with star emoji to highlight
    ];
    
    // Convert evaluations to Excel rows with puntuación at the end
    const excelData = evaluations.map(evaluation => [
      new Date(evaluation.createdAt).toLocaleDateString('es-ES'),
      evaluation.address,
      evaluation.price || 0,
      evaluation.maxOffer || 0,
      evaluation.location || '',
      evaluation.accessibility || '',
      evaluation.demographics || '',
      evaluation.inspection || '',
      evaluation.ownerMatch ? 'Sí' : evaluation.ownerMatch === false ? 'No' : 'N/A',
      evaluation.loansMatch ? 'Sí' : evaluation.loansMatch === false ? 'No' : 'N/A',
      evaluation.isHouse ? 'Sí' : evaluation.isHouse === false ? 'No' : 'N/A',
      `${evaluation.score}/5 ⭐` // Puntuación at the end with visual formatting
    ]);
    
    // Create worksheet with proper structure
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData]);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 12 }, // Fecha
      { wch: 35 }, // Dirección
      { wch: 18 }, // Precio de Subasta
      { wch: 15 }, // Oferta Máxima
      { wch: 15 }, // Ubicación
      { wch: 18 }, // Accesibilidad
      { wch: 15 }, // Demografía
      { wch: 15 }, // Inspección
      { wch: 20 }, // Propietario Coincide
      { wch: 18 }, // Préstamos Claros
      { wch: 20 }, // Es Casa Unifamiliar
      { wch: 18 }  // Puntuación - wider for the star
    ];
    worksheet['!cols'] = columnWidths;
    
    // Create a more compatible approach for highlighting
    // We'll make the puntuación column data more visually distinctive
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Style the header row
    for (let col = 0; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        // Make all headers bold and add special formatting to puntuación column
        worksheet[cellAddress].s = {
          font: { 
            bold: true,
            color: col === 11 ? { rgb: "2E7D32" } : { rgb: "000000" } // Green text for puntuación header
          },
          alignment: { horizontal: "center" }
        };
      }
    }
    
    // Add formatting note as a comment in the first cell
    if (!worksheet['A1'].c) worksheet['A1'].c = [];
    worksheet['A1'].c.push({
      a: "Sistema",
      t: "La columna 'Puntuación ⭐' está destacada con formato especial y ubicada al final para fácil identificación.",
      r: '<r><rPr><sz val="11"/><color theme="1"/><rFont val="Calibri"/><family val="2"/><scheme val="minor"/></rPr><t>La columna \'Puntuación ⭐\' está destacada con formato especial y ubicada al final para fácil identificación.</t></r>'
    });
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Evaluaciones');
    
    // Add workbook properties
    workbook.Props = {
      Title: "Evaluaciones de Propiedades - Tu Casa en Subasta",
      Subject: "Reporte de evaluaciones",
      Author: user?.username || "Usuario",
      CreatedDate: new Date()
    };
    
    // Download the file
    XLSX.writeFile(workbook, `evaluaciones_propiedades_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Excel descargado",
      description: `Archivo Excel con ${evaluations.length} evaluaciones. La columna Puntuación ⭐ está al final destacada.`,
    });
  };

  // Function to download evaluations as PDF
  const downloadEvaluationsPDF = () => {
    if (!evaluations.length) return;
    
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('es-ES');
    let yPosition = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(255, 136, 39); // Orange color
    doc.text('Tu Casa en Subasta', 14, yPosition);
    
    yPosition += 12;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Reporte de Evaluaciones de Propiedades', 14, yPosition);
    
    // User info and date
    yPosition += 12;
    doc.setFontSize(12);
    doc.text(`Usuario: ${user?.username || 'Usuario'}`, 14, yPosition);
    yPosition += 8;
    doc.text(`Fecha: ${currentDate}`, 14, yPosition);
    yPosition += 8;
    doc.text(`Total de evaluaciones: ${evaluations.length}`, 14, yPosition);
    
    // Summary statistics
    yPosition += 15;
    doc.setFontSize(14);
    doc.text('Resumen Estadístico:', 14, yPosition);
    
    const avgScore = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;
    const totalInvestment = evaluations.reduce((sum, e) => sum + (e.maxOffer || 0), 0);
    const approved = evaluations.filter(e => e.score >= 3).length;
    
    yPosition += 10;
    doc.setFontSize(11);
    doc.text(`• Puntuación promedio: ${avgScore.toFixed(1)}/5`, 14, yPosition);
    yPosition += 8;
    doc.text(`• Propiedades aprobadas: ${approved} de ${evaluations.length} (${((approved/evaluations.length)*100).toFixed(1)}%)`, 14, yPosition);
    yPosition += 8;
    doc.text(`• Inversión total planeada: $${totalInvestment.toLocaleString()}`, 14, yPosition);
    
    // Property details
    yPosition += 15;
    doc.setFontSize(14);
    doc.text('Detalle de Evaluaciones:', 14, yPosition);
    
    evaluations.forEach((evaluation, index) => {
      yPosition += 12;
      
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(255, 136, 39);
      doc.text(`${index + 1}. ${evaluation.address}`, 14, yPosition);
      
      yPosition += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Fecha: ${new Date(evaluation.createdAt).toLocaleDateString('es-ES')}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Precio de subasta: $${(evaluation.price || 0).toLocaleString()}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Oferta máxima: $${(evaluation.maxOffer || 0).toLocaleString()}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Puntuación: ${evaluation.score}/5`, 20, yPosition);
      yPosition += 6;
      doc.text(`Ubicación: ${evaluation.location || 'N/A'}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Accesibilidad: ${evaluation.accessibility || 'N/A'}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Demografía: ${evaluation.demographics || 'N/A'}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Inspección: ${evaluation.inspection || 'N/A'}`, 20, yPosition);
    });
    
    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Página ${i} de ${pageCount} - Generado por Tu Casa en Subasta`, 14, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save(`evaluaciones_propiedades_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF generado",
      description: `Se ha descargado el reporte PDF con ${evaluations.length} evaluaciones.`,
    });
  };

  const calculateScore = () => {
    let score = 0;
    let details = [];
    
    // Criterio 1: Precio accesible (menos de $200,000 o buena relación precio/mercado)
    if (propertyData.price && parseInt(propertyData.price) < 200000) {
      score++;
      details.push("✓ Precio accesible");
    } else {
      details.push("✗ Precio muy alto");
    }
    
    // Criterio 2: Ubicación (excelente o buena)
    if (propertyData.location === 'excellent' || propertyData.location === 'good') {
      score++;
      details.push("✓ Buena ubicación");
    } else {
      details.push("✗ Ubicación problemática");
    }
    
    // Criterio 3: Accesibilidad (fácil o moderada)
    if (propertyData.accessibility === 'easy' || propertyData.accessibility === 'moderate') {
      score++;
      details.push("✓ Acceso viable");
    } else {
      details.push("✗ Acceso difícil");
    }
    
    // Criterio 4: Demografía (en crecimiento o estable)
    if (propertyData.demographics === 'growing' || propertyData.demographics === 'stable') {
      score++;
      details.push("✓ Demografía favorable");
    } else {
      details.push("✗ Demografía en declive");
    }
    
    // Criterio 5: Condición (buena o necesita trabajo menor)
    if (propertyData.inspection === 'good' || propertyData.inspection === 'needs-work') {
      score++;
      details.push("✓ Condición aceptable");
    } else {
      details.push("✗ Condición muy mala");
    }
    
    return { score, details };
  };

  const handleSuperficialEvaluation = () => {
    const evaluation = calculateScore();
    setPropertyData({...propertyData, score: evaluation.score});
    
    // Ahora solo necesita 3 de 5 criterios para pasar (60% de aprobación)
    if (evaluation.score >= 3) {
      setCurrentStep(2);
      toast({
        title: "¡Evaluación aprobada!",
        description: `Puntuación: ${evaluation.score}/5. La propiedad cumple con los criterios mínimos.`,
      });
    } else {
      toast({
        title: "Evaluación insuficiente",
        description: `Puntuación: ${evaluation.score}/5. Se necesitan al menos 3 criterios aprobados para continuar.`,
        variant: "destructive",
      });
    }
  };

  const handleDeepInvestigation = () => {
    if (propertyData.ownerMatch && propertyData.loansMatch && propertyData.isHouse) {
      setCurrentStep(3);
      toast({
        title: "¡Investigación exitosa!",
        description: "Todos los aspectos legales están en orden. Puedes proceder con la oferta.",
      });
    } else {
      // Recopilar problemas encontrados
      const problemsFound = [];
      if (!propertyData.ownerMatch) problemsFound.push("Propietario no coincide");
      if (!propertyData.loansMatch) problemsFound.push("Préstamos no claros");
      if (!propertyData.isHouse) problemsFound.push("No es casa unifamiliar");
      
      // Mostrar diálogo personalizado dentro de la aplicación
      setDetectedProblems(problemsFound);
      setShowProblemsDialog(true);
    }
  };

  const handleContinueWithRisk = () => {
    setShowProblemsDialog(false);
    setCurrentStep(3);
    toast({
      title: "Continuando evaluación",
      description: "⚠️ Procedes bajo tu propio riesgo. Kevin no recomienda esta propiedad.",
      variant: "destructive",
    });
  };

  const handleDiscardProperty = () => {
    setShowProblemsDialog(false);
    toast({
      title: "Evaluación descartada",
      description: "Decisión inteligente. Busquemos una propiedad más segura.",
    });
    resetEvaluation();
  };

  const saveEvaluation = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para guardar evaluaciones.",
        variant: "destructive",
      });
      return;
    }

    const evaluation: InsertPropertyEvaluation = {
      userId: user.id,
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
      score: propertyData.score, // Usar el score real calculado
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
        {/* Modal de Problemas Detectados */}
        <Dialog open={showProblemsDialog} onOpenChange={setShowProblemsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Investigación Profunda
                  </DialogTitle>
                  <p className="text-sm text-red-600 font-medium">Problemas Detectados</p>
                </div>
              </div>
            </DialogHeader>
            
            <div className="py-4">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Problemas encontrados:</h4>
                <ul className="space-y-2">
                  {detectedProblems.map((problem, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      {problem}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 mb-1">Recomendación de Kevin</p>
                    <p className="text-sm text-amber-700">
                      <strong>NO continuar</strong> con esta propiedad debido a estos riesgos legales. 
                      Es mejor buscar una oportunidad más segura.
                    </p>
                  </div>
                </div>
              </div>
              
              <DialogDescription className="text-sm text-gray-600">
                ¿Quieres continuar de todos modos? (No recomendado)
              </DialogDescription>
            </div>

            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={handleDiscardProperty}
                className="flex-1"
              >
                Evaluar Otra Propiedad
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleContinueWithRisk}
                className="flex-1"
              >
                Continuar (Riesgo Alto)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                      <CardTitle className="text-lg sm:text-xl text-gray-900 mb-6">
                        Establecer Límite de Oferta
                      </CardTitle>
                    </CardHeader>
                    
                    <div className="space-y-4 sm:space-y-6">
                      {/* Success Alert */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-semibold text-green-800 mb-1">¡Propiedad aprobada para subasta!</h3>
                            <p className="text-sm text-green-700">Todos los criterios han sido verificados exitosamente.</p>
                          </div>
                        </div>
                      </div>

                      {/* 50% Rule Alert */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-800 mb-1">Recuerda la regla del 50%</h4>
                            <p className="text-sm text-blue-700">Tu oferta máxima debe ser menor al 50% del valor de mercado para garantizar rentabilidad.</p>
                          </div>
                        </div>
                      </div>

                      {/* Max Offer Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Establecer Límite Máximo de Oferta
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">$</span>
                          <Input
                            type="number"
                            placeholder="0"
                            value={propertyData.maxOffer}
                            onChange={(e) => setPropertyData({...propertyData, maxOffer: e.target.value})}
                            className="pl-8 pr-4 py-3 text-lg font-medium border-gray-300 focus:border-primary focus:ring-primary"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Precio de subasta: ${parseInt(propertyData.price || '0').toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          onClick={saveEvaluation} 
                          className="flex-1"
                          disabled={!propertyData.maxOffer || createEvaluationMutation.isPending}
                        >
                          {createEvaluationMutation.isPending ? 'Guardando...' : 'Guardar Evaluación'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={resetEvaluation}
                          className="flex-1"
                        >
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
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">Historial de Evaluaciones</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadEvaluationsExcel}
                      className="text-xs"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadEvaluationsPDF}
                      className="text-xs"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
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

            {/* Evaluation Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Criterios de Evaluación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p><strong>Precio:</strong> Menos de $200,000 para ser accesible</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p><strong>Ubicación:</strong> Zona A o B (excelente/buena)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Home className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p><strong>Acceso:</strong> Fácil o moderado para visitantes</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p><strong>Demografía:</strong> Población creciente o estable</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p><strong>Condición:</strong> Buena o con trabajo menor</p>
                  </div>
                  <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                    <p className="font-medium text-primary">Se necesitan 3 de 5 criterios para aprobar</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consejos de Kevin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p>Siempre verifica la información en múltiples fuentes antes de ofertar.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p>Prioriza propiedades en zonas con demografía en crecimiento.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p>La regla del 50%: nunca ofertes más del 50% del valor de mercado.</p>
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