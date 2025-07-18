import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Shield, Users, Home } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  adminUsers: number;
  regularUsers: number;
}

export default function AdminPanel() {
  const { isAdmin } = useAuth();

  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Acceso Restringido
        </h2>
        <p className="text-gray-600">
          No tienes permisos de administrador para ver esta página.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const adminStatsData = [
    {
      label: "Total Usuarios",
      value: stats?.totalUsers || 0,
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Usuarios registrados"
    },
    {
      label: "Administradores",
      value: stats?.adminUsers || 0,
      icon: Shield,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Usuarios con rol admin"
    },
    {
      label: "Usuarios Regulares",
      value: stats?.regularUsers || 0,
      icon: Users,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      description: "Usuarios normales"
    },
    {
      label: "Total Propiedades",
      value: stats?.totalProperties || 0,
      icon: Home,
      iconBg: "bg-orange-50",
      iconColor: "text-primary",
      description: "Propiedades en la plataforma"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Panel de Administración
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gestiona usuarios y supervisa la plataforma
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Administrador
        </Badge>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {adminStatsData.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.iconBg} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <span className="text-xs sm:text-sm text-gray-600 truncate">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones de Administrador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Gestionar Usuarios</div>
                <div className="text-sm text-gray-500">Ver y editar usuarios</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Agregar Propiedades</div>
                <div className="text-sm text-gray-500">Añadir nuevas propiedades</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Reportes</div>
                <div className="text-sm text-gray-500">Ver estadísticas detalladas</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}