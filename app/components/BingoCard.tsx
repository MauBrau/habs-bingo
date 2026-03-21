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
import HabsBingoLogo from "./HabsBingoLogo";
import { Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import SettingsIcon from '@mui/icons-material/Settings';
import BingoBoardData from "../assets/bingo-board.json";
import { Setting, Settings } from "../interface/ISettings";
import { useSettings } from "./SettingsContext";

// export const thisIsAnUnusedExport =
//     "this export only exists to disable fast refresh for this file";

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

    const [tiles, setTiles] = useState<TileStatus[]>([]);
    const [openNewCardPrompt, setOpenNewCardPrompt] = useState<boolean>(false);
    const [openSettings, setOpenSettings] = useState<boolean>(false);

    const { settings, updateSettings } = useSettings();
    const [draftSettings, setDraftSettings] = useState<Settings>(settings);

    useEffect(() => {
        if (openSettings) {
            setDraftSettings(JSON.parse(JSON.stringify(settings)));
        }
    }, [openSettings, settings]);

    const handleToggleDraft = (id: string) => {
        setDraftSettings((prev: Settings) => ({
            ...prev,
            options: prev.options.map((opt) =>
                opt.id === id ? { ...opt, isEnabled: !opt.isEnabled } : opt
            )
        }));
    };

    const getFreshBoardData = () => JSON.parse(JSON.stringify(BingoBoardData)) as BingoBoard;

    useEffect(() => {
        settings.options.forEach((setting, index) => {
            if (setting.cssClass) {
                const isEnabled = (setting.isImmediate && openSettings)
                    ? draftSettings.options[index].isEnabled
                    : setting.isEnabled;

                if (isEnabled) {
                    document.documentElement.classList.add(setting.cssClass);
                } else {
                    document.documentElement.classList.remove(setting.cssClass);
                }
            }
        });
    }, [settings.options, draftSettings.options, openSettings]);

    const [bingoData, setBingoData] = useState<BingoBoard>(getFreshBoardData);
    const [cardState, setCardState] = useState<boolean[][]>(BLANK_STATE);
    const [currentBingos, setCurrentBingos] = useState<number[][]>([]);
    const [gotBingo, setGotBingo] = useState<boolean>(false);
    const [wasGeneratedWithSillyMode, setWasGeneratedWithSillyMode] = useState<boolean>(false);

    const [players, setPlayers] = useState<Player[]>(
        bingoData.players.filter(
            (player: Player) =>
                player.isActivePlayer &&
                player.position !== PlayerPositions.Goalie,
        ),
    );

    const isSillyMode = settings.options.find(o => o.id === "silly_mode")?.isEnabled;

    // Handle Silly Mode reset
    useEffect(() => {
        if (isSillyMode && !wasGeneratedWithSillyMode && tiles.length > 0) {
            refreshCard();
        }
    }, [isSillyMode, wasGeneratedWithSillyMode, tiles.length]);

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
            if (timeSince >= 18 * 60 * 60 * 1000) { // 18 hours
                storeBoard(bingoData);
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
                const wasSilly: boolean = localStorage.getItem("wasGeneratedWithSillyMode") === "true";
                setWasGeneratedWithSillyMode(wasSilly);
            }
        } else {
            storeBoard(bingoData);
        }
    }, []);

    //#region Bingo Board Creation
    const storeBoard = (data: BingoBoard) => {
        let generatedBoard: TileStatus[] = generateBoard(data);
        generatedBoard[FREE_SPACE] = {
            text: "FREE",
            isChecked: true,
            isLocked: true,
        };
        localStorage.setItem("tiles", JSON.stringify(generatedBoard));
        localStorage.setItem("generationDate", new Date().toString());
        localStorage.setItem("cardState", JSON.stringify(BLANK_STATE));
        localStorage.setItem("currentBingos", JSON.stringify([]));
        localStorage.setItem("wasGeneratedWithSillyMode", isSillyMode?.toString() || "false");

        setTiles(generatedBoard);
        setWasGeneratedWithSillyMode(isSillyMode || false);
    };

    const generateBoard = (data: BingoBoard) => {
        let generatedBoard: TileStatus[] = [];
        let usedPlayersCount = 0;
        let usedPenaltyCount = 0;

        const combinedOptions = isSillyMode
            ? [...data.bingoTileOptions, ...data.bingoTileOptionsSilly]
            : data.bingoTileOptions;

        for (let i = 0; i < NUM_TILES; i++) {
            let bingoTileOption: BingoTileOption, randomValue: number;
            do {
                randomValue = getRandomInt(combinedOptions.length);
                bingoTileOption = combinedOptions[randomValue];
            } while (tileTypeChecker(bingoTileOption, data.bingoOptions, usedPlayersCount, usedPenaltyCount));

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
                        data.penaltyTypes[
                        getRandomInt(data.penaltyTypes.length)
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
        usedPlayersCount: number,
        usedPenaltyCount: number
    ) => {
        const { type, isOnCardCount = 0 } = tileType;

        if (type === BingoCardType.Penalty && usedPenaltyCount >= bingoOptions.penaltyLimit) {
            return true;
        }

        if (type === BingoCardType.PlayerSpecific && usedPlayersCount >= bingoOptions.playerLimit) {
            return true;
        }

        if (isOnCardCount > 0) {
            if (type === BingoCardType.Generic) {
                return true;
            }
            return false;
        }

        return false;
    };

    //#endregion

    //#region Win Checker
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
            if (cardState[row].every((cell: boolean) => cell === true)) {
                const currentRow = [row, row + 1, row + 2, row + 3, row + 4];
                if (
                    currentBingos.some((curBingo: number[]) =>
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
                    currentBingos.some((curBingo: number[]) =>
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
    //#endregion

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

        const isBingo: boolean = winChecker();
        setGotBingo(isBingo);

        localStorage.setItem("tiles", JSON.stringify(tiles));
        localStorage.setItem("cardState", JSON.stringify(newCardState));
    };

    const refreshCard = () => {
        const freshData = getFreshBoardData();
        setBingoData(freshData);
        setPlayers(
            freshData.players.filter(
                (player: Player) =>
                    player.isActivePlayer &&
                    player.position !== PlayerPositions.Goalie,
            )
        );
        setTiles([]);
        setCardState(BLANK_STATE);
        setCurrentBingos([]);

        storeBoard(freshData);
    };

    //#region New Card Prompt
    const newCardConfirmation = () => {
        setOpenNewCardPrompt(true);
    };
    const handleConfirm = () => {
        refreshCard();
        setOpenNewCardPrompt(false);
    };
    const handleClose = () => {
        setOpenNewCardPrompt(false);
    };
    //#endregion

    //#region Got Bingo Prompt
    const handleContinue = () => {
        setGotBingo(false);
    };
    //#endregion

    //#region Settings
    const handleSettingsSave = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());
        console.log(JSON.stringify(formJson));
        updateSettings(draftSettings);
        handleSettingsClose();
    }
    const handleSettingsClose = () => {
        setOpenSettings(false);
    }
    //#endregion

    return tiles.length > 0 ? (
        <div className="bg-card-background text-foreground h-max sm:p-6 p-2 mb-4 rounded-lg shadow-xl animate-in fade-in zoom-in duration-300">
            <div>
                <div className="flex flex-wrap items-center justify-between">
                    <HabsBingoLogo />
                    <div>
                        <button
                            onClick={newCardConfirmation}
                            className="bg-habs-red hover:bg-habs-blue text-white font-bold py-2 px-4 rounded cursor-pointer"
                        >
                            New Card?
                        </button>
                        <IconButton
                            onClick={() => setOpenSettings(true)}
                            aria-label="settings"
                            className="bg-habs-red hover:bg-habs-blue text-white transition-colors duration-200"
                            size="large"
                        >
                            <SettingsIcon fontSize="large" />
                        </IconButton>
                    </div>
                </div>
                <Dialog
                    open={openNewCardPrompt}
                    onClose={handleClose}
                    aria-labelledby="alert-new-card-dialog-title"
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: 'var(--dialog-background)',
                                color: 'var(--foreground)',
                            }
                        }
                    }}
                >
                    <DialogTitle id="alert-new-card-dialog-title" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                        Generate a new card?
                    </DialogTitle>
                    <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3, gap: 3 }}>
                        <button
                            className="bg-gray-500 hover:bg-habs-blue text-white font-bold py-2 px-4 rounded cursor-pointer"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-habs-red hover:bg-habs-blue text-white font-bold py-2 px-4 rounded cursor-pointer"
                            onClick={handleConfirm}
                        >
                            Sure
                        </button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={openSettings}
                    onClose={handleSettingsClose}
                    aria-labelledby="alert-settings-dialog-title"
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: 'var(--dialog-background)',
                                color: 'var(--foreground)',
                            }
                        }
                    }}
                >
                    <DialogTitle id="alert-settings-dialog-title" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                        Settings
                    </DialogTitle>
                    <DialogContent sx={{ textAlign: 'left' }}>
                        <form onSubmit={handleSettingsSave} id="settings-form" className="mb-2">
                            {draftSettings.options.map((setting: Setting) => (
                                <div key={setting.id}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={setting.isEnabled}
                                                onChange={() => handleToggleDraft(setting.id)}
                                            />
                                        }
                                        label={setting.text}
                                    />
                                    {setting.subtext && (
                                        <DialogContentText sx={{ color: 'var(--foreground)', opacity: 0.7, fontSize: '0.75rem', ml: 4, fontStyle: 'italic' }}>
                                            {setting.subtext}
                                        </DialogContentText>
                                    )}
                                </div>
                            ))}
                        </form>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3, gap: 3 }}>
                        <button
                            className="bg-gray-500 hover:bg-habs-blue text-white font-bold py-2 px-4 rounded cursor-pointer"
                            onClick={handleSettingsClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-habs-red hover:bg-habs-blue text-white font-bold py-2 px-4 rounded cursor-pointer"
                            type="submit"
                            form="settings-form"
                        >
                            Save
                        </button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={gotBingo}
                    onClose={handleContinue}
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: 'var(--dialog-background)',
                                color: 'var(--foreground)',
                            }
                        }
                    }}
                >
                    <DialogTitle className="text-habs-red text-2xl" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                        BINGO!
                    </DialogTitle>
                    <DialogContent sx={{ textAlign: 'center' }}>
                        <DialogContentText sx={{ color: 'var(--foreground)' }}>
                            Keep playing for more!
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
                        <button
                            className="bg-habs-red hover:bg-habs-blue text-white font-bold py-2 px-4 rounded cursor-pointer"
                            onClick={handleContinue}
                        >
                            Continue
                        </button>
                    </DialogActions>
                </Dialog>
            </div>
            <div className="sm:aspect-square sm:w-200 max-w-full grid grid-cols-5 grid-rows-5 gap-3 mt-2 mx-auto">
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
