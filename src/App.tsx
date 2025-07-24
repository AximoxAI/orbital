import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import SoftwareEngineering from "./pages/SoftwareEngineering";
import ProjectBoard from "./pages/ProjectBoard";
import NotFound from "./pages/NotFound";
import SignUpPage from "./pages/SignUp";
import SignInPage from "./pages/SignIn";
import TaskChat from "./components/TaskChat";

const TaskChatRoute = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const location = useLocation();
  // Use taskName from route state if available, else fallback to Task #id or "Task"
  const taskName = location.state?.taskName || (taskId ? `Task #${taskId}` : "Task");
  return (
    <TaskChat
      isOpen={!!taskId}
      onClose={() => window.history.back()}
      taskName={taskName}
      taskId={taskId || ""}
    />
  );
};

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </>
);

const App = () => (
  <ClerkProvider
    publishableKey={clerkPubKey}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/software-engineering"
              element={
                <ProtectedRoute>
                  <SoftwareEngineering />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project-board"
              element={
                <ProtectedRoute>
                  <ProjectBoard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/:taskId"
              element={
                <ProtectedRoute>
                  <TaskChatRoute />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;