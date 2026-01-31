
export interface RollHistoryItem {
  id: string;
  timestamp: number;
  values: number[];
  sum: number;
}

export interface DiceState {
  values: number[];
  isRolling: boolean;
}
