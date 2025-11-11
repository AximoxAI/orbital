import { useEffect, useRef } from "react";
import { UserProfile, useClerk, useUser, useAuth } from "@clerk/clerk-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { UsersApiFactory, UserDto, Configuration } from "@/api-client";

const ProfilePage = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { getToken } = useAuth();

  const prevUserRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    const UserId = localStorage.getItem("userId");

    const prev = prevUserRef.current;
    const current = {
      name:
        user.username ||
        [user.firstName, user.lastName].filter(Boolean).join(" "),
      email: user.primaryEmailAddress?.emailAddress || "",
      avatar: user.imageUrl,
    };

    if (JSON.stringify(prev) === JSON.stringify(current)) return;
    prevUserRef.current = current;

    const syncUser = async () => {
      try {
        const token = await getToken();
        const baseUrl = import.meta.env.VITE_BACKEND_API_KEY;

        const configuration = new Configuration({
          basePath: baseUrl,
          accessToken: token ?? undefined,
        });

        const usersApi = UsersApiFactory(configuration);

        const userPayload: UserDto = {
          auth_id: user.id,
          name: current.name,
          email: current.email,
          avatar: current.avatar,
          status: "online",
        };

        await usersApi.usersControllerUpdate(UserId, userPayload);
      } catch (error) {
        console.log(error)
      }
    };

    syncUser();
  }, [
    user?.firstName,
    user?.lastName,
    user?.username,
    user?.imageUrl,
    user?.primaryEmailAddress,
    getToken,
    user,
  ]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col transition-all duration-300">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
          <Button variant="outline" size="sm" onClick={signOut}>
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
                  navbar: "hidden",
                },
              }}
              routing="hash"
            />
          </div>
        </div>
      </div>

      <style>
        {`
          .clerk-profile-container * {
            box-shadow: none !important;
          }
        `}
      </style>
    </div>
  );
};

export default ProfilePage;
