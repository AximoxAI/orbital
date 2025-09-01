import { UserProfile } from "@clerk/clerk-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/clerk-react";

const ProfilePage = () => {
  const { signOut } = useClerk();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              signOut();
            }}
          >
            Log out
          </Button>
        </header>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-xl flex justify-center items-center">
            <UserProfile
              appearance={{
                elements: {
                  card: "!shadow-none !ring-0 !border-0 !border-none !bg-transparent",
                  rootBox: "!shadow-none !ring-0 !border-0 !border-none !bg-transparent",
                  header: "!shadow-none !ring-0 !border-0 !border-none !bg-transparent",
                  pageScrollBox: "!shadow-none !ring-0 !border-0 !border-none !bg-transparent",
                  profileSection: "!shadow-none !ring-0 !border-0 !border-none !bg-transparent",
                  profileSection__main: "!shadow-none !ring-0 !border-0 !border-none !bg-transparent",
                  scrollBox: "!shadow-none !ring-0 !border-0 !border-none !bg-transparent",
                  navbar: "!hidden",
                  formButtonPrimary: "bg-blue-500 hover:bg-blue-600",
                  formFieldInput: "border-gray-200 focus:ring-blue-500"
                },
                variables: {
                  colorPrimary: "#3b82f6",
                  colorBackground: "transparent",
                  fontSize: "16px",
                  fontFamily: "inherit"
                }
              }}
              routing="hash"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;