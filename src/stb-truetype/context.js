export function err(message, context) {
    throw new Error(`${context}: ${message}`);
}
