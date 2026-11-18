export interface Setting {
    id: string;
    text: string;
    subtext?: string;
    isEnabled: boolean;
    cssClass?: string;
    isImmediate: boolean;
}

export interface Settings {
    options: Setting[];
}

export interface SettingsState {
    settings: Settings;
}