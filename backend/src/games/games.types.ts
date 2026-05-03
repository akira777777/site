export interface SlotOutcome {
  grid: string[][];
  seed: string;
  nearMiss: boolean;
  multiplier?: number;
  effectiveRTP?: number;
}

export interface SlotSpinResult extends SlotOutcome {
  betId: string;
  betAmount: string;
  winAmount: string;
  balance: string;
}
