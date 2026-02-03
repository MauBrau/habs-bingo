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
} from "../interface/IBingoBoard";
import { JSX, ReactElement, useCallback, useEffect, useState } from "react";
import BingoBoardData from '../assets/bingo-board.json';

export const thisIsAnUnusedExport = "this export only exists to disable fast refresh for this file";
export default function BingoCard() {
    const [bingoData, setBingoData] = useState<BingoBoard>(BingoBoardData as BingoBoard);
    const [bingoOptions, setBingoOptions] = useState<BingoOptions>(bingoData.bingoOptions);
    const [players, setPlayers] = useState<Player[]>(bingoData.players.filter((player: Player) => player.isActivePlayer && player.position !== PlayerPositions.Goalie));
    const [tiles, setTiles] = useState<string[]>([]);

    let usedPlayersCount = 0, usedPenaltyCount = 0;

    const NUM_TILES: number = 25;

    useEffect(() => {
        setTiles(generateBoard());
    }, []);
   
    function generateBoard() {
        // TODO: Make an array of randomly selected bingo options. No duplicates if theyre generic.
        // Up to 1 dup if player specific
        let generatedBoard : string[] = [];
        console.log('bingo data:   ');
        console.log(bingoData);
        for (let i = 0; i < NUM_TILES; i++) {
            let bingoTileOption: BingoTileOption, randomValue: number;
            do {
                randomValue = getRandomInt(bingoData.bingoTileOptions.length);
                bingoTileOption = bingoData.bingoTileOptions[randomValue];
            } while (conditionChecker(bingoTileOption, bingoOptions));

            bingoTileOption.isOnCardCount = bingoTileOption.isOnCardCount ? bingoTileOption.isOnCardCount + 1 : 1;

            if (bingoTileOption.type === BingoCardType.PlayerSpecific) {
                let randomPlayer: Player;
                do {
                    randomPlayer = players[getRandomInt(players.length)];
                } while ( randomPlayer.isOnCard );

                randomPlayer.isOnCard = true;
                usedPlayersCount++;
                generatedBoard.push(`${randomPlayer.name}${bingoTileOption.text}`);

            } else if (bingoTileOption.type === BingoCardType.Penalty) {
                let penaltyOption : PenaltyTypes;
                do {
                    penaltyOption =
                        bingoData.penaltyTypes[
                            getRandomInt(bingoData.penaltyTypes.length)
                        ];
                } while (penaltyOption.isOnCard);
                penaltyOption.isOnCard = true;
                usedPenaltyCount++;
                generatedBoard.push("Penalty:" + penaltyOption.text);
            }
            else {
                generatedBoard.push(bingoTileOption.text);
            }

            // If we run out of players for player-specific tile options (somehow), prevent the code from pulling player-specific options
            if (usedPlayersCount === players.length) {
                bingoData.bingoTileOptions = bingoData.bingoTileOptions.filter(
                    (option : BingoTileOption) => option.type !== BingoCardType.PlayerSpecific,
                );
            }
        }
        return generatedBoard;
    }

    function getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }

    function conditionChecker(tileType: BingoTileOption, bingoOptions: BingoOptions) {
        let type = tileType.type;

        // TODO: Clean up, it's ugly
        if (type === BingoCardType.Penalty && usedPenaltyCount === bingoOptions.penaltyLimit) {
            return true;
        }
        if (type === BingoCardType.PlayerSpecific && usedPlayersCount === bingoOptions.playerLimit) {
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

    return (
        tiles.length > 0 ?
        <div className="items-center bg-white max-w-s p-6 rounded-lg">
            <div className={`h-200 w-200 grid grid-cols-5 grid-rows-5 gap-4`}>
                {tiles.map((tile, index) => <BingoTile key={index} text={tile} />)}
            </div>
        </div> : <div/>
    );
}
