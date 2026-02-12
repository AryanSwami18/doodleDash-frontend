import React, { useState } from "react";
import { MdCancel } from "react-icons/md";
import { Bounce, ToastContainer, toast } from 'react-toastify';

type Props = {
  onClose?: () => void;
};

function RoomCard({ onClose }: Props) {
  const [roomCode, setRoomCode] = useState("");
   const notify = (message:string) => toast(message, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });

  const handleCreateRoom = () => {
   notify("Create room functionality coming soon!");
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) return;
    notify(`Join Room functionality coming soon! You entered:${roomCode}`)
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      {/* Modal Card */}
      <div className="w-full max-w-md rounded-3xl bg-violet-100 p-8 shadow-2xl font-display">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-violet-600">
            Create or Join Room
          </h3>

          <MdCancel
            onClick={onClose}
            className="cursor-pointer text-2xl text-violet-300 hover:text-violet-600 transition"
          />
        </div>

        {/* Content */}
        <div className="mt-6 flex flex-col gap-4 font-medium">

          {/* Create Room */}
          <button
            onClick={handleCreateRoom}
            className="
              rounded-full border-2 border-black
              bg-linear-to-b from-violet-500 to-violet-600
              px-4 py-2 text-white
              shadow-[0_6px_0_#5b21b6,0_10px_20px_rgba(0,0,0,0.25)]
              transition-all duration-150
              hover:brightness-110
              active:translate-y-0.5
              active:shadow-[0_3px_0_#5b21b6,0_6px_12px_rgba(0,0,0,0.25)]
            "
          >
            Create Room
          </button>
         

          {/* Divider */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="h-px flex-1 bg-gray-300" />
            OR
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          {/* Join Section */}
          <input
            type="text"
            placeholder="Enter Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="
              w-full rounded-full border border-gray-300 bg-white
              px-4 py-2 font-medium outline-none
              focus:ring-2 focus:ring-violet-500
            "
          />

          <button
            onClick={handleJoinRoom}
            disabled={!roomCode.trim()}
            className="
              rounded-full border-2 border-black
              bg-linear-to-b from-violet-500 to-violet-600
              px-4 py-2 text-white
              shadow-[0_6px_0_#5b21b6,0_10px_20px_rgba(0,0,0,0.25)]
              transition-all duration-150
              hover:brightness-110
              active:translate-y-0.5
              active:shadow-[0_3px_0_#5b21b6,0_6px_12px_rgba(0,0,0,0.25)]
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            Join Room
          </button>
        </div>
      </div>
       <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
          />
    </div>
  );
}

export default RoomCard;
