import React from "react";


export default function Footer() {
  return (
    <footer className="relative w-full border-t border-neutral-800">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-black/60 to-transparent"></div>
      <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-black/60 to-transparent"></div>

      <div className="bg-black relative">
        <div className="mx-auto max-w-6xl px-20 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            {/* <img
              src="/logo.svg"
              alt="Planora Semiauto Logo"
              width={20}
              height={20}
              className="object-contain "
            /> */}
            <span className="font-bold text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-400 to-gray-700">
              <a href="/">PLANORA SEMIAUTO</a>
            </span>
          </div>
          <div className="flex flex-col items-center text-sm text-neutral-400">
            <h2 className="text-white font-semibold">
              Planora Semiauto
            </h2>
            <p>shibin24888@gmail.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}