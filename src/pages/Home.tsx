import Navbar from "../components/layout/Navbar";
import Hero from "../components/landing/Hero";
import Footer from "../components/layout/Footer";

function Home() {
  return (
    <div
      className="
        min-h-screen w-full
        bg-[url('/images/bg.jpg')] bg-cover bg-center bg-no-repeat
        flex flex-col
      "
    >

      <div className="w-full max-w-6xl px-4 mx-auto flex flex-col flex-1">
        <Navbar />

        <main className="flex-1 flex-col items-center justify-center">
          <Hero />
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default Home;
