import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Sectors from "@/pages/Sectors";
import Subsidiaries from "@/pages/Subsidiaries";
import Leadership from "@/pages/Leadership";
import GlobalPresence from "@/pages/GlobalPresence";
import Contact from "@/pages/Contact";
import News from "@/pages/News";
import Sustainability from "@/pages/Sustainability";
import Careers from "@/pages/Careers";
import Partnerships from "@/pages/Partnerships";
import ChairmanMessage from "@/pages/ChairmanMessage";
import NotFound from "@/pages/not-found";

// Sector detail pages
import EnergyPetroleum from "@/pages/sectors/EnergyPetroleum";
import Trading from "@/pages/sectors/Trading";
import Agriculture from "@/pages/sectors/Agriculture";
import Infrastructure from "@/pages/sectors/Infrastructure";
import RealEstate from "@/pages/sectors/RealEstate";
import Healthcare from "@/pages/sectors/Healthcare";
import Education from "@/pages/sectors/Education";
import Technology from "@/pages/sectors/Technology";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/sectors" component={Sectors} />
      <Route path="/sectors/energy-petroleum" component={EnergyPetroleum} />
      <Route path="/sectors/trading" component={Trading} />
      <Route path="/sectors/agriculture" component={Agriculture} />
      <Route path="/sectors/infrastructure" component={Infrastructure} />
      <Route path="/sectors/real-estate" component={RealEstate} />
      <Route path="/sectors/healthcare" component={Healthcare} />
      <Route path="/sectors/education" component={Education} />
      <Route path="/sectors/technology" component={Technology} />
      <Route path="/subsidiaries" component={Subsidiaries} />
      <Route path="/leadership" component={Leadership} />
      <Route path="/global-presence" component={GlobalPresence} />
      <Route path="/news" component={News} />
      <Route path="/sustainability" component={Sustainability} />
      <Route path="/careers" component={Careers} />
      <Route path="/contact" component={Contact} />
      <Route path="/partnerships" component={Partnerships} />
      <Route path="/chairman" component={ChairmanMessage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
