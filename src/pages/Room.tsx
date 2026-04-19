import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../lib/socket";
import { getPlayerId, getPlayerName, setPlayerName } from "../lib/player";
import Rank from "../components/room/Rank";
import Canvas from "../components/room/Canvas";
import Chat from "../components/room/Chat";
import Confetti from "react-confetti";

function Room() {
  const { roomId } = useParams();
  const playerId = getPlayerId();
  const [name, setName] = useState<string | null>(getPlayerName());
  const [players, setPlayers] = useState<any[]>([]);
  const [gameState, setGameState] = useState<"waiting" | "in-progress" | "finished">("waiting");
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [showRoundStartModal, setShowRoundStartModal] = useState(false);
  const [currentDrawerId, setCurrentDrawerId] = useState<string | null>(null);
  const drawer = players.find(p => p.id === currentDrawerId);
  const [showGameEnd, setShowGameEnd] = useState(false);
  const [finalPlayers, setFinalPlayers] = useState<any[]>([]);
  const[drawWord,setDrawWord] = useState<string | null>(null);
  const [wordLength, setWordLength] = useState<number>(0);

  const [showRoundEndModal, setShowRoundEndModal] = useState(false);
  const [lastWord, setLastWord] = useState("");
  const sortedPlayers = [...finalPlayers].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [roundInfo, setRoundInfo] = useState<{
    round: number;
    nextRound: number;
  } | null>(null);


  const [activePanel, setActivePanel] = useState<
    "canvas" | "rank" | "chat"
  >("canvas");

  const handleNameSubmit = () => {
    if (!tempName.trim()) return;

    const finalName = tempName.trim();

    setPlayerName(finalName); // localStorage
    setName(finalName);
    setShowNameModal(false);
  };

  useEffect(() => {
    const handler = ({ leaderBoard }: any) => {
      setFinalPlayers(leaderBoard);
      setShowGameEnd(true);
    };

    socket.on("game-ended", handler);

    return () => {
      socket.off("game-ended", handler);
    };
  }, []);

  useEffect(() => {
    const handler = ({ round, nextRound }: any) => {
      setRoundInfo({ round, nextRound });
      setShowRoundSummary(true);

      setTimeout(() => {
        setShowRoundSummary(false);
      }, 4000);
    };

    socket.on("round-finished", handler);

    return () => {
      socket.off("round-finished", handler);
    };
  }, []);

  useEffect(() => {
    const handler = ({ drawerId }: { drawerId: string }) => {
      setCurrentDrawerId(drawerId);
      setWordLength(wordLength);

      setShowRoundStartModal(true);

      if (playerId !== drawerId) {
      setDrawWord(null);
    }

      setTimeout(() => {
        setShowRoundStartModal(false);
      }, 3000);
    };

    socket.on("round-start", handler);

    return () => {
      socket.off("round-start", handler);
    };
  }, []);


  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    if (!roomId) return;

    if (!name) {
      setShowNameModal(true);
      return
    }

    socket.emit("join-room", { roomId, name, playerId });

    socket.on("room-not-found", () => {
      alert("Room not found!");

      window.history.back();
    });

    socket.on("players-update", (data) => {
      setPlayers(data.players);
    });

    socket.on("round-start", () => {
      setGameState("in-progress");
    });

    socket.on("game-paused", () => {
      setGameState("waiting");
    });

    socket.on("game-state", ({ gameState }) => {
      if (gameState === "in-progress") {
        setGameState("in-progress");
      } else {
        setGameState("waiting");
      }
    });


    socket.on("your-word", ({ word }: { word: string }) => {
      setDrawWord(word);
    });

    return () => {
      socket.off("room-not-found");
      socket.off("players-update");
      socket.off("round-start");
      socket.off("game-paused");
      socket.off("game-state");
      socket.off("players-update");
    };


  }, [roomId, name]);


  useEffect(() => {
    
    
    const handler = ({ word }: { word: string }) => {
      setLastWord(word);
      setShowRoundEndModal(true);
      console.log("here"+word);

      setTimeout(() => {
        setShowRoundEndModal(false);
      }, 4000);
    };

    socket.on("round-end", handler);

    return () => {
      socket.off("round-end", handler);
    };
  }, []);

  useEffect(() => {
    socket.on("game-restarted", () => {
      setShowGameEnd(false);
    });

    return () => {
      socket.off("game-restarted");
    };
  }, []);

  return (


    <div className="relative h-[100dvh] w-full font-display bg-blue-300 overflow-hidden">

      {showGameEnd && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/70">

          {/* 🎉 Confetti */}
          <Confetti />

          <div className="bg-white rounded-2xl border-2 border-black shadow-xl p-6 w-[90%] max-w-md text-center">

            {/* Winner */}
            <h2 className="text-2xl font-bold mb-2">
              🏆 {winner?.name} Wins!
            </h2>

            <p className="text-gray-600 mb-4">
              Final Score: {winner?.score}
            </p>

            {/* Leaderboard */}
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mb-4">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`
              flex justify-between items-center px-3 py-2 rounded-lg border
              ${index === 0 ? "bg-yellow-100 font-bold" : "bg-gray-100"}
            `}
                >
                  <span>
                    {index + 1}. {player.name}
                  </span>
                  <span>{player.score}</span>
                </div>
              ))}
            </div>

            {/* Restart Button (ONLY HOST) */}
            {sortedPlayers.find(p => p.id === playerId)?.isHost && (
              <button
                onClick={() => socket.emit("restart-game", { roomId })}
                className="w-full bg-violet-500 text-white px-4 py-2 rounded-xl border-2 border-black shadow-md"
              >
                🔄 Restart Game
              </button>
            )}

          </div>
        </div>
      )}

      {showRoundSummary && roundInfo && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/70">

          <div className="bg-white rounded-2xl border-2 border-black shadow-xl p-6 w-[90%] max-w-md text-center">

            <h2 className="text-xl font-bold mb-2">
              🏁 Round {roundInfo.round} Finished!
            </h2>

            <p className="text-gray-600 mb-4">
              Next Round: <span className="font-bold">{roundInfo.nextRound}</span>
            </p>

            {/* Leaderboard */}
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {[...players]
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`
                flex justify-between items-center px-3 py-2 rounded-lg border
                ${index === 0 ? "bg-yellow-100 font-bold" : "bg-gray-100"}
              `}
                  >
                    <span>
                      {index + 1}. {player.name}
                    </span>
                    <span>{player.score}</span>
                  </div>
                ))}
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Starting next round...
            </p>

          </div>
        </div>
      )}

      {
        showRoundEndModal && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-green-500 text-white px-6 py-2 rounded-xl border-2 border-black shadow-lg font-semibold">
              🎉Word was: {lastWord
              }
            </div>
          </div>
        )
      }

      {showRoundStartModal && currentDrawerId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-violet-500 text-white px-6 py-2 rounded-xl border-2 border-black shadow-lg font-semibold">
            🎨 {drawer?.name || "Someone"} is drawing!
          </div>
        </div>
      )}
      {showNameModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center w-80">
            <h2 className="text-xl font-bold mb-3">Enter Your Name</h2>

            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
              placeholder="Your name"
            />

            <button
              onClick={handleNameSubmit}
              className="bg-violet-500 text-white px-4 py-2 rounded w-full"
            >
              Join Game
            </button>
          </div>
        </div>
      )}

      {gameState === "waiting" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg text-center">
            <h2 className="text-xl font-bold">Waiting for players...</h2>
            <p className="text-gray-600 mt-2">
              Invite friends to join the room
            </p>
            <p className="mt-2 text-sm">Room ID: {roomId}</p>
          </div>
        </div>
      )}

      <div className={`h-full w-full overflow-hidden ${gameState === "waiting" ? "blur-sm pointer-events-none" : ""}`}>

        {/* DESKTOP (large screens and up) */}
        <div className="hidden lg:flex h-full w-full gap-4 p-4">
          <Rank players={players} />
          <Canvas roomId={roomId!} currentDrawerId={currentDrawerId} playerId={playerId} drawWord={drawWord}
          wordLength={wordLength} />
          <Chat roomId={roomId!} />
        </div>

        {/* MOBILE + TABLET */}
        <div className="lg:hidden h-full w-full relative">

          <div className={activePanel === "canvas" ? "block h-full w-full" : "hidden"}>
            <Canvas
              roomId={roomId!}
              currentDrawerId={currentDrawerId}
              playerId={playerId}
              drawWord={drawWord}
              wordLength={wordLength}
            />
          </div>


          {activePanel === "rank" && (
            <div className="h-full w-full">
              <Rank players={players} />
            </div>
          )}

          {activePanel === "chat" && (
            <div className="h-full w-full">
              <Chat roomId={roomId!} />
            </div>
          )}

          {/* Floating Buttons */}
          <button
            onClick={() =>
              setActivePanel(activePanel === "rank" ? "canvas" : "rank")
            }
            className="
          absolute left-3 top-1/2 -translate-y-1/2
          bg-violet-500 text-white
          px-3 py-2 rounded-full
          border-2 border-black
          shadow-md
        "
          >
            🏆
          </button>

          <button
            onClick={() =>
              setActivePanel(activePanel === "chat" ? "canvas" : "chat")
            }
            className="
          absolute right-3 top-1/2 -translate-y-1/2
          bg-violet-500 text-white
          px-3 py-2 rounded-full
          border-2 border-black
          shadow-md
        "
          >
            💬
          </button>
        </div>
      </div>
    </div>
  );
}

export default Room;