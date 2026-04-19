type Player = {
  id: string;
  name: string;
  score: number;
};

function Rank({ players }: { players: Player[] }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex h-full min-h-0 w-full flex-col rounded-2xl border-2 border-black bg-violet-100 p-4 shadow-lg">
      <div className="rounded-xl border-2 border-black bg-violet-500 px-4 py-2 text-center font-bold text-white shadow-md">
        Rankings
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-xl border-2 border-black bg-white p-3">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center justify-between rounded-xl border-2 border-black px-3 py-2 shadow-sm transition-transform hover:scale-[1.02] ${
              index === 0 ? "bg-yellow-100" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-black text-sm font-bold ${
                  index === 0
                    ? "bg-yellow-400"
                    : index === 1
                      ? "bg-gray-300"
                      : index === 2
                        ? "bg-orange-300"
                        : "bg-gray-200"
                }`}
              >
                {index + 1}
              </div>

              <div>
                <p className="text-sm font-semibold sm:text-base">{player.name}</p>
                <p className="text-xs text-gray-500">{player.score} pts</p>
              </div>
            </div>

            {index === 0 && <span className="text-lg text-yellow-500">1st</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Rank;
