"use client";
import React, { useState } from "react";
import { TileStatus } from "../interface/IBingoBoard";

interface BingoTileProps {
  text: string;
  isChecked: boolean;
  onClick: () => void;
}

export default function BingoTile({ text, isChecked, onClick }: BingoTileProps) {
    const [isSelected, setIsSelected] = useState<boolean>(isChecked);

    const handleClick = () => {
        setIsSelected((prevState) => !prevState);
        onClick();
    };
    return (
        <div
            className={`group
                ${isSelected ? "bg-habs-red" : "hover:bg-habs-blue"} 
                select-none cursor-pointer place-content-center
                outline-5 outline-solid`}
            onClick={handleClick}
        >
            <p
                className={`${isSelected ? 'text-gray-100' : 'text-gray-500'} text-center group-hover:text-gray-100`}
            >
                {text}
            </p>
        </div>
    );
}
