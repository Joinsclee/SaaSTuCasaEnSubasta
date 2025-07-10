import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home } from "lucide-react";
import { Link } from "wouter";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: ""
  });

  // Redirect if already authenticated
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side - Forms */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Home className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">Tu Casa en Subasta</span>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Iniciar Sesión</CardTitle>
                  <CardDescription>
                    Accede a tu cuenta para ver propiedades exclusivas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Usuario</Label>
                      <Input
                        id="username"
                        type="text"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Crear Cuenta</CardTitle>
                  <CardDescription>Regístrate para acceder a propiedades con descuentos hasta 90%</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="regUsername">Usuario</Label>
                      <Input
                        id="regUsername"
                        type="text"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre Completo</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={registerData.fullName}
                        onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="regPassword">Contraseña</Label>
                      <Input
                        id="regPassword"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creando cuenta..." : "Crear Cuenta"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <Link href="/landing" className="text-sm text-gray-600 hover:text-primary">
              ¿Necesitas más información? Ver página principal
            </Link>
          </div>
        </div>
      </div>
      {/* Right side - Hero */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-white p-8">
        <div className="max-w-md space-y-6 text-center">
          <h2 className="text-3xl font-bold">
            Propiedades con Descuentos Increíbles
          </h2>
          <p className="text-lg text-blue-100">
            Accede a miles de propiedades en subasta en Estados Unidos con descuentos de hasta 70% de su valor de mercado.
          </p>
          <div className="bg-white/10 rounded-lg p-6">
            <div className="text-4xl font-bold text-yellow-300 mb-2">1,247</div>
            <div className="text-sm">Propiedades Disponibles</div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 rounded p-3">
              <div className="font-bold">Miami, FL</div>
              <div className="text-blue-200">desde $89,500</div>
            </div>
            <div className="bg-white/10 rounded p-3">
              <div className="font-bold">Austin, TX</div>
              <div className="text-blue-200">desde $165,000</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
