import React from "react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 z-20 w-full border-b border-neutral-800 bg-black/60 backdrop-blur-lg">
      <div className="mx-auto max-w-6xl relative">
        <div
          className="
            flex
            items-center
            justify-between
            py-4
            w-full
            px-10
          "
        >
          {/* Left side - Logo */}
          <div className="flex items-center space-x-3">
            {/* <img
              src="/logo.svg"
              alt="Popcorn Flix Logo"
              width={20}
              height={20}
              className="object-contain "
            /> */}
            <span className="font-bold text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-400 to-gray-700">
              <a href="/">PLANORA SEMIAUTO</a>
            </span>
          </div>

          {/* Right side - Buttons */}
          <div className="flex items-center gap-4 px-10">
            <a href="/about">
              <button className="text-neutral-300 border border-neutral-500 hover:bg-white hover:text-black px-4 py-2 rounded-md transition-all duration-300">
                About
              </button>
            </a>
            <a href="/login">
              <button className="text-neutral-300 border border-neutral-500 hover:bg-white hover:text-black px-4 py-2 rounded-md transition-all duration-300">
                Login
              </button>
            </a>
            <a href="/signup">
              <button className="text-neutral-300 border border-neutral-500 hover:bg-white hover:text-black px-4 py-2 rounded-md transition-all duration-300">
                Signup
              </button>
            </a>
          </div>

        </div>

        {/* Progressive Blur Effects */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-black/60 to-transparent"></div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-black/60 to-transparent"></div>
      </div>
    </header>
  );
}