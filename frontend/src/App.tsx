
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { VotingProvider } from "./contexts/VotingContext";
import Header from "./components/Header";
import Login from "./pages/Login";
import Vote from "./pages/Vote";
import Confirm from "./pages/Confirm";
import Admin from "./pages/Admin";
import AdminElections from "./pages/AdminElections";
import AdminVoters from "./pages/AdminVoters";
import AdminResults from "./pages/AdminResults";
import CreateElection from "./pages/CreateElection";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <VotingProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
              <Header />
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/vote" element={<Vote />} />
                <Route path="/confirm" element={<Confirm />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/elections" element={<AdminElections />} />
                <Route path="/admin/voters" element={<AdminVoters />} />
                <Route path="/admin/results" element={<AdminResults />} />
                <Route path="/admin/create" element={<CreateElection />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </VotingProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
