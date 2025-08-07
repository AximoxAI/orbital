import { Waitlist } from "@clerk/clerk-react";

const WaitlistPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="max-w-md w-full p-6 bg-white rounded ">
      <Waitlist />
    </div>
  </div>
);

export default WaitlistPage;