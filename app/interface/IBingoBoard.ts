export enum PlayerPositions {
    Winger = "Winger",
    Defenceman = "Defenceman",
    Centre = "Centre",
    Goalie = "Goalie"
}

export enum BingoCardType {
    Generic = "Generic",
    PlayerSpecific = "Player",
    Penalty = "Penalty",
    Silly = "Silly"
}
export interface TileStatus {
    text: string,
    isChecked: boolean,
    isLocked?: boolean
}

export interface Player {
    name: string
    position: PlayerPositions,
    isActivePlayer: boolean,
    isOnCard?: boolean
}

export interface BingoOptions {
    penaltyLimit: number,
    playerLimit: number
}

export interface PenaltyTypes {
    text: string,
    isOnCard?: boolean
}

export interface BingoTileOption {
    text: string,
    type: BingoCardType,
    isOnCardCount?: number;
}

export interface BingoBoard {
    bingoOptions: BingoOptions,
    players: Player[],
    bingoTileOptions: BingoTileOption[],
    bingoTileOptionsSilly: BingoTileOption[],
    penaltyTypes: PenaltyTypes[];
}
