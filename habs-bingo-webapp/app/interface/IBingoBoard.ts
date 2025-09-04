export enum PlayerPositions {
    Winger = "Winger",
    Defenceman = "Defenceman",
    Centre = "Centre",
    Goalie = "Goalie"
}

export enum BingoCardType {
    Generic = "Generic",
    PlayerSpecific = "Player"
}

export interface Player {
    name: String,
    position: PlayerPositions,
    isActivePlayer: Boolean
}


export interface BingoOption {
    text: String,
    type: BingoCardType
}

export interface BingoBoard {
    players: Player[],
    bingoOptions: BingoOption[]
}
