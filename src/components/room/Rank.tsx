import React from "react";

type Player = {
  id: string;
  name: string;
  score: number;
};

function Rank({ players }: { players: Player[] }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  

  return (
    <div className="w-full lg:w-1/4 h-screen lg:h-full bg-violet-100 border-2 border-black rounded-2xl p-4 shadow-lg flex flex-col">
      
      <div className="bg-violet-500 text-white rounded-xl border-2 border-black py-2 px-4 text-center font-bold shadow-md">
        🏆 Rankings
      </div>

      <div className="flex-1 mt-4 bg-white rounded-xl border-2 border-black p-3 overflow-y-auto flex flex-col gap-3">

        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`
              flex items-center justify-between
              rounded-xl border-2 border-black
              px-3 py-2
              shadow-sm
              transition-transform hover:scale-[1.02]
              ${index === 0 ? "bg-yellow-100" : "bg-gray-50"}
            `}
          >
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-8 h-8 flex items-center justify-center
                  rounded-full border-2 border-black
                  font-bold text-sm
                  ${
                    index === 0
                      ? "bg-yellow-400"
                      : index === 1
                      ? "bg-gray-300"
                      : index === 2
                      ? "bg-orange-300"
                      : "bg-gray-200"
                  }
                `}
              >
                {index + 1}
              </div>

              <div>
                <p className="font-semibold text-sm sm:text-base">
                  {player.name}
                </p>
                <p className="text-xs text-gray-500">
                  {player.score} pts
                </p>
              </div>
            </div>

            {index === 0 && (
              <span className="text-yellow-500 text-lg">🏆</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Rank;