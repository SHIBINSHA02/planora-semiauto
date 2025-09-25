import React from 'react'

function Hero() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col justify-center">
      <div className="pb-16 pt-4 md:pb-24 md:pt-8 lg:pb-56 lg:pt-24 2xl:pb-64 2xl:pt-32">
        <div className="relative mx-auto max-w-6xl 2xl:max-w-7xl flex flex-col px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Text Block */}
          <div className="mx-auto w-full max-w-lg 2xl:max-w-xl text-center lg:ml-0 lg:w-1/2 lg:text-left">
            <h1
              className="
                pt-20
                mt-6
                text-4xl
                sm:text-5xl
                md:text-6xl
                xl:text-7xl
                2xl:text-7xl
                font-bold
                tracking-wider
                text-transparent
                bg-clip-text
                bg-gradient-to-r
                from-[#10b981]
                via-[#3b82f6]
                to-[#8b5cf6]
                hover:from-[#8b5cf6]
                hover:via-[#10b981]
                hover:to-[#3b82f6]
                transition-all
                duration-500
              "
            >
              Planora Semiauto!
            </h1>

            <p className="mt-6 sm:mt-8 max-w-2xl text-pretty text-base sm:text-lg xl:text-xl 2xl:text-xl">
              Plan Smarter, Live Smoother
            </p>

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 items-center sm:justify-center md:justify-center lg:justify-start">
              <a href="/reviews" className="group relative inline-block w-full sm:w-40 2xl:w-52">
                <span
                  className="
                    absolute
                    inset-0
                    rounded-md
                    bg-gradient-to-r
                    from-[#10b981]
                    via-[#3b82f6]
                    to-[#8b5cf6]
                    blur-sm
                    opacity-70
                    transition-all
                    duration-500
                    group-hover:blur-md
                    group-hover:opacity-100
                  "
                ></span>
                <span
                  className="
                    relative
                    flex
                    items-center
                    justify-center
                    w-full
                    rounded-md
                    py-2
                    bg-black
                    font-semibold
                    text-white
                    border-2
                    border-transparent
                    group-hover:border-[#8b5cf6]
                    transition-all
                    duration-500
                    text-base
                    2xl:text-lg
                  "
                >
                  Reviews →
                </span>
              </a>

              <button className="w-full sm:w-40 2xl:w-52 h-11 2xl:h-12 text-base 2xl:text-lg bg-transparent border-2 border-white text-white rounded-md hover:bg-white hover:text-black transition-all duration-300">
                <a href="/reviews" className="w-full h-full flex items-center justify-center">Dive in</a>
              </button>
            </div>
          </div>

          {/* Right Image Block */}
          <div className="mt-12 sm:mt-16 lg:mt-8 lg:w-1/2 flex justify-center lg:justify-end px-4 sm:px-0">
            <img
              src="https://www.edusys.co/images/timetable-software.png"
              alt="Pinterest Image"
              className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl h-auto rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
