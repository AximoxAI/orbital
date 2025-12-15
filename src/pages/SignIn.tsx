import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <SignIn path="/sign-in" afterSignInUrl="/home"/>
  </div>
);

export default SignInPage;