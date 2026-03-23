"use server";

import { verifySovereignCipher as _verifySovereignCipher, getTelemetryData as _getTelemetryData, setTelemetryKeys as _setTelemetryKeys } from "./telemetry";
import { deepParseCorpus as _deepParseCorpus } from "./knowledge";
import { setMFAEnforced as _setMFAEnforced, setRateLimitMode as _setRateLimitMode, setDomainShield as _setDomainShield } from "./security";
import { setSiteTitle as _setSiteTitle, setContactEmail as _setContactEmail, setPrimaryColor as _setPrimaryColor, setSocialLinks as _setSocialLinks, getGlobalOverrides as _getGlobalOverrides } from "./branding";

// Explicit Async Wrappers for Server Actions
export async function verifySovereignCipher(...args: Parameters<typeof _verifySovereignCipher>) { return _verifySovereignCipher(...args); }
export async function getTelemetryData(...args: Parameters<typeof _getTelemetryData>) { return _getTelemetryData(...args); }
export async function setTelemetryKeys(...args: Parameters<typeof _setTelemetryKeys>) { return _setTelemetryKeys(...args); }

export async function deepParseCorpus(...args: Parameters<typeof _deepParseCorpus>) { return _deepParseCorpus(...args); }

export async function setMFAEnforced(...args: Parameters<typeof _setMFAEnforced>) { return _setMFAEnforced(...args); }
export async function setRateLimitMode(...args: Parameters<typeof _setRateLimitMode>) { return _setRateLimitMode(...args); }
export async function setDomainShield(...args: Parameters<typeof _setDomainShield>) { return _setDomainShield(...args); }

export async function setSiteTitle(...args: Parameters<typeof _setSiteTitle>) { return _setSiteTitle(...args); }
export async function setContactEmail(...args: Parameters<typeof _setContactEmail>) { return _setContactEmail(...args); }
export async function setPrimaryColor(...args: Parameters<typeof _setPrimaryColor>) { return _setPrimaryColor(...args); }
export async function setSocialLinks(...args: Parameters<typeof _setSocialLinks>) { return _setSocialLinks(...args); }
export async function getGlobalOverrides(...args: Parameters<typeof _getGlobalOverrides>) { return _getGlobalOverrides(...args); }
