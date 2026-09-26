import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
// import icon from "../../assets/Images/icon.png";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Well Form", path: "/About" },
    { name: "Diet", path: "/Diet" },
    { name: "Exercise", path: "/Exercise" },
    { name: "Hydration", path: "/Hydration" },
    { name: "WellAi", path: "/WellAI" },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="fixed top-3 left-0 w-full z-50 flex justify-center">
      <div className="w-[92%] sm:w-[90%] md:w-[86%] lg:w-[80%] xl:w-[76%] transition-all duration-300 backdrop-blur-md bg-white/15 shadow-lg rounded-3xl md:rounded-[2rem] lg:rounded-[2.5rem]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-3 md:py-4 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-2 transform transition-transform duration-300 hover:scale-105"
          >
           
            <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-green-500 to-lime-500 bg-clip-text text-transparent leading-none">
              Well Wise
            </span>
          </Link>

          <ul className="hidden lg:flex space-x-6 xl:space-x-10 font-medium">
            {navItems.map((item) => (
              <li key={item.name} className="group">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `relative text-base xl:text-lg tracking-wide transition duration-300
                    ${
                      isActive
                        ? "text-green-500 font-semibold"
                        : "text-gray-400 hover:text-green-500"
                    }`
                  }
                >
                  {item.name}
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="login"
              className="px-4 py-2 text-gray-400 hover:text-green-600 transition font-medium"
            >
              Log in
            </Link>
            <Link
              to="signup"
              className="px-5 py-2 rounded-full text-white bg-gradient-to-r from-green-500 to-lime-500 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Get Started
            </Link>
          </div>

          <button
            className="lg:hidden p-2 rounded-md text-gray-200 transition-colors duration-300 hover:bg-white/20"
            onClick={toggleMenu}
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {isOpen && (
          <div className="lg:hidden bg-white/90 backdrop-blur-md shadow-lg animate-slide-down rounded-b-[2rem]">
            <ul className="flex flex-col space-y-3 p-5 font-medium">
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    onClick={toggleMenu}
                    className={({ isActive }) =>
                      `block text-base py-2 transition duration-200 ${
                        isActive
                          ? "text-green-700 font-semibold"
                          : "text-gray-800 hover:text-green-500"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
              <li>
                <Link
                  to="#"
                  className="block px-5 py-2 text-center text-gray-800 hover:text-green-600 transition"
                >
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="block px-6 py-2 rounded-full text-center text-white bg-gradient-to-r from-green-500 to-lime-500 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
