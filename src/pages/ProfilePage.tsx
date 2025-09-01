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
          <div className="w-full max-w-xl flex justify-center items-center clerk-profile-container">
            <UserProfile
              appearance={{
                variables: {
                  colorPrimary: "#3b82f6",
                  colorBackground: "transparent",
                  fontSize: "16px",
                  fontFamily: "inherit",
                },
                elements: {
                   navbar: "hidden"
                }
              }}
              routing="hash"
            />
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .clerk-profile-container * {
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
