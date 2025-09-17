import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  searchValue: string;
  setSearchValue: (v: string) => void;
  placeholder?: string;
  showLogout?: boolean;
  className?: string;
}

const TopBar = ({
  searchValue,
  setSearchValue,
  placeholder = "Search",
  showLogout = true,
  className = "",
}: TopBarProps) => {
  const { signOut } = useClerk();
  const navigate = useNavigate();

  return (
    <header className={`bg-white border-b border-gray-200 px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {showLogout && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              signOut();
              navigate("/sign-in");
            }}
          >
            Log out
          </Button>
        )}
      </div>
    </header>
  );
};

export default TopBar;