import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import SoftwareEngineering from "./pages/SoftwareEngineering";
import ProjectBoard from "./pages/ProjectBoard";
import Files from "./pages/Files";
import NotFound from "./pages/NotFound";
import SignUpPage from "./pages/SignUp";
import SignInPage from "./pages/SignIn";
import TaskChat from "./components/taskChatComponents/TaskChat";
import WaitlistPage from "./pages/Waitlist";
import ProfilePage from "./pages/ProfilePage";
import SignUpSuccess from "./pages/SignUpSuccess";
import UserTasks from "./pages/UserTasks";
import Inbox from "./pages/Inbox";
import { FileSystemProvider } from "./components/FileSystemContext";
import Workflow from "./pages/Workflow";
import Dashboard from "./components/dashBoardComponents/DashComp";
import ActivityFeed from "./pages/ActivityFeed";


const TaskChatRoute = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const location = useLocation();
  const taskName = location.state?.taskName || (taskId ? `Task #${taskId}` : "Task");
  const globalDocs = location.state?.globalDocs || [];  
  
  return (
    <TaskChat
      isOpen={!!taskId}
      onClose={() => window.history.back()}
      taskName={taskName}
      taskId={taskId || ""}
      globalDocs={globalDocs} 
    />
  );
};

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient();

const HomeRedirectIfSignedIn = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/home", { replace: true });
    }
  }, [isSignedIn, navigate]);

  return <Index />;
};

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
        
        <FileSystemProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeRedirectIfSignedIn />} />
              <Route
                path="/software-engineering"
                element={
                  <ProtectedRoute>
                    <SoftwareEngineering />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/signup-success" 
                element={
                  <ProtectedRoute>
                    <SignUpSuccess />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/activity" 
                element={
                  <ProtectedRoute>
                    <ActivityFeed />
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
                path="/files"
                element={
                  <ProtectedRoute>
                    <Files />
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
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/waitlist"
                element={<WaitlistPage />}
              />
              <Route
                path="/workflows"
                element={
                  <ProtectedRoute>
                    <Workflow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <UserTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inbox"
                element={
                  <ProtectedRoute>
                    <Inbox />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
            </Routes>
          </BrowserRouter>
        </FileSystemProvider>

      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
