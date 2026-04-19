import { io } from "socket.io-client";

const url = import.meta.env.VITE_BACKEND_URL;


export const socket = io(url, {
   transports: ["websocket"],
   autoConnect:false,
})

socket.on("connect_error",()=>{
      console.error("Connection Error. Retrying...");
      socket.connect();
});
   
