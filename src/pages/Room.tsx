import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Confetti from "react-confetti";
import Rank from "../components/room/Rank";
import Canvas from "../components/room/Canvas";
import Chat from "../components/room/Chat";
import { socket } from "../lib/socket";
import { getPlayerId, getPlayerName, setPlayerName } from "../lib/player";

type Player = {
  id: string;
  name: string;
  score: number;
  isHost?: boolean;
};

function Room() {
  const { roomId } = useParams();
  const playerId = getPlayerId();
  const [name, setName] = useState<string | null>(getPlayerName());
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<"waiting" | "in-progress" | "finished">("waiting");
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [showRoundStartModal, setShowRoundStartModal] = useState(false);
  const [currentDrawerId, setCurrentDrawerId] = useState<string | null>(null);
  const [showGameEnd, setShowGameEnd] = useState(false);
  const [finalPlayers, setFinalPlayers] = useState<Player[]>([]);
  const [drawWord, setDrawWord] = useState<string | null>(null);
  const [wordLength, setWordLength] = useState(0);
  const [showRoundEndModal, setShowRoundEndModal] = useState(false);
  const [lastWord, setLastWord] = useState("");
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [roundInfo, setRoundInfo] = useState<{ round: number; nextRound: number } | null>(null);
  const [activePanel, setActivePanel] = useState<"canvas" | "rank" | "chat">("canvas");

  const drawer = players.find((player) => player.id === currentDrawerId);
  const sortedPlayers = [...finalPlayers].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  const handleNameSubmit = () => {
    if (!tempName.trim()) return;

    const finalName = tempName.trim();
    setPlayerName(finalName);
    setName(finalName);
    setShowNameModal(false);
  };

  useEffect(() => {
    const handler = ({ leaderBoard }: { leaderBoard: Player[] }) => {
      setFinalPlayers(leaderBoard);
      setShowGameEnd(true);
    };

    socket.on("game-ended", handler);
    return () => {
      socket.off("game-ended", handler);
    };
  }, []);

  useEffect(() => {
    const handler = ({ round, nextRound }: { round: number; nextRound: number }) => {
      setRoundInfo({ round, nextRound });
      setShowRoundSummary(true);

      window.setTimeout(() => {
        setShowRoundSummary(false);
      }, 4000);
    };

    socket.on("round-finished", handler);
    return () => {
      socket.off("round-finished", handler);
    };
  }, []);

  useEffect(() => {
    const handler = ({
      drawerId,
      wordLength: nextWordLength,
    }: {
      drawerId: string;
      wordLength: number;
    }) => {
      setCurrentDrawerId(drawerId);
      setWordLength(nextWordLength);
      setShowRoundStartModal(true);

      if (playerId !== drawerId) {
        setDrawWord(null);
      }

      window.setTimeout(() => {
        setShowRoundStartModal(false);
      }, 3000);
    };

    socket.on("round-start", handler);
    return () => {
      socket.off("round-start", handler);
    };
  }, [playerId]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    if (!roomId) return;

    if (!name) {
      setShowNameModal(true);
      return;
    }

    socket.emit("join-room", { roomId, name, playerId });

    const handleRoomNotFound = () => {
      alert("Room not found!");
      window.history.back();
    };

    const handlePlayersUpdate = ({
      players: nextPlayers,
      currentDrawerId: nextDrawerId,
    }: {
      players: Player[];
      currentDrawerId?: string;
    }) => {
      setPlayers(nextPlayers);
      setCurrentDrawerId(nextDrawerId ?? null);
    };

    const handleRoundStart = ({
      drawerId,
      wordLength: nextWordLength,
    }: {
      drawerId: string;
      wordLength: number;
    }) => {
      setGameState("in-progress");
      setCurrentDrawerId(drawerId);
      setWordLength(nextWordLength);
    };

    const handleGamePaused = () => {
      setGameState("waiting");
      setCurrentDrawerId(null);
      setDrawWord(null);
      setWordLength(0);
    };

    const handleGameState = ({
      gameState: nextGameState,
      currentDrawerId: nextDrawerId,
    }: {
      gameState: "waiting" | "in-progress" | "finished";
      currentDrawerId?: string;
    }) => {
      setGameState(nextGameState === "in-progress" ? "in-progress" : "waiting");
      setCurrentDrawerId(nextDrawerId ?? null);
    };

    const handleYourWord = ({ word }: { word: string }) => {
      setDrawWord(word);
    };

    socket.on("room-not-found", handleRoomNotFound);
    socket.on("players-update", handlePlayersUpdate);
    socket.on("round-start", handleRoundStart);
    socket.on("game-paused", handleGamePaused);
    socket.on("game-state", handleGameState);
    socket.on("your-word", handleYourWord);

    return () => {
      socket.off("room-not-found", handleRoomNotFound);
      socket.off("players-update", handlePlayersUpdate);
      socket.off("round-start", handleRoundStart);
      socket.off("game-paused", handleGamePaused);
      socket.off("game-state", handleGameState);
      socket.off("your-word", handleYourWord);
    };
  }, [name, playerId, roomId]);

  useEffect(() => {
    const handler = ({ word }: { word: string }) => {
      setLastWord(word);
      setShowRoundEndModal(true);

      window.setTimeout(() => {
        setShowRoundEndModal(false);
      }, 4000);
    };

    socket.on("round-end", handler);
    return () => {
      socket.off("round-end", handler);
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      setShowGameEnd(false);
      setFinalPlayers([]);
      setActivePanel("canvas");
    };

    socket.on("game-restarted", handler);
    return () => {
      socket.off("game-restarted", handler);
    };
  }, []);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-blue-300 font-display">
      {showGameEnd && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/70 p-4">
          <Confetti />

          <div className="w-full max-w-md rounded-2xl border-2 border-black bg-white p-6 text-center shadow-xl">
            <h2 className="mb-2 text-2xl font-bold">Winner: {winner?.name}</h2>
            <p className="mb-4 text-gray-600">Final Score: {winner?.score}</p>

            <div className="mb-4 flex max-h-60 flex-col gap-2 overflow-y-auto">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                    index === 0 ? "bg-yellow-100 font-bold" : "bg-gray-100"
                  }`}
                >
                  <span>
                    {index + 1}. {player.name}
                  </span>
                  <span>{player.score}</span>
                </div>
              ))}
            </div>

            {sortedPlayers.find((player) => player.id === playerId)?.isHost && (
              <button
                onClick={() => socket.emit("restart-game", { roomId })}
                className="w-full rounded-xl border-2 border-black bg-violet-500 px-4 py-2 text-white shadow-md"
              >
                Restart Game
              </button>
            )}
          </div>
        </div>
      )}

      {showRoundSummary && roundInfo && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border-2 border-black bg-white p-6 text-center shadow-xl">
            <h2 className="mb-2 text-xl font-bold">Round {roundInfo.round} Finished!</h2>
            <p className="mb-4 text-gray-600">
              Next Round: <span className="font-bold">{roundInfo.nextRound}</span>
            </p>

            <div className="flex max-h-60 flex-col gap-2 overflow-y-auto">
              {[...players]
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                      index === 0 ? "bg-yellow-100 font-bold" : "bg-gray-100"
                    }`}
                  >
                    <span>
                      {index + 1}. {player.name}
                    </span>
                    <span>{player.score}</span>
                  </div>
                ))}
            </div>

            <p className="mt-3 text-xs text-gray-500">Starting next round...</p>
          </div>
        </div>
      )}

      {showRoundEndModal && (
        <div className="absolute left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
          <div className="rounded-xl border-2 border-black bg-green-500 px-4 py-2 text-center font-semibold text-white shadow-lg sm:px-6">
            Word was: {lastWord}
          </div>
        </div>
      )}

      {showRoundStartModal && currentDrawerId && (
        <div className="absolute left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
          <div className="rounded-xl border-2 border-black bg-violet-500 px-4 py-2 text-center font-semibold text-white shadow-lg sm:px-6">
            {drawer?.name || "Someone"} is drawing!
          </div>
        </div>
      )}

      {showNameModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-lg">
            <h2 className="mb-3 text-xl font-bold">Enter Your Name</h2>

            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="mb-3 w-full rounded border px-3 py-2"
              placeholder="Your name"
            />

            <button
              onClick={handleNameSubmit}
              className="w-full rounded bg-violet-500 px-4 py-2 text-white"
            >
              Join Game
            </button>
          </div>
        </div>
      )}

      {gameState === "waiting" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white px-6 py-4 text-center shadow-lg">
            <h2 className="text-xl font-bold">Waiting for players...</h2>
            <p className="mt-2 text-gray-600">Invite friends to join the room</p>
            <p className="mt-2 text-sm">Room ID: {roomId}</p>
          </div>
        </div>
      )}

      <div className={`h-[100dvh] w-full overflow-hidden ${gameState === "waiting" ? "pointer-events-none blur-sm" : ""}`}>
        <div className="mx-auto flex h-full w-full max-w-[1800px] flex-col gap-3 p-3 sm:gap-4 sm:p-4">
          <div className="flex items-center justify-between rounded-2xl border-2 border-black bg-white/80 px-4 py-3 shadow-lg backdrop-blur-sm">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
                Room {roomId}
              </p>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">Doodle Dash</h1>
            </div>

            <div className="rounded-full border-2 border-black bg-violet-500 px-3 py-1 text-sm font-semibold text-white shadow-sm">
              {players.length} player{players.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="hidden min-h-0 flex-1 gap-4 xl:grid xl:grid-cols-[minmax(260px,0.95fr)_minmax(0,1.8fr)_minmax(280px,1fr)]">
            <Rank players={players} />
            <Canvas
              roomId={roomId!}
              currentDrawerId={currentDrawerId}
              playerId={playerId}
              drawWord={drawWord}
              wordLength={wordLength}
            />
            <Chat roomId={roomId!} />
          </div>

          <div className="hidden min-h-0 flex-1 gap-4 lg:flex xl:hidden">
            <div className="min-h-0 w-[280px] shrink-0">
              <Rank players={players} />
            </div>
            <div className="min-h-0 min-w-0 flex-1">
              <Canvas
                roomId={roomId!}
                currentDrawerId={currentDrawerId}
                playerId={playerId}
                drawWord={drawWord}
                wordLength={wordLength}
              />
            </div>
          </div>

          <div className="relative min-h-0 flex-1 lg:hidden">
            <div className="absolute inset-0">
              <div className={activePanel === "canvas" ? "h-full" : "hidden h-full"}>
                <Canvas
                  roomId={roomId!}
                  currentDrawerId={currentDrawerId}
                  playerId={playerId}
                  drawWord={drawWord}
                  wordLength={wordLength}
                />
              </div>

              <div className={activePanel === "rank" ? "h-full" : "hidden h-full"}>
                <Rank players={players} />
              </div>

              <div className={activePanel === "chat" ? "h-full" : "hidden h-full"}>
                <Chat roomId={roomId!} />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-3">
              <div className="pointer-events-auto flex w-full max-w-md items-center justify-center gap-2 rounded-full border-2 border-black bg-white/95 p-2 shadow-xl backdrop-blur">
                <button
                  onClick={() => setActivePanel("rank")}
                  className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
                    activePanel === "rank" ? "bg-violet-500 text-white" : "bg-white text-slate-700"
                  }`}
                >
                  Leaderboard
                </button>
                <button
                  onClick={() => setActivePanel("canvas")}
                  className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
                    activePanel === "canvas" ? "bg-violet-500 text-white" : "bg-white text-slate-700"
                  }`}
                >
                  Canvas
                </button>
                <button
                  onClick={() => setActivePanel("chat")}
                  className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
                    activePanel === "chat" ? "bg-violet-500 text-white" : "bg-white text-slate-700"
                  }`}
                >
                  Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Room;
