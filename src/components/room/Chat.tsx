import { useEffect, useRef, useState } from "react";
import ChatBox from "../chat/ChatBox";
import { socket } from "../../lib/socket";

type Props = {
  roomId: string;
};

type Message = {
  type: "chat" | "system";
  player?: string;
  message: string;
};

function Chat({ roomId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    socket.emit("send-message", { roomId, message: inputMessage });
    setInputMessage("");
  };

  useEffect(() => {
    const handleMessageSent = ({ player, message }: { player: string; message: string }) => {
      setMessages((prev) => [...prev, { type: "chat", player, message }]);
    };

    const handleCorrectGuess = ({ playerName }: { playerName: string }) => {
      setMessages((prev) => [
        ...prev,
        { type: "system", message: `${playerName} guessed the word!` },
      ]);
    };

    const handleRoundStart = () => {
      setMessages([]);
    };

    socket.on("message-sent", handleMessageSent);
    socket.on("correct-guess", handleCorrectGuess);
    socket.on("round-start", handleRoundStart);

    return () => {
      socket.off("message-sent", handleMessageSent);
      socket.off("correct-guess", handleCorrectGuess);
      socket.off("round-start", handleRoundStart);
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-2 rounded-xl border-2 border-black bg-gray-200 p-3 shadow-lg">
      <div className="w-full rounded-xl border-2 border-black bg-violet-500 p-2 text-center text-lg font-bold text-white">
        Chat
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-xl border-2 bg-white p-2">
        {messages.map((msg, index) => (
          <ChatBox
            key={index}
            type={msg.type}
            player={msg.player}
            message={msg.message}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex w-full flex-col gap-2 rounded-xl border-2 bg-white p-2 sm:flex-row sm:items-center">
        <input
          type="text"
          className="flex-1 rounded-xl border-2 border-black p-2"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(event) => setInputMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendMessage();
          }}
        />
        <button
          className="rounded-xl border-2 border-black bg-violet-500 px-4 py-2 text-white shadow-md"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
