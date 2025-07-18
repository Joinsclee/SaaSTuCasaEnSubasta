import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import AdminPanel from "@/components/admin-panel";
import { Shield } from "lucide-react";

export default function AdminDashboard() {
  const { isAdmin, user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600">Debes iniciar sesión para acceder a esta página.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acceso Restringido
            </h2>
            <p className="text-gray-600">
              No tienes permisos de administrador para ver esta página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <AdminPanel />
      </div>
    </div>
  );
}