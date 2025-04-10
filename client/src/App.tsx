import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ThankYou from "@/pages/thank-you";
import DevTools from "@/pages/dev-tools";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/dev-tools" component={DevTools} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
