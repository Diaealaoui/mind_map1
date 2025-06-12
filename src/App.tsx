// src/App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { supabase } from "@/lib/supabase";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

// Optional full page routes
import MindMapPage from './pages/MindMap';
import ForumPage from './pages/Forum';
import CsvUploaderPage from './pages/CsvUploader';
import ZohoPage from './pages/Zoho';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage';

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [userType, setUserType] = useState<'admin' | 'client' | null>(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getUser();
      const sessionUser = data?.user || null;
      setUser(sessionUser);
      setUserEmail(sessionUser?.email || '');

      if (sessionUser?.id) {
        const { data: profile } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', sessionUser.id)
          .single();

        if (profile?.user_type === 'admin' || profile?.user_type === 'client') {
          setUserType(profile.user_type);
        }
      }

      setChecking(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user || null;
      setUser(sessionUser);
      setUserEmail(sessionUser?.email || '');

      if (sessionUser?.id) {
        supabase
          .from('users')
          .select('user_type')
          .eq('id', sessionUser.id)
          .single()
          .then(({ data }) => {
            if (data?.user_type === 'admin' || data?.user_type === 'client') {
              setUserType(data.user_type);
            }
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checking) return <div className="p-6 text-center">Loading session...</div>;

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
              <Route
                path="/dashboard"
                element={
                  user && userType ? (
                    <DashboardPage userEmail={userEmail} userType={userType} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route path="/mindmap" element={user ? <MindMapPage /> : <Navigate to="/login" />} />
              <Route path="/forum" element={user ? <ForumPage userEmail={userEmail} /> : <Navigate to="/login" />} />
              <Route path="/csv" element={user ? <CsvUploaderPage /> : <Navigate to="/login" />} />
              <Route path="/zoho" element={user ? <ZohoPage /> : <Navigate to="/login" />} />
              <Route path="/history" element={user ? <PurchaseHistoryPage userEmail={userEmail} /> : <Navigate to="/login" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;

