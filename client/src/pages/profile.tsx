import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Crown, CreditCard, Settings } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    newPassword: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const updateData: any = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
      };

      // Only include password if it's provided
      if (data.newPassword.trim()) {
        updateData.password = data.newPassword;
      }

      const res = await apiRequest("PATCH", "/api/user", updateData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setFormData(prev => ({ ...prev, newPassword: "" }));
      toast({
        title: "Perfil actualizado",
        description: "Tu información se ha guardado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const getSubscriptionDaysRemaining = () => {
    if (!user?.subscriptionExpiresAt) return 0;
    const expiryDate = new Date(user.subscriptionExpiresAt);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500">Cargando información del usuario...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          </div>
          <p className="text-gray-600">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Opcional"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Dejar en blanco para no cambiar"
                    />
                  </div>
                  
                  {/* Account Info (Read-only) */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Cuenta</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Usuario:</span>
                        <span className="ml-2 font-medium">{user.username}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Miembro desde:</span>
                        <span className="ml-2 font-medium">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          {/* Subscription Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-800">
                  <Crown className="h-5 w-5 mr-2" />
                  Plan de Suscripción
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge variant="secondary" className="bg-purple-600 text-white text-lg px-4 py-2">
                    {user.subscriptionType?.toUpperCase() || "FREE"}
                  </Badge>
                  <div className="text-sm text-gray-600 mt-2">Plan Actual</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {getSubscriptionDaysRemaining()}
                  </div>
                  <div className="text-sm text-gray-600">Días Restantes</div>
                </div>
                
                {user.subscriptionExpiresAt && (
                  <div className="border-t border-purple-200 pt-4">
                    <div className="text-sm text-gray-600 mb-1">Próxima Renovación:</div>
                    <div className="font-medium text-gray-900">
                      {formatDate(user.subscriptionExpiresAt)}
                    </div>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Gestionar Facturación
                </Button>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-gray-900">Estadísticas de Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Propiedades Vistas:</span>
                  <span className="font-bold">147</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Favoritos Guardados:</span>
                  <span className="font-bold">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reportes Descargados:</span>
                  <span className="font-bold">5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
