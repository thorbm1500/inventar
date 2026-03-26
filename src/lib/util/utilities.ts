import moment from "moment";
import type {Action} from "svelte/action";

export const DAY_IN_MS: number = 1000 * 60 * 60 * 24;

export function parseTimestamp(timestamp: number | string | undefined): string {
    return timestamp ? moment(new Date(timestamp).toISOString()).fromNow() : 'NaN';
}

const REGEX_BRACKET = new RegExp(/(?<!">)((\[)|(]))(?!<\/span>)/, 'i')
const REGEX_DEBUG = new RegExp(/(?<!">)(DEBUG)(?!<\/span>)/, 'i')
const REGEX_INFO = new RegExp(/(?<!">)(INFO)(?!<\/span>)/, 'i')
const REGEX_DONE = new RegExp(/(?<!">)(DONE)(?!<\/span>)/, 'i')
const REGEX_WARN = new RegExp(/(?<!">)(WARN)(?!<\/span>)/, 'i')
const REGEX_ERROR = new RegExp(/(?<!">)(ERROR)(?!<\/span>)/, 'i')
const REGEX_TRACE = new RegExp(/(?<!">)(TRACE)(?!<\/span>)/, 'i')
const REGEX_TIMESTAMP_DIGIT = new RegExp(/(?<!">)(\d\d)(?!<\/span>)/, 'i')
const REGEX_TIMESTAMP_COLON = new RegExp(/(?<!">)(:)(?=\d\d(:\d\d)?])/, 'i')
const REGEX_WHITESPACE = new RegExp(/(?<!">)(\s*)(?!<\/span>)/, 'i')
const REGEX_SEPERATOR = new RegExp(/(?<!">)(\s-)(?!<\/span>)/, 'i')
const REGEX_M_SEPERATOR = new RegExp(/(?:=">)?(\s>)(?!<\/span>)/, 'i')
const REGEX_ERROR_TEXT = new RegExp(/(?=.*ERROR.*)(.*)(?!<\/span>)/, 'i')
const REGEX_TRACE_TEXT = new RegExp(/^(?=\s{26})(.*)(?!<\/span>)/, 'i')
const REGEX_TRACE_STACK = new RegExp(/(\[TRACE] \[\d\d:\d\d:\d\d]\s>\s\s\s\s\s)/, 'i')

function formatLine(line: string): string {
    if (line.startsWith('[TRACE] [') && !(/^\[TRACE] \[\d\d:\d\d:\d\d] - Error/.test(line))) {
        return line.replace(REGEX_TRACE_STACK, `                         `)
            .replace(REGEX_TRACE_TEXT, `<span class="syntax trace-text">$1</span>`)
    }
    return line.replace(REGEX_BRACKET, `<span class="syntax bracket">$1</span>`)
        .replace(REGEX_DEBUG, `<span class="syntax type debug">$1</span>`)
        .replace(REGEX_INFO, `<span class="syntax type info">$1</span>`)
        .replace(REGEX_DONE, `<span class="syntax type done">$1</span>`)
        .replace(REGEX_WARN, `<span class="syntax type warn">$1</span>`)
        .replace(REGEX_ERROR, `<span class="syntax type error">$1</span>`)
        .replace(REGEX_TRACE, `<span class="syntax type trace">$1</span>`)
        .replace(REGEX_BRACKET, `<span class="syntax bracket">$1</span>`)
        .replace(REGEX_WHITESPACE, `<span class="syntax whitespace">$1</span>`)
        .replace(REGEX_BRACKET, `<span class="syntax bracket">$1</span>`)
        .replace(REGEX_TIMESTAMP_DIGIT, `<span class="syntax timestamp-digits">$1</span>`)
        .replace(REGEX_TIMESTAMP_COLON, `<span class="syntax timestamp-colon">$1</span>`)
        .replace(REGEX_TIMESTAMP_DIGIT, `<span class="syntax timestamp-digits">$1</span>`)
        .replace(REGEX_TIMESTAMP_COLON, `<span class="syntax timestamp-colon">$1</span>`)
        .replace(REGEX_TIMESTAMP_DIGIT, `<span class="syntax timestamp-digits">$1</span>`)
        .replace(REGEX_BRACKET, `<span class="syntax bracket">$1</span>`)
        .replace(REGEX_WHITESPACE, `<span class="syntax whitespace">$1</span>`)
        .replace(REGEX_SEPERATOR, ``)
        .replace(REGEX_M_SEPERATOR, ` `)
        .replace(REGEX_ERROR_TEXT, `<span class="syntax trace-text">$1</span>`)
}

export function formatLogs(logs: string[]): string[] {
    let content: string[] = [];

    for (const line of logs) {
        content.push(formatLine(line));
    }
    return content;
}

/**
 * Adds attributes to the element, attempting to have the element be ignored by most major password managers.
 * @param node
 */
export const ignorePasswordManagers: Action = (node: HTMLElement) => {
    // Proton Pass
    node.setAttribute('data-protonpass-ignore', 'true');
    // LastPass
    node.setAttribute('data-lpignore', 'true');
    // 1Password
    node.setAttribute('data-1p-ignore', '');
    // Bitwarden
    node.setAttribute('data-bwignore', '');

    return { destroy() {} };
}

export function capitalizeFirstLetter(text: string): string {
    if (text.length === 0) return '';
    else return text.charAt(0).toUpperCase() + text.slice(1);
}