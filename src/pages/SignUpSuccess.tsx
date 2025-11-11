import { UsersApiFactory, UserDto, Configuration } from "@/api-client";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpSuccess = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createUser = async () => {
      if (!isLoaded || !isSignedIn || !user || isCreating) {
        return;
      }

      setIsCreating(true);

      try {
        const token = await getToken();
        const baseUrl = import.meta.env.VITE_BACKEND_API_KEY;
        
        const configuration = new Configuration({
          basePath: baseUrl,
          accessToken: token || undefined,
        });

        const usersApi = UsersApiFactory(configuration);

        const userData: UserDto = {
          auth_id: user.id,
          name: user.username || 'Unknown User',
          email: user.primaryEmailAddress?.emailAddress || '',
          avatar: user.imageUrl || undefined,
          status: 'online' as const
        };

        const response = await usersApi.usersControllerCreate(userData);

        if (response.data && response.data.id) {
          localStorage.setItem("userId", String(response.data.id));
        }

        navigate('/project-board');
      } catch (error: any) {
        console.error(' Error:', error);
        setError('Failed to create user profile');
        setTimeout(() => navigate('/project-board'), 3000);
      } finally {
        setIsCreating(false);
      }
    };

    createUser();
  }, [isLoaded, isSignedIn, user, getToken, navigate, isCreating]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Setup Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting in a few seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Setting up your account...</h2>
        <p className="text-gray-500 mt-2">Creating your profile</p>
      </div>
    </div>
  );
};

export default SignUpSuccess;