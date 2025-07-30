import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Menu, User, Heart, LogOut, Crown, Shield } from "lucide-react";

export default function Header() {
  const { user, isAdmin, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getSubscriptionDaysRemaining = () => {
    if (!user?.subscriptionExpiresAt) return 0;
    const expiryDate = new Date(user.subscriptionExpiresAt);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigation = [
    { href: "/dashboard", label: "Dashboard", active: location === "/dashboard" || location === "/" },
    { href: "/propiedades", label: "Propiedades", active: location === "/propiedades" },
    { href: "/foreclosures", label: "Datos Reales", active: location === "/foreclosures" },
    { href: "/evaluacion", label: "Evaluación", active: location === "/evaluacion" },
    { href: "/favoritos", label: "Favoritos", active: location === "/favoritos" },
    ...(isAdmin ? [{ href: "/admin", label: "Administración", active: location === "/admin" }] : []),
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Home className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-gray-900">Tu Casa en Subasta</span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span className={`font-medium hover:text-primary transition-colors cursor-pointer ${
                    item.active ? "text-gray-900" : "text-gray-600"
                  }`}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Subscription Status Badge */}
            {user && (
              <div className="hidden sm:flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                <Crown className="h-4 w-4 text-green-600" />
                <span>{user.subscriptionType || "Free"}</span>
                <span className="text-green-600">•</span>
                <span>{getSubscriptionDaysRemaining()} días</span>
              </div>
            )}

            {/* User Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(user.fullName || user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block font-medium text-gray-700">
                      {user.fullName || user.username}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favoritos" className="cursor-pointer">
                      <Heart className="h-4 w-4 mr-2" />
                      Favoritos
                    </Link>
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="h-4 w-4 mr-2" />
                        Administración
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-6">
                  {navigation.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <span 
                        className={`block py-2 px-3 rounded-lg font-medium cursor-pointer ${
                          item.active 
                            ? "bg-primary/10 text-primary" 
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </span>
                    </Link>
                  ))}
                  
                  {isAdmin && (
                    <Link href="/admin">
                      <span 
                        className={`block py-2 px-3 rounded-lg font-medium cursor-pointer ${
                          location === "/admin"
                            ? "bg-primary/10 text-primary" 
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4 inline mr-2" />
                        Administración
                      </span>
                    </Link>
                  )}
                  
                  {user && (
                    <>
                      <div className="border-t pt-4">
                        <Badge variant="outline" className="mb-4">
                          {user.subscriptionType || "Free"} - {getSubscriptionDaysRemaining()} días
                        </Badge>
                      </div>
                      <Link href="/perfil">
                        <span 
                          className="block py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Mi Perfil
                        </span>
                      </Link>
                      <Button 
                        variant="ghost" 
                        onClick={handleLogout}
                        className="justify-start px-3 text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
