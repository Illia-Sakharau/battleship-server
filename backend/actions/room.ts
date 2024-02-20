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
      ws,
      name: currentUser.name,
    }],
    boards: [],
    ships: [],
  }
  ROOMS_DB.set(newRoom.id, newRoom)
  currentUser.roomID = newRoom.id
  
  updateRoomsForAll()
}

export const addUserToRoom = (ws: WebSocket, roomId: number) => {
  const room = ROOMS_DB.get(roomId) as Room;
  const connectingUser = USERS_DB.get(ws) as User;
  if (room?.roomUsers[0].id === connectingUser?.id) {
    console.log('The user is already in the room');
    return
  }
  connectingUser.roomID = room?.id;
  room?.roomUsers.push({
    id: connectingUser.id,
    ws,
    name: connectingUser.name,
  })

  updateRoomsForAll();

  room?.roomUsers.forEach((user, i) => {
    user.ws.send(JSON.stringify({
      type: "create_game",
      data: JSON.stringify({
        idGame: room.id,
        idPlayer: i,
      }),
      id: 0,
    }))
  });
}

export const updateRoomsForAll = () => {
  Array.from(USERS_DB.keys()).forEach((ws) => updateRooms(ws))
}

export const updateRooms = (ws: WebSocket) => {
  const preparedRooms = Array.from(ROOMS_DB.values())
    .filter((room) => room.roomUsers.length === 1)
    .map((room) => ({
      roomId: room.id,
      roomUsers: [
        {
          name: room.roomUsers[0].name,
          index: room.roomUsers[0].id,
        }
      ]
    }))

  ws.send(JSON.stringify({
    type: "update_room",
    data: JSON.stringify(preparedRooms),
    id: 0,
  }))
}
