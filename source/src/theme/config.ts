export interface ThemeConfig {
    identity: string;
    primaryColor: string;
    accentColor: string;
    shaderType: 'FIRE';
    siteName: string;
    tagline: string;
}

export const ACTIVE_THEME: ThemeConfig = {
    identity: 'VANGUARD',
    primaryColor: '#a855f7', // Purple
    accentColor: '#e0aaff',
    shaderType: 'FIRE',
    siteName: 'SOVEREIGN_BOILER',
    tagline: 'Universal Next.js Boilerplate Architecture'
};
