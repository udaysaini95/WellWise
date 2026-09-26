import React from "react";
import { Link } from "react-router-dom";
import icon from "../../assets/Images/icon.png";

export default function Footer() {
  const githubIcon = (
    <svg
      className="w-8 h-8 fill-current text-green-700 hover:text-green-900 transition duration-150"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <footer className="bg-white">
      <div className="mx-auto w-full max-w-screen-xl px-0 py-0 flex flex-col md:flex-row items-center justify-between">
        <Link to="/" className="flex items-center mt-3 mb-4 md:mb-0">
          <img src={icon} alt="Logo" className="h-24 sm:h-28 md:h-32 mr-4" />
        </Link>
        <span className="text-xl sm:text-2xl  font-extrabold bg-gradient-to-r from-green-500 to-lime-500 bg-clip-text text-transparent leading-none -ml-28">
          Well Wise
        </span>

        <a
          href="https://github.com/Raghav-Code-dt/Well-Wise-Healthcare"
          className="flex items-center space-x-2 text-green-700 font-semibold text-lg hover:text-green-900 transition duration-150"
          target="_blank"
          rel="noreferrer"
        >
          {githubIcon}
        </a>
      </div>
    </footer>
  );
}
