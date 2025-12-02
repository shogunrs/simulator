import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useState, useEffect } from "react";
import { Router as WouterRouter, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Presentation from "./pages/Presentation";
import PresentationSlides from "./pages/PresentationSlides";

// Hash location hook for Electron support
const useHashLocation = () => {
  const [loc, setLoc] = useState(window.location.hash.replace(/^#/, "") || "/");
  useEffect(() => {
    const handler = () => setLoc(window.location.hash.replace(/^#/, "") || "/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = (to: string) => (window.location.hash = to);
  return [loc, navigate] as [string, (to: string) => void];
};

function Router() {
  const [location, setLocation] = useHashLocation();

  return (
    <WouterRouter hook={useHashLocation}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/presentation"} component={Presentation} />
        <Route path={"/slides"} component={PresentationSlides} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
