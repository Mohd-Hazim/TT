import React from "react";
import { Menu } from "lucide-react";
import logo from "../../img/Teaching Pariksha.png";

export default function Header({ toggleSidebar }) {
  return (
    <header
      className="flex items-center justify-between px-4 py-3 sticky top-0 z-40 border-b border-[#e5d8ff]"
      style={{
        backgroundColor: "#EFE6FE", // Lavender background
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
          className="h-10 md:h-12 object-contain"
        />
      </div>

      {/* Removed theme toggle button entirely */}
    </header>
  );
}
