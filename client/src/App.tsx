import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import AdminDashboard from "@/pages/admin-dashboard";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Properties from "@/pages/properties";
import PropertyDetail from "@/pages/property-detail";
import PropertyEvaluation from "@/pages/property-evaluation";
import Favorites from "@/pages/favorites";
import Profile from "@/pages/profile";
import KevinExpertPage from "@/pages/kevin-expert";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/propiedades" component={Properties} />
      <ProtectedRoute path="/propiedades/:id" component={PropertyDetail} />
      <ProtectedRoute path="/evaluacion" component={PropertyEvaluation} />
      <ProtectedRoute path="/favoritos" component={Favorites} />
      <ProtectedRoute path="/perfil" component={Profile} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/kevin" component={KevinExpertPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
