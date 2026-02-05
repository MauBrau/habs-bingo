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
    const SIZE: number = 5;
    const NUM_TILES: number = SIZE * SIZE;
    const FREE_SPACE: number = 12;
    const BLANK_STATE = [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, true, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
    ];

    const [bingoData, setBingoData] = useState<BingoBoard>(
        BingoBoardData as BingoBoard,
    );
    const bingoOptions: BingoOptions = bingoData.bingoOptions;
    const [cardState, setCardState] = useState<boolean[][]>(BLANK_STATE);
    const [currentBingos, setCurrentBingos] = useState<number[][]>([]);

    const [players, setPlayers] = useState<Player[]>(
        bingoData.players.filter(
            (player: Player) =>
                player.isActivePlayer &&
                player.position !== PlayerPositions.Goalie,
        ),
    );
    const [tiles, setTiles] = useState<TileStatus[]>([]);
    const [open, setOpen] = useState<boolean>(false);

    let usedPlayersCount: number = 0,
        usedPenaltyCount: number = 0;

    useEffect(() => {
        if (
            localStorage.getItem("tiles") &&
            localStorage.getItem("generationDate") &&
            localStorage.getItem("cardState") &&
            localStorage.getItem("currentBingos")
        ) {
            const lastDate: Date = new Date(
                localStorage.getItem("generationDate") as string,
            );
            const timeSince: number = new Date().getTime() - lastDate.getTime();
            if (timeSince >= 60 * 60 * 24 * 1000) {
                storeBoard();
            } else {
                const existingBoard: TileStatus[] = JSON.parse(
                    localStorage.getItem("tiles") as string,
                );
                setTiles(existingBoard);
                const existingCardState: boolean[][] = JSON.parse(
                    localStorage.getItem("cardState") as string,
                );
                setCardState(existingCardState);
                const existingBingos: number[][] = JSON.parse(
                    localStorage.getItem("currentBingos") as string,
                );
                setCurrentBingos(existingBingos);
            }
        } else {
            storeBoard();
        }
    }, []);

    const storeBoard = () => {
        let generatedBoard: TileStatus[] = generateBoard();
        generatedBoard[FREE_SPACE] = {
            text: "FREE",
            isChecked: true,
            isLocked: true,
        };
        localStorage.setItem("tiles", JSON.stringify(generatedBoard));
        localStorage.setItem("generationDate", new Date().toString());
        localStorage.setItem("cardState", JSON.stringify(BLANK_STATE));
        localStorage.setItem("currentBingos", JSON.stringify([]));
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

    function arrayComparator<T>(arrayA: T[], arrayB: T[]): boolean {
        return JSON.stringify(arrayA) === JSON.stringify(arrayB);
    }

    const winChecker = () => {
        const C_WIN_INDEXES: number[] = [
            0, 1, 2, 3, 4, 5, 10, 15, 20, 21, 22, 23, 24,
        ];
        const H_WIN_INDEXES: number[] = [
            0, 4, 5, 9, 10, 11, 12, 13, 14, 15, 19, 20, 24,
        ];

        // Rows
        for (let row = 0; row < SIZE; row++) {
            let rowExists = false;
            if (cardState[row].every((cell) => cell === true)) {
                const currentRow = [row, row + 1, row + 2, row + 3, row + 4];
                if (
                    currentBingos.some((curBingo) =>
                        arrayComparator(curBingo, currentRow),
                    )
                ) {
                    continue;
                } else {
                    storeLine(currentRow);
                }
                return true;
            }
        }

        // Columns
        for (let col = 0; col < SIZE; col++) {
            let colWin = true;
            for (let row = 0; row < SIZE; row++) {
                if (cardState[row][col] !== true) {
                    colWin = false;
                    break;
                }
            }
            if (colWin) {
                const currentCol = [
                    col,
                    col + SIZE,
                    col + SIZE * 2,
                    col + SIZE * 3,
                    col + SIZE * 4,
                ];
                if (
                    currentBingos.some((curBingo) =>
                        arrayComparator(curBingo, currentCol),
                    )
                ) {
                    continue;
                } else {
                    storeLine(currentCol);
                }
                return true;
            }
        }

        // Diagonals
        let diag1 = true,
            diag2 = true;
        const diag1Array = [0, 6, 12, 18, 24];
        const diag2Array = [4, 8, 12, 16, 20];
        for (let i = 0; i < SIZE; i++) {
            if (cardState[i][i] !== true) {
                diag1 = false;
            }
            if (cardState[i][SIZE - 1 - i] !== true) {
                diag2 = false;
            }
        }
        const isDiag1AlreadyFound = diag1 && currentBingos.some((curBingo: number[]) => arrayComparator(curBingo, diag1Array));
        const isDiag2AlreadyFound = diag2 && currentBingos.some((curBingo: number[]) => arrayComparator(curBingo, diag2Array));
        if (diag1 || diag2) {
            if (diag1 && diag2 && isDiag1AlreadyFound && isDiag2AlreadyFound) {
                return false;
            } else if (diag1 && diag2) {
                if (isDiag1AlreadyFound) {
                    storeLine(diag2Array);
                } else {
                    storeLine(diag1Array);
                }
            } else if (diag1 && !diag2) {
                if (isDiag1AlreadyFound) {
                    return false;
                } else {
                    storeLine(diag1Array);
                }
            } else if (!diag1 && diag2) {
                if (isDiag2AlreadyFound) {
                    return false;
                } else {
                    storeLine(diag2Array);
                }
            }
            return true;
        }

        return false;
    };

    const storeLine = (newLine: number[]) => {
        const newCurBingos = [...currentBingos, newLine];
        setCurrentBingos(newCurBingos);
        localStorage.setItem("currentBingos", JSON.stringify(newCurBingos));
    };

    const handleClick = (index: number) => {
        tiles[index].isChecked = !tiles[index].isChecked;

        const newCardState = { ...cardState };
        newCardState[Math.floor(index / 5)][index % 5] = tiles[index].isChecked;
        setCardState(newCardState);

        localStorage.setItem("tiles", JSON.stringify(tiles));
        localStorage.setItem("cardState", JSON.stringify(newCardState));

        const isBingo: boolean = winChecker();
        if (isBingo) {
            alert("!!!!!!!!!! BINGO !!!!!!!!!!");
        }
    };

    const clearOptions = () => {
        // reset board data
        // setBingoData({...BingoBoardData} as BingoBoard); // i Wish you worked
        let newBingoData: BingoBoard = { ...bingoData };
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

        let newPlayers: Player[] = players.map((player: Player) => {
            player.isOnCard = false;
            return player;
        });

        setPlayers(newPlayers);
        setBingoData(newBingoData);
        setTiles([]);
        setCardState(BLANK_STATE);
        setCurrentBingos([]);

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
                        tile={tile}
                        onClick={() => handleClick(index)}
                    />
                ))}
            </div>
        </div>
    ) : (
        <div />
    );
}
