import { Board } from "../types";

export function finishGameChecker(board: Board): boolean {  
  return board.every((row) => row.every((cell) => typeof cell === 'boolean' ? true : cell.value))
}
