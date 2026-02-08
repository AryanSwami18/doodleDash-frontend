function Navbar() {
  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-3 hover:scale-105 transition-transform duration-200">

        {/* Left icon */}
        <img
          src="/icons/pencil.png"
          alt="pencil"
          className="h-6 w-6 sm:h-7 sm:w-7 "
        />

        {/* Logo text */}
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-violet-500 hover:text-violet-400 transition-colors text-outline ">
          DoodleDash!
        </h1>

        {/* Right icon */}
        <img
          src="/icons/paint-bucket.png"
          alt="bucket"
          className="h-6 w-6 sm:h-7 sm:w-7"
        />
      </div>
    </header>
  );
}

export default Navbar;
