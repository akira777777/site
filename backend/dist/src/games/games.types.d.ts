export interface SlotOutcome {
    reels: string[];
    seed: string;
    multiplier: number;
}
export interface SlotSpinResult extends SlotOutcome {
    betId: string;
    betAmount: string;
    winAmount: string;
    balance: string;
}
