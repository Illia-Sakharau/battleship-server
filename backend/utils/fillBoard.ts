import { Board, Ship } from "../types";

export function fillBoard(ships: Ship[]): Board {
  const board = new Array(10).fill(0).map(() => Array(10).fill(0));

  ships.forEach((ship) => {
    let x = ship.position.x;
    let y = ship.position.y;

    for (let i = 1; i <= ship.length; i++) {
      const next = i < ship.length;
      const prev = i > 1;
      board[y][x] = {
        value: 1,
        next,
        prev,
        direction: ship.direction,
      };
      if (ship.direction) {
        y++;
      } else {
        x++
      }
    }
  })

  
  return board;
}