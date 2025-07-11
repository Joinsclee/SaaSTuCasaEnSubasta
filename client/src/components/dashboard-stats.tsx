import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Heart, Percent, Crown } from "lucide-react";

interface DashboardStats {
  propertiesViewed: number;
  savedProperties: number;
  averageDiscount: number;
  subscriptionDaysRemaining: number;
}

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 mb-2" />
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mb-3 sm:mb-4" />
              <Skeleton className="h-2 sm:h-3 w-24 sm:w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statsData = [
    {
      label: "Propiedades Vistas",
      value: stats.propertiesViewed,
      icon: Eye,
      iconBg: "bg-blue-50",
      iconColor: "text-primary",
      change: "+12%",
      changeLabel: "desde el mes pasado"
    },
    {
      label: "Favoritos",
      value: stats.savedProperties,
      icon: Heart,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      change: "+3",
      changeLabel: "esta semana"
    },
    {
      label: "Descuento Promedio",
      value: `${stats.averageDiscount}%`,
      icon: Percent,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      change: "",
      changeLabel: "en propiedades vistas"
    },
    {
      label: "Suscripción",
      value: "Premium",
      icon: Crown,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      change: "",
      changeLabel: `${stats.subscriptionDaysRemaining} días restantes`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statsData.map((stat, index) => (
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
            <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm">
              {stat.change && (
                <span className="text-green-600 font-medium mr-1">{stat.change}</span>
              )}
              <span className="text-gray-600 truncate">{stat.changeLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
