import { auth } from './auth';
import { admin } from './admin';
import { dashboard } from './dashboard';
import { settings } from './settings';
import { workspaces } from './workspaces';
import { billing } from './billing_ws';
import { home } from './home';
import { demoMatrix } from './demo';
import { waitlist } from './waitlist';

export const it = {
    auth,
    admin,
    dashboard,
    settings,
    workspaces,
    billing,
    home,
    demoMatrix,
    waitlist,
    // Add other root-level translations here
    systemHalted: {
        title: "SISTEMA ARRESTATO",
        descLine1: "La matrice Sovereign è stata intenzionalmente recisa per direttiva amministrativa.",
        descLine2: "Contatta il Primo Architetto se ritieni che si tratti di un errore logico."
    },
    cookieConsent: {
        title: "CONSENSO COOKIE",
        desc: "Utilizziamo tracciatori crittografici per garantire che la sessione rimanga vincolata al substrato attivo.",
        managePreferences: "Gestisci Preferenze",
        rejectAll: "Rifiuta Tutto",
        acceptAll: "Accetta Tutto",
        cookiePreferences: "Preferenze Cookie",
        essential: "Essenziali",
        essentialCookies: "Cookie Essenziali",
        essentialDesc: "Richiesto per l'handshake dell'identità e la persistenza della sessione.",
        analytics: "Analitica",
        analyticsCookies: "Cookie Analitici",
        analyticsDesc: "Ci aiuta a ottimizzare la telemetria della matrice globale.",
        marketing: "Marketing",
        marketingCookies: "Cookie di Marketing",
        marketingDesc: "Usato per impulsi di comunicazione mirata.",
        savePreferences: "Salva Preferenze",
        alwaysActive: "SEMPRE ATTIVO",
        cancel: "ANNULLA"
    },
    globalError: {
        title: "CRASH DEL SISTEMA",
        subtitle: "ROTTURA LOGICA RILEVATA",
        description: "Si è verificata una rottura logica fatale. Il cluster Sovereign sta tentando l'auto-guarigione.",
        body: "Traccia di telemetria dell'errore dettagliata:",
        digest: "ID Rottura:",
        retry: "Tenta Re-integrazione",
        reboot: "RIAVVIA CLUSTER",
        home: "Torna al Substrato Personale"
    },
    "404": {
        title: "NODO NON TROVATO",
        subtitle: "La coordinata richiesta non esiste nella matrice attiva.",
        description: "Il percorso che stai tentando di attraversare è stato eliminato, spostato o non si è mai manifestato in questa versione del substrato.",
        return: "TORNA ALL'ORIGINE"
    },
    commandPalette: {
        searchPlaceholder: "CERCA COMANDI...",
        noResults: "Nessuna corrispondenza neurale trovata.",
        noDirectives: "Nessuna direttiva attiva trovata.",
        searching: "Ricerca nella matrice...",
        subtitle: "INTERFACCIA DI COMANDO SOVEREIGN",
        navHome: "Vai alla Home",
        navDashboard: "Vai alla Dashboard",
        navSettings: "Vai alle Impostazioni",
        navAdmin: "Vai al Pannello di Amministrazione",
        accountSettings: "Impostazioni Account",
        signOut: "Disconnetti",
        rootConsole: "Admin: Accedi alla Console Root",
        inspectAudit: "Admin: Ispeziona Matrice di Audit",
        inspectSource: "Admin: Ispeziona Integrità Sorgente",
        inspectStewardship: "Admin: Ispeziona Protocollo di Stewardship",
        inspectTerminal: "Admin: Apri Terminale Vanguard",
        signIn: "Accedi",
        themeFire: "Interfaccia: Ignizione Nucleo di Fuoco",
        themeMatrix: "Interfaccia: Rientra nella Matrice",
        themeGalaxy: "Interfaccia: Impulso Galassia",
        themeNone: "Interfaccia: Recidi Visual"
    },
    logo: "SOVEREIGN"
};
