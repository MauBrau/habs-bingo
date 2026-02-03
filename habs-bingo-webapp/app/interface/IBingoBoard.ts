export enum PlayerPositions {
    Winger = "Winger",
    Defenceman = "Defenceman",
    Centre = "Centre",
    Goalie = "Goalie"
}

export enum BingoCardType {
    Generic = "Generic",
    PlayerSpecific = "Player",
    Penalty = "Penalty"
}

export interface Player {
    name: string
    position: PlayerPositions,
    isActivePlayer: Boolean,
    isOnCard?: Boolean
}

export interface BingoOptions {
    penaltyLimit: number,
    playerLimit: number
}

export interface PenaltyTypes {
    text: string,
    isOnCard?: Boolean
}

export interface BingoTileOption {
    text: string,
    type: BingoCardType,
    isOnCardCount?: number;
}

export interface BingoBoard {
    bingoOptions: BingoOptions,
    players: Player[],
    bingoTileOptions: BingoTileOption[]
    penaltyTypes: PenaltyTypes[];
}
