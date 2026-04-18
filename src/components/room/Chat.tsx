import React, { useEffect, useRef, useState } from 'react'
import ChatBox from '../chat/ChatBox'
import { socket } from '../../lib/socket';

type Props = {
  roomId: string;
}

function Chat({ roomId }: Props) {
  type Message = {
    type: "chat" | "system";
    player?: string;
    message: string;
  };

  const [messages, setMessages] = useState<Message[]>([]);

  const [inputMessage, setInputMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    socket.emit("send-message", { roomId: roomId, message: inputMessage });
    setInputMessage('');
  }

  useEffect(() => {
    socket.on("message-sent", ({ player, message }: { player: string; message: string }) => {
      setMessages((prev) => [...prev, { type: "chat", player, message }]);
    });

    socket.on("correct-guess", ({ playerName }: { playerName: string }) => {
      setMessages((prev) => [...prev, { type: "system", message: `${playerName} guessed the word!` }]);
    }
    );

    socket.on("round-start", () => {
      setMessages([]);
    });


    return () => {
      socket.off("message-sent");
      socket.off("correct-guess");
      socket.off("round-start");
    };
  }, []);





  return (
    <div className='flex flex-col  w-full sm:w-1/3 gap-2 h-full p-3 justify-start items-center bg-gray-200 rounded-xl border-2 border-black shadow-lg'>
      <div className='bg-violet-500 rounded-xl p-2 border-2 w-full border-black text-center font-bold text-lg text-white'>
        Chat
      </div>
      <div className='flex flex-col overflow-y-auto bg-white border-2 w-full h-full rounded-xl p-2 gap-2' ref={bottomRef}>
        {/* Messages */}
        {messages.map((msg, index) => (
          <ChatBox
            key={index}
            type={msg.type}
            player={msg.player}
            message={msg.message}
          />
        ))}
      </div>

      <div className='bg-white border-2 rounded-xl p-2 w-full flex flex-row gap-2 items-center justify-between'>
        <input type="text" className='flex-1 border-2 border-black rounded-xl p-2' placeholder='Type your message...' value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
        <button className='bg-violet-500 text-white px-4 py-2 rounded-xl border-2 border-black shadow-md'
          onClick={sendMessage}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}>
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat