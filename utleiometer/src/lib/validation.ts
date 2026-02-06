// Definerer regex-reglene
export const VALIDATION_RULES = {
    username: {
        pattern: /^[a-zA-Z0-9_]{3,20}$/,
        message: "Brukernavn må være mellom 3 og 20 tegn og kan kun inneholde bokstaver, tall og understreker."
    },
    password: {
        pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
        message: "Passord må være minst 8 tegn langt og inneholde både bokstaver og tall."
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Ugyldig e-postadresse."
    }
};

//lag funksjoner som sjekker input
export function validateUsername(username: string): { isValid: boolean; error?: string } {
    if (!username) {
        return { isValid: false, error: "Brukernavn er påkrevd" };
    }
    if (!VALIDATION_RULES.username.pattern.test(username)) {
        return {isValid: false, error: VALIDATION_RULES.username.message};
    }
    return { isValid: true };
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email) {
        return { isValid: false, error: "E-post er påkrevd" };
    }
    if (!VALIDATION_RULES.email.pattern.test(email)) {
        return {isValid: false, error: VALIDATION_RULES.email.message};
    }
    return { isValid: true };
}

export function validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password) {
        return { isValid: false, error: "Passord er påkrevd" };
    }
    if (!VALIDATION_RULES.password.pattern.test(password)) {
        return {isValid: false, error: VALIDATION_RULES.password.message};
    }
    return { isValid: true };
}