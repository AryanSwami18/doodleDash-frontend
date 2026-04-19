type props = {
  type: "chat" | "system";
  player?: string;
  message: string;
}

function ChatBox({ type, player, message }: props) {
  const isSystem = type === "system";

  return (
    <div
      className={`flex flex-col gap-2 border-2 rounded-xl p-2 w-full 
        ${isSystem 
          ? "bg-green-100 border-green-400" 
          : "bg-gray-100 border-gray-300"
        }`}
    >
      <div
        className={`text-left font-bold text-sm 
          ${isSystem ? "text-green-700" : "text-black"}`}
      >
        {isSystem ? "System" : player}
      </div>

      <div
        className={`text-left 
          ${isSystem ? "text-green-800 font-semibold" : "text-black"}`}
      >
        {message}
      </div>
    </div>
  );
}
export default ChatBox
