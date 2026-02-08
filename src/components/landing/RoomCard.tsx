import React from 'react'

function RoomCard() {


    const handleCreateRoom = () => {
        alert("Create Room button clicked! Implement room creation logic here.");
    }

    const handleJoinRoom = () => {
        alert("Join Room button clicked! Implement room joining logic here.");
    }


    return (
        <div className='flex flex-col items-center justify-center font-display gap-6 p-8 bg-violet-100 rounded-2xl shadow-lg w-full max-w-md mx-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50'>
            <h3 className="text-2xl font-bold font-display text-violet-600">Create Or Join Room</h3>
            <div className='flex  flex-col gap-4 mt-6 font-medium'>
                <button className='px-4 py-2 bg-violet-500 text-white rounded-full hover:bg-violet-600  
                    bg-linear-to-b from-violet-500 to-violet-600
                    shadow-[0_6px_0_#5b21b6,0_10px_20px_rgba(0,0,0,0.25)]
                    transition-all duration-150
                    active:translate-y-0.5
                    active:shadow-[0_3px_0_#5b21b6,0_6px_12px_rgba(0,0,0,0.25)] border-2 border-black'
                    >
                       Create Room 
                    </button>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex-1 h-px bg-gray-300" />
                    OR
                    <div className="flex-1 h-px bg-gray-300" />
                </div>


                <div className='flex flex-col gap-4 font-medium'>
                    <input
                        type="text"
                        placeholder="Enter Code"
                        className="px-4 py-2 rounded-full border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 w-full font-medium
                        "
                    />

                    <button className='px-4 py-2 bg-violet-500 text-white rounded-full hover:bg-violet-600  
                    bg-linear-to-b from-violet-500 to-violet-600
                    shadow-[0_6px_0_#5b21b6,0_10px_20px_rgba(0,0,0,0.25)]
                    transition-all duration-150
                    active:translate-y-0.5
                    active:shadow-[0_3px_0_#5b21b6,0_6px_12px_rgba(0,0,0,0.25)] border-2 border-black'
                    >
                        Join Room
                    </button>


                </div>


            </div>


        </div>
    )
}

export default RoomCard