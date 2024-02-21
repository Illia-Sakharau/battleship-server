import { Board, ShipCell } from "../types";

export function nextClosedCell(board: Board): [number, number] {
  let x: number = 0;
  let y: number = 0;
  
  rows: for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const isWater = typeof board[i][j] === 'boolean';
      const isClosed = isWater ? !board[i][j] : !(board[i][j] as ShipCell).value
      if (isClosed) {
        x = j;
        y = i;
        break rows;
      }
    }
  }
  
  return [x, y];
}