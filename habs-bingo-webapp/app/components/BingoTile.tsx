"use client";
import React, { useEffect, useState } from "react";

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
                outline-3 sm:outline-7 outline-solid outline-offset-2 outline-(--habs-blue)`}
            onClick={handleClick}
        >
            <p
                className={`leading-5 ${isSelected ? 'text-gray-100' : 'text-black'} font-bold text-center group-hover:text-gray-100`}
            >
                {text}
            </p>
        </div>
    );
}
