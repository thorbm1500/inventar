import moment from "moment";

const nonWordCharacterRegex = new RegExp(/\W/, 'g');
const wordCharacterRegex = new RegExp(/\w/, 'g');
const digitCharacterRegex = new RegExp(/\d/, 'g');
const nonDigitCharacterRegex = new RegExp(/\D/, 'g');
const whitespaceRegex = new RegExp(/\s/, 'g');

export const DAY_IN_MS = 1000 * 60 * 60 * 24;

export function parseTimestamp(timestamp: number | string | undefined): string {
    return timestamp ? moment(new Date(timestamp).toISOString()).fromNow() : 'NaN';
}

declare interface FormatOptions {
    removeDigits?: boolean,
    removeNonDigits?: boolean,
    removeWordCharacters?: boolean,
    removeNonWordCharacters?: boolean
    removeWhitespace?: boolean
}

/**
 * @param content String to format
 * @param options Optional.
 */
export function formatString(content: unknown, options?: FormatOptions): string {
    if (content === null) return '';

    let value: string = String(content);

    if (!options) return value.replaceAll(nonWordCharacterRegex, '');

    if (options.removeDigits) {
        value = value.replaceAll(digitCharacterRegex, '');
    }
    if (options.removeNonDigits) {
        value = value.replaceAll(nonDigitCharacterRegex, '');
    }
    if (options.removeWordCharacters) {
        value = value.replaceAll(wordCharacterRegex, '');
    }
    if (options.removeNonWordCharacters) {
        value = value.replaceAll(nonWordCharacterRegex, '');
    }
    if (options.removeWhitespace) {
        value = value.replaceAll(whitespaceRegex, '');
    }

    return value;
}