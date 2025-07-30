import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCw, Clock, Database, CheckCircle, XCircle, Info } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminSync() {
  const [syncProgress, setSyncProgress] = useState(0);
  const queryClient = useQueryClient();

  // Get sync status
  const { data: syncStatus, isLoading } = useQuery({
    queryKey: ['/api/admin/sync/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Manual sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      setSyncProgress(10);
      const response = await apiRequest({
        method: 'POST',
        url: '/api/admin/sync/trigger'
      });
      setSyncProgress(100);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sync/status'] });
      setTimeout(() => setSyncProgress(0), 2000);
    },
    onError: () => {
      setSyncProgress(0);
    }
  });

  const handleManualSync = () => {
    syncMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  const recentSyncs = (syncStatus as any)?.recentSyncs || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Sincronización de Datos</h1>
        <p className="text-gray-600 mt-2">
          Gestiona la sincronización de propiedades con ATTOM Data API
        </p>
      </div>

      {/* Sync Controls */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Manual Sync Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-orange-500" />
              Sincronización Manual
            </CardTitle>
            <CardDescription>
              Ejecuta una sincronización inmediata de datos de propiedades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {syncProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso</span>
                  <span>{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} className="w-full" />
              </div>
            )}
            
            <Button 
              onClick={handleManualSync}
              disabled={syncMutation.isPending}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {syncMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Iniciar Sincronización
                </>
              )}
            </Button>

            {syncMutation.isSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {(syncMutation.data as any)?.message || 'Sincronización completada exitosamente'}
                </AlertDescription>
              </Alert>
            )}

            {syncMutation.isError && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Error durante la sincronización. Revise los logs para más detalles.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Sync Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Sincronización Programada
            </CardTitle>
            <CardDescription>
              Configuración de sincronización automática
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estado</span>
              <Badge variant={(syncStatus as any)?.isScheduledSyncEnabled ? "default" : "secondary"}>
                {(syncStatus as any)?.isScheduledSyncEnabled ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Próxima ejecución</span>
              <span className="text-sm text-gray-600">
                {(syncStatus as any)?.nextScheduledSync || "No programada"}
              </span>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                La sincronización automática se ejecuta diariamente a las 2:00 AM para actualizar las propiedades con datos recientes de ATTOM Data.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Recent Syncs History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-500" />
            Historial de Sincronizaciones
          </CardTitle>
          <CardDescription>
            Últimas 10 sincronizaciones ejecutadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentSyncs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay sincronizaciones recientes</p>
              <p className="text-sm">Ejecuta una sincronización manual para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSyncs.map((sync: any) => (
                <div key={sync.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={sync.errors > 0 ? "destructive" : "default"}>
                        {sync.type}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {format(new Date(sync.createdAt), "dd MMM yyyy HH:mm")}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {sync.added} agregadas • {sync.updated} actualizadas • {sync.totalProcessed} procesadas
                      {sync.errors > 0 && (
                        <span className="text-red-600 ml-2">• {sync.errors} errores</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sync.errors > 0 ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Notas Importantes</CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700 space-y-2">
          <p>• <strong>API Key:</strong> Asegúrate de que ATTOM_API_KEY esté configurada correctamente.</p>
          <p>• <strong>Imágenes:</strong> Las imágenes de propiedades se generan usando Google Street View API.</p>
          <p>• <strong>Límites:</strong> La sincronización procesa máximo 500 propiedades por ejecución.</p>
          <p>• <strong>Frecuencia:</strong> No ejecutes sincronizaciones manuales muy frecuentemente para evitar límites de API.</p>
        </CardContent>
      </Card>
    </div>
  );
}