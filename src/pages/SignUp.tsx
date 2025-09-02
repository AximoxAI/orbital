import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp 
        path="/sign-up"
        forceRedirectUrl="/signup-success" // Redirect to our custom success page
        routing="path"
      />
    </div>
  );
};

export default SignUpPage;