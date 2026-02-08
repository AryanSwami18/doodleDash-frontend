import { IoPersonSharp, IoChatbubbles } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
import React from "react";
import RoomCard from "./RoomCard";

function Hero() {
  const[roomModal,setRoomModal] = React.useState(false);
  
  
  const handlePlayButton = () => {
    setRoomModal(true);
  }
  return (
    <>
    <section className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 px-4 py-10 items-center">
      
      {/* LEFT */}
      <div className="flex-1 flex flex-col gap-5 items-center text-center lg:text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-violet-600 font-display leading-tight text-center">
          Draw, Guess, and Laugh Together!
        </h1>

        <p className="font-display text-lg text-gray-700 max-w-xl text-center">
          The free multiplayer game where creativity meets chaos. Join a room
          with friends and start sketching — the fun is just a doodle away!
        </p>

        <div className="flex flex-col bg-violet-200 gap-4 font-display p-5 rounded-2xl w-full max-w-sm items-center font-bold shadow-md">
          <input
            type="text"
            placeholder="Enter your name"
            className="px-4 py-2 rounded-full border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 w-full"
          />

          <button
            className="
              px-8 py-4 w-full
              text-white font-semibold text-lg
              rounded-full
              bg-linear-to-b from-violet-500 to-violet-600
              shadow-[0_6px_0_#5b21b6,0_10px_20px_rgba(0,0,0,0.25)]
              transition-all duration-150
              active:translate-y-0.5
              active:shadow-[0_3px_0_#5b21b6,0_6px_12px_rgba(0,0,0,0.25)]
              border-2 border-black
            "
            onClick={handlePlayButton}
          >
            Let's Play
          </button>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex flex-col items-center gap-6 w-full">
        {/* Image */}
        <div className="w-full max-w-xl">
          <img
            src="/images/ui-hero-image.png"
            alt="Game preview"
            width={900}
            height={600}
            className="w-full h-auto rounded-2xl "
          />
        </div>

        {/* Links */}
        <div className="flex gap-4 justify-center items-center">
          {["How to Play", "About Us", "Contact Us"].map((text) => (
            <p
              key={text}
              className="font-display text-sm text-gray-500 hover:text-violet-500 cursor-pointer transition-colors"
            >
              {text}
            </p>
          ))}
        </div>

        {/* Features */}
        <div className="flex gap-8 justify-center flex-wrap">
          {[
            { icon: <FaUserFriends />, label: "Instant Multiplayer" },
            { icon: <IoChatbubbles />, label: "Live Chat & Guesses" },
            { icon: <IoPersonSharp />, label: "Custom Avatar" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-blue-400 p-2 border-2 border-black shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center justify-center text-green-400">
                {item.icon}
              </div>

              <p className="text-gray-500 font-display text-sm hover:text-violet-800 text-center">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

          {/* Room Modal */}
          {roomModal && (
            <RoomCard/>
          )}
    </>
  );
}

export default Hero;
