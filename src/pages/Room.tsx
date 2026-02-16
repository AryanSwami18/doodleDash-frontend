import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { socket } from '../lib/socket';
import { getPlayerId, getPlayerName } from '../lib/player';
function Room() {
  const { roomId } = useParams();
  const playerId = getPlayerId();
  const name = getPlayerName();

  useEffect(()=>{
    if(!socket.connected){
      socket.connect();
    }

    socket.emit("join-room",{roomId,name,playerId});
      socket.on("room-not-found",()=>{
        alert("Room not found!");
      })    

    socket.on("players-update",(players)=>{
      console.log("Players in room:",players)
      })
      return ()=>{
        socket.off("room-not-found")
        socket.off("players-update")
        }
      ;
  });
  
  return (
    <div>Room {roomId}</div>
  )
}

export default Room