// src/core/security/input-sanitization.ts

/**
 * Sanitizes user input for safe usage
 */
export function sanitizeSearchQuery(query: string): string {
    return query
        .trim()
        .slice(0, 100)
        .replace(/[<>]/g, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "");
}

/**
 * Sanitizes URL parameter values for client-side filtering
 */
export function sanitizeUrlParam(param: string | null): string | null {
    if (!param || typeof param !== "string") return null;

    return param
        .trim()
        .slice(0, 200)
        .replace(/[<>]/g, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .replace(/[<>{}[\]\\|]/g, "");
}

/**
 * Validates and sanitizes slug inputs
 */
export function validateSlug(slug: string): {
    isValid: boolean;
    value: string;
    error?: string;
} {
    const trimmed = slug.trim();

    if (!trimmed) {
        return { isValid: false, value: "", error: "Slug is required" };
    }

    if (trimmed.length > 200) {
        return {
            isValid: false,
            value: "",
            error: "Slug too long (max 200 characters)",
        };
    }

    const sanitized = trimmed
        .toLowerCase()
        .replace(/[^a-z0-9-_\s]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    if (!sanitized) {
        return {
            isValid: false,
            value: "",
            error: "Slug contains no valid characters",
        };
    }

    return { isValid: true, value: sanitized };
}

/**
 * Validates email addresses
 */
export function validateEmail(
    email: string,
    fieldName: string,
    required = false
): { isValid: boolean; value: string; error?: string } {
    if (!required && (!email || !email.trim())) {
        return { isValid: true, value: "" };
    }

    if (required && (!email || !email.trim())) {
        return { isValid: false, value: "", error: `${fieldName} is required` };
    }

    const trimmed = email.trim();

    if (trimmed.length > 254) {
        return { isValid: false, value: "", error: `${fieldName} is too long` };
    }

    const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(trimmed)) {
        return {
            isValid: false,
            value: "",
            error: `${fieldName} is not a valid email address`,
        };
    }

    return { isValid: true, value: trimmed };
}

/**
 * Validates and sanitizes text inputs
 */
export function validateText(
    value: string,
    fieldName: string,
    options: {
        maxLength?: number;
        minLength?: number;
        required?: boolean;
        allowHtml?: boolean;
        disallowControlChars?: boolean;
    } = {}
): { isValid: boolean; value: string; error?: string } {
    const {
        maxLength = 10000,
        minLength = 0,
        required = false,
        allowHtml = false,
        disallowControlChars = true,
    } = options;

    if (required && (!value || value.trim().length === 0)) {
        return { isValid: false, value: "", error: `${fieldName} is required` };
    }

    const trimmed = value.trim();

    if (trimmed.length > maxLength) {
        return {
            isValid: false,
            value: "",
            error: `${fieldName} too long (max ${maxLength} characters)`,
        };
    }

    if (trimmed.length < minLength) {
        return {
            isValid: false,
            value: "",
            error: `${fieldName} too short (min ${minLength} characters)`,
        };
    }

    let sanitized = trimmed;

    if (disallowControlChars) {
        const controlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
        if (controlChars.test(sanitized)) {
            return {
                isValid: false,
                value: "",
                error: `${fieldName} contains invalid characters`,
            };
        }
    }

    if (sanitized.length > 0) {
        const repeatingChars = /(.)\1{100,}/;
        if (repeatingChars.test(sanitized)) {
            return {
                isValid: false,
                value: "",
                error: `${fieldName} contains suspicious patterns`,
            };
        }
    }

    if (!allowHtml) {
        sanitized = sanitized
            .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
            .replace(/javascript:/gi, "")
            .replace(/vbscript:/gi, "")
            .replace(/data:text\/html/gi, "")
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
            .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
            .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, "")
            .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, "");
    }

    return { isValid: true, value: sanitized };
}

/**
 * Basic text sanitization
 */
export function sanitizeText(text: string): string {
    return text
        .trim()
        .replace(/[<>]/g, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "");
}
