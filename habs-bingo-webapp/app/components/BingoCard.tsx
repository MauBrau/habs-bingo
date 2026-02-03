"use client";
import BingoTile from "./BingoTile";
import {
    BingoBoard,
    BingoCardType,
    BingoOptions,
    BingoTileOption,
    PenaltyTypes,
    Player,
    PlayerPositions,
    TileStatus,
} from "../interface/IBingoBoard";
import { useEffect, useState } from "react";
import BingoBoardData from "../assets/bingo-board.json";

export const thisIsAnUnusedExport = "this export only exists to disable fast refresh for this file";

export default function BingoCard() {
    const [bingoData, setBingoData] = useState<BingoBoard>(
        BingoBoardData as BingoBoard,
    );
    const bingoOptions = bingoData.bingoOptions;

    const [players, setPlayers] = useState<Player[]>(
        bingoData.players.filter(
            (player: Player) =>
                player.isActivePlayer &&
                player.position !== PlayerPositions.Goalie,
        ),
    );
    const [tiles, setTiles] = useState<TileStatus[]>([]);

    let usedPlayersCount = 0, usedPenaltyCount = 0;

    const NUM_TILES: number = 25;
    const FREE_SPACE: number = 12;

    useEffect(() => {
        if (localStorage.getItem('tiles') && localStorage.getItem('generationDate')) {
            const lastDate = new Date(localStorage.getItem('generationDate') as string);
            const timeSince = new Date().getTime() - lastDate.getTime();
            if (timeSince >= 60 * 60 * 24 * 1000 ) {
                storeBoard();
            } else {
                const existingBoard = JSON.parse(localStorage.getItem('tiles') as string);
                setTiles(existingBoard)
            }
        } else {
            storeBoard();
        }
        
    }, []);

    function storeBoard() {
        let generatedBoard = generateBoard();
        generatedBoard[FREE_SPACE] =  {
            text: "FREE",
            isChecked: false
        };
        localStorage.setItem('tiles', JSON.stringify(generatedBoard));
        localStorage.setItem('generationDate', new Date().toString());
        setTiles(generatedBoard);
    }

    function generateBoard() {
        let generatedBoard: TileStatus[] = [];
        for (let i = 0; i < NUM_TILES; i++) {
            let bingoTileOption: BingoTileOption, randomValue: number;
            do {
                randomValue = getRandomInt(bingoData.bingoTileOptions.length);
                bingoTileOption = bingoData.bingoTileOptions[randomValue];
            } while (tileTypeChecker(bingoTileOption, bingoOptions));

            bingoTileOption.isOnCardCount = (bingoTileOption.isOnCardCount ?? 0) + 1;

            if (bingoTileOption.type === BingoCardType.PlayerSpecific) {
                let randomPlayer: Player;
                do {
                    randomPlayer = players[getRandomInt(players.length)];
                } while (randomPlayer.isOnCard);

                randomPlayer.isOnCard = true;
                usedPlayersCount++;
                generatedBoard.push(
                    {
                        text: `${randomPlayer.name}${bingoTileOption.text}`,
                        isChecked: false
                    }
                );
            } else if (bingoTileOption.type === BingoCardType.Penalty) {
                let penaltyOption: PenaltyTypes;
                do {
                    penaltyOption =
                        bingoData.penaltyTypes[
                            getRandomInt(bingoData.penaltyTypes.length)
                        ];
                } while (penaltyOption.isOnCard);

                penaltyOption.isOnCard = true;
                usedPenaltyCount++;
                generatedBoard.push(
                    {
                        text: "Penalty:" + penaltyOption.text,
                        isChecked: false
                    }
                );
            } else {
                generatedBoard.push(
                    {
                        text: bingoTileOption.text,
                        isChecked: false
                    }
                );
            }
        }
        return generatedBoard;
    }

    function getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }

    function tileTypeChecker(
        tileType: BingoTileOption,
        bingoOptions: BingoOptions,
    ) {
        let type = tileType.type;

        // TODO: Clean up, it's ugly
        if ( type === BingoCardType.Penalty && usedPenaltyCount === bingoOptions.penaltyLimit ) {
            return true;
        }
        if ( type === BingoCardType.PlayerSpecific && usedPlayersCount === bingoOptions.playerLimit ) {
            return true;
        }
        if (tileType.isOnCardCount) {
            if (type === BingoCardType.Generic) {
                return true;
            } else {
                return tileType.isOnCardCount > 1;
            }
        }
        return false;
    }

    const handleClick = (tile: TileStatus, index: number) => {
        tiles[index].isChecked = !tiles[index].isChecked;
        localStorage.setItem('tiles', JSON.stringify(tiles));
    };

    return tiles.length > 0 ? (
        <div className="items-center bg-white max-w-s p-6 rounded-lg">
            <div className={`h-200 w-200 grid grid-cols-5 grid-rows-5 gap-4`}>
                {tiles.map((tile, index) => (
                    <BingoTile key={index} text={tile.text} isChecked={tile.isChecked} onClick={() => handleClick(tile, index)} />
                ))}
            </div>
        </div>
    ) : (
        <div />
    );
}
