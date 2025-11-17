import React, { useState } from "react";
import { Menu, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api";
import { toast } from "react-hot-toast";
import logo from "../../img/Teaching Pariksha.png";

export default function Header({ toggleSidebar }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const handleProfile = () => {
    setShowDropdown(false);
    navigate("/profile");
  };

  return (
    <header
      className="flex items-center justify-between px-4 py-3 sticky top-0 z-40 border-b border-[#e5d8ff]"
      style={{
        backgroundColor: "#EFE6FE",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-700 rounded-md hover:bg-[#e5d8ff] lg:hidden transition-colors"
        >
          <Menu size={24} />
        </button>

        <img
          src={logo}
          alt="Teaching Pariksha Logo"
          className="h-10 md:h-12 object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#e5d8ff] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
            <User size={18} />
          </div>
          <span className="hidden md:inline text-sm font-medium text-gray-700">
            Profile
          </span>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowDropdown(false)}
            />

            {/* Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40">
              <button
                onClick={handleProfile}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
              >
                <User size={16} />
                My Profile
              </button>

              <hr className="my-1 border-gray-200" />

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}