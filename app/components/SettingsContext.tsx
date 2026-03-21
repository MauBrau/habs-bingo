"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import settingsData from "../assets/settings.json";
import { Setting, Settings } from "../interface/ISettings";

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        // Load from localStorage during initialization
        if (typeof window !== "undefined") {
            const savedSettings = localStorage.getItem("habs-bingo-settings");
            if (savedSettings) {
                try {
                    return JSON.parse(savedSettings);
                } catch (e) {
                    console.error("Failed to parse settings from localStorage", e);
                }
            }
        }
        return settingsData as Settings;
    });

    // Save to localStorage when settings change
    useEffect(() => {
        localStorage.setItem("habs-bingo-settings", JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings: Settings) => {
        setSettings(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};
