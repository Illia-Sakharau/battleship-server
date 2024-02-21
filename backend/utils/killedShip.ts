import { Board, ShipCell } from "../types";

type Props = {
  board: Board;
  x: number;
  y: number;
}

function findShipHead({ board, x, y }: Props) {
  const shipCell = board[y][x] as ShipCell;
  if (shipCell.prev) {
    if (shipCell.direction) {
      return findShipHead({ board, x, y: y-1 })
    } else {
      return findShipHead({ board, x: x-1, y })
    }
  }
  return [x, y]
}

export function killedShip({ board, x, y }: Props) {
  let [headX, headY] = findShipHead({ board, x, y });
  let shipCell = board[headY][headX] as ShipCell | boolean;
  const cor = {
    start: { x: headX, y: headY },
    end: { x, y },
  }

  while(typeof shipCell !== 'boolean' && shipCell !== undefined) {
    if (!shipCell.value) {
      return false;
    }
     
    if (shipCell.direction) {
      headY += 1;
      if (shipCell.next) cor.end.y = headY;
    } else {
      headX += 1;
      if (shipCell.next) cor.end.x = headX;
    }

    if (headY < 10 && headX < 10) {
      shipCell = board[headY][headX] as ShipCell;
    } else {
      shipCell = false
    }
  }
  
  return cor;
}
