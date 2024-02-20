import { WebSocket } from 'ws';
import { Room, User } from "../types";
import { ROOMS_DB, USERS_DB } from '..';

let roomIdCounter = 0;

export const createRoom = (ws: WebSocket) => {
  const currentUser = USERS_DB.get(ws) as User;
  const newRoom: Room = {
    id: roomIdCounter++,
    roomUsers: [{
      id: currentUser.id,
      name: currentUser.name,
    }]
  }
  ROOMS_DB.set(newRoom.id, newRoom)
  currentUser.roomID = newRoom.id
  
  // send rooms for all
  updateRoomsForAll()
}

export const updateRoomsForAll = () => {
  Array.from(USERS_DB.keys()).forEach((ws) => updateRooms(ws))
}

export const updateRooms = (ws: WebSocket) => ws.send(JSON.stringify({
  type: "update_room",
  data: JSON.stringify(
    Array.from(ROOMS_DB.values())
      .filter((room) => room.roomUsers.length === 1)
      .map((room) => ({
        roomID: room.id,
        roomUsers: [
          {
            name: room.roomUsers[0].name,
            index: room.roomUsers[0].id,
          }
        ]
      }))
  ),
  id: 0,
}))
