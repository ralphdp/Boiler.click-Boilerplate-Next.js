import { auth } from './auth';
import { admin } from './admin';
import { dashboard } from './dashboard';
import { settings } from './settings';
import { workspaces } from './workspaces';
import { billing } from './billing_ws';
import { home } from './home';
import { demoMatrix } from './demo';
import { waitlist } from './waitlist';

export const es = {
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
        title: "SISTEMA DETENIDO",
        descLine1: "La matriz Soberana ha sido desconectada intencionalmente por directiva administrativa.",
        descLine2: "Contacte al Arquitecto Principal si cree que esto es un error de lógica."
    },
    cookieConsent: {
        title: "CONSENTIMIENTO DE COOKIES",
        desc: "Utilizamos rastreadores criptográficos para asegurar que su sesión permanezca vinculada al sustrato activo.",
        managePreferences: "Gestionar Preferencias",
        rejectAll: "Rechazar Todo",
        acceptAll: "Aceptar Todo",
        cookiePreferences: "Preferencias de Cookies",
        essential: "Esenciales",
        essentialCookies: "Cookies Esenciales",
        essentialDesc: "Requerido para el handshake de identidad y la persistencia de sesión.",
        analytics: "Analítica",
        analyticsCookies: "Cookies de Analítica",
        analyticsDesc: "Nos ayuda a optimizar la telemetría de la matriz global.",
        marketing: "Marketing",
        marketingCookies: "Cookies de Marketing",
        marketingDesc: "Usado para pulsos de comunicación dirigida.",
        savePreferences: "Guardar Preferencias",
        alwaysActive: "SIEMPRE ACTIVA",
        cancel: "CANCELAR"
    },
    globalError: {
        title: "CRASH DEL SISTEMA",
        subtitle: "RUPTURA LÓGICA DETECTADA",
        description: "Ha ocurrido una ruptura lógica fatal. El cluster Soberano está intentando la auto-curación.",
        body: "Traza de telemetría de error detallada:",
        digest: "ID de Ruptura:",
        retry: "Intentar Re-integración",
        reboot: "REINICIAR CLUSTER",
        home: "Regresar al Sustrato Personal"
    },
    "404": {
        title: "NODO NO ENCONTRADO",
        subtitle: "La coordenada solicitada no existe en la matriz activa.",
        description: "La ruta que intenta recorrer ha sido eliminada, movida o nunca se manifestó en esta versión del sustrato.",
        return: "REGRESAR AL ORIGEN"
    },
    commandPalette: {
        searchPlaceholder: "BUSCAR COMANDOS...",
        noResults: "No se encontraron coincidencias neuronales.",
        noDirectives: "No se encontraron directivas activas.",
        searching: "Buscando en la matriz...",
        subtitle: "INTERFAZ DE COMANDO SOBERANA",
        navHome: "Ir a Inicio",
        navDashboard: "Ir al Panel de Control",
        navSettings: "Ir a Configuración",
        navAdmin: "Ir al Panel de Administración",
        accountSettings: "Configuración de Cuenta",
        signOut: "Cerrar Sesión",
        rootConsole: "Admin: Acceder a Consola Raíz",
        inspectAudit: "Admin: Inspeccionar Matriz de Auditoría",
        inspectSource: "Admin: Inspeccionar Integridad de Fuente",
        inspectStewardship: "Admin: Inspeccionar Protocolo de Custodia",
        inspectTerminal: "Admin: Abrir Terminal Vanguardia",
        signIn: "Iniciar Sesión",
        themeFire: "Interfaz: Ignición de Núcleo de Fuego",
        themeMatrix: "Interfaz: Re-entrar en la Matriz",
        themeGalaxy: "Interfaz: Pulso de Galaxia",
        themeNone: "Interfaz: Cortar Visuales"
    },
    logo: "SOBERANO"
};
