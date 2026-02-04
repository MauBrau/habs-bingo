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
import Image from "next/image";
import { Dialog, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import BingoBoardData from "../assets/bingo-board.json";

export const thisIsAnUnusedExport =
    "this export only exists to disable fast refresh for this file";

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
    const [open, setOpen] = useState<boolean>(false);

    let usedPlayersCount = 0,
        usedPenaltyCount = 0;

    const NUM_TILES: number = 25;
    const FREE_SPACE: number = 12;

    useEffect(() => {
        if (
            localStorage.getItem("tiles") &&
            localStorage.getItem("generationDate")
        ) {
            const lastDate = new Date(
                localStorage.getItem("generationDate") as string,
            );
            const timeSince = new Date().getTime() - lastDate.getTime();
            if (timeSince >= 60 * 60 * 24 * 1000) {
                storeBoard();
            } else {
                const existingBoard = JSON.parse(
                    localStorage.getItem("tiles") as string,
                );
                setTiles(existingBoard);
            }
        } else {
            storeBoard();
        }
    }, []);

    const storeBoard = () => {
        let generatedBoard = generateBoard();
        generatedBoard[FREE_SPACE] = {
            text: "FREE",
            isChecked: true,
        };
        localStorage.setItem("tiles", JSON.stringify(generatedBoard));
        localStorage.setItem("generationDate", new Date().toString());
        setTiles(generatedBoard);
    };

    const generateBoard = () => {
        let generatedBoard: TileStatus[] = [];
        for (let i = 0; i < NUM_TILES; i++) {
            let bingoTileOption: BingoTileOption, randomValue: number;
            do {
                randomValue = getRandomInt(bingoData.bingoTileOptions.length);
                bingoTileOption = bingoData.bingoTileOptions[randomValue];
            } while (tileTypeChecker(bingoTileOption, bingoOptions));

            bingoTileOption.isOnCardCount =
                (bingoTileOption.isOnCardCount ?? 0) + 1;

            if (bingoTileOption.type === BingoCardType.PlayerSpecific) {
                let randomPlayer: Player;
                do {
                    randomPlayer = players[getRandomInt(players.length)];
                } while (randomPlayer.isOnCard);

                randomPlayer.isOnCard = true;
                usedPlayersCount++;
                generatedBoard.push({
                    text: `${randomPlayer.name}${bingoTileOption.text}`,
                    isChecked: false,
                });
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
                generatedBoard.push({
                    text: "Penalty:" + penaltyOption.text,
                    isChecked: false,
                });
            } else {
                generatedBoard.push({
                    text: bingoTileOption.text,
                    isChecked: false,
                });
            }
        }
        return generatedBoard;
    };

    const getRandomInt = (max: number) => {
        return Math.floor(Math.random() * max);
    };

    const tileTypeChecker = (
        tileType: BingoTileOption,
        bingoOptions: BingoOptions,
    ) => {
        let type = tileType.type;

        // TODO: Clean up, it's ugly
        if (
            type === BingoCardType.Penalty &&
            usedPenaltyCount === bingoOptions.penaltyLimit
        ) {
            return true;
        }
        if (
            type === BingoCardType.PlayerSpecific &&
            usedPlayersCount === bingoOptions.playerLimit
        ) {
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
    };

    const handleClick = (index: number) => {
        tiles[index].isChecked = !tiles[index].isChecked;
        localStorage.setItem("tiles", JSON.stringify(tiles));
    };

    const clearOptions = () => {
        // reset board data
        // setBingoData({...BingoBoardData} as BingoBoard); // i Wish you worked
        let newBingoData = { ...bingoData };
        newBingoData.bingoTileOptions = newBingoData.bingoTileOptions.map(
            (bingoTileOption: BingoTileOption) => {
                bingoTileOption.isOnCardCount = 0;
                return bingoTileOption;
            },
        );

        newBingoData.penaltyTypes = newBingoData.penaltyTypes.map(
            (penalty: PenaltyTypes) => {
                penalty.isOnCard = false;
                return penalty;
            },
        );

        let newPlayers = players.map((player: Player) => {
            player.isOnCard = false;
            return player;
        });

        setPlayers(newPlayers);
        setBingoData(newBingoData);
        setTiles([]);

        usedPenaltyCount = 0;
        usedPlayersCount = 0;
    };

    const newCardConfirmation = () => {
        setOpen(true);
    };
    const handleConfirm = () => {
        clearOptions();
        storeBoard();
        setOpen(false);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return tiles.length > 0 ? (
        <div className="bg-white h-full sm:p-6 p-2 rounded-lg">
            <div className="pb-4">
                <div className="flex flex-wrap items-center justify-between">
                    <Image
                        src="/unofficial-habs-bingo.svg"
                        alt="Unofficial Habs Bingo logo"
                        width={525}
                        height={150}
                        priority
                    />
                    <button
                        onClick={newCardConfirmation}
                        className="bg-habs-red hover:bg-habs-blue text-white font-bold py-2 px-4 rounded cursor-pointer"
                    >
                        New Card?
                    </button>
                </div>
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                >
                    <DialogTitle id="alert-dialog-title">
                        Generate a new card?
                    </DialogTitle>
                    <div className="flex items-center justify-between p-6">
                        <button
                            className="bg-habs-red hover:bg-habs-blue text-white font-bold py-2 px-4 rounded cursor-pointer"
                            onClick={handleConfirm}
                        >
                            Sure
                        </button>
                        <button
                            className="bg-habs-red hover:bg-habs-blue text-white font-bold py-2 px-4 rounded cursor-pointer"
                            onClick={handleClose}
                        >
                            Never mind
                        </button>
                    </div>
                </Dialog>
            </div>
            <div className="sm:aspect-square sm:w-200 grid grid-cols-5 grid-rows-5 gap-3">
                {tiles.map((tile, index) => (
                    <BingoTile
                        key={index}
                        text={tile.text}
                        isChecked={tile.isChecked}
                        onClick={() => handleClick(index)}
                    />
                ))}
            </div>
        </div>
    ) : (
        <div />
    );
}
