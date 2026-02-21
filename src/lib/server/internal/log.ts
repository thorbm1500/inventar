import fs, {type FileHandle} from "node:fs/promises";
import fss from "node:fs";
import path from "node:path";

// Forked from https://github.com/NullDev, with permission from the original author.
// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

const APP_NAME_FROM_PACKAGE_JSON: string = await fs.readFile(path.resolve("./package.json"), "utf-8").then((content: string): string => JSON.parse(content).name);
const FORMAT_SUFFIX: string = "\x1b[0m";
const CHAR_REGEX = new RegExp(/./,'g')
const NEWLINE_REGEX = new RegExp(/\n\s?/, 'g');

// noinspection JSIgnoredPromiseFromCall
/**
 * Logging utility class.
 */
class Log {
    static #logDir: string = path.resolve("./logs");
    static #eLogDir: string = path.resolve("./logs/errors");

    /**
     * @return DateTime string formatted to en-US locale.
     */
    static #getDate(): string {
        const options: Intl.DateTimeFormatOptions = {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        const date: string = new Intl.DateTimeFormat("en-US", options).format(new Date());

        return "[" + date + "]";
    }

    /**
     * Ensures log directories exist
     */
    static #ensureDirs(): void {
        if (!fss.existsSync(this.#logDir)) {
            fss.mkdirSync(this.#logDir);
            fss.closeSync(fss.openSync(path.resolve(this.#logDir, ".gitkeep"), "w"));
        }
        if (!fss.existsSync(this.#eLogDir)) {
            fss.mkdirSync(this.#eLogDir);
            fss.closeSync(fss.openSync(path.resolve(this.#eLogDir, ".gitkeep"), "w"));
        }
    }

    /**
     * Writes log to file.
     * @param input Content to log.
     * @param error If the output should be written to error log instead of default.
     */
    static async #logTofile(input: any, error?: boolean): Promise<void> {
        this.#ensureDirs();

        const date = new Date();
        const month: string = (date.getMonth() + 1).toString().padStart(2, "0");
        const day: string = date.getDate().toString().padStart(2, "0");

        const logFile = `${APP_NAME_FROM_PACKAGE_JSON}-${day}-${month}-${date.getFullYear()}.log`;
        const fd: FileHandle = await fs.open(path.resolve(this.#logDir, logFile), "a");
        await fd.write(input + "\n");
        await fd.close();

        if (error) {
            const errFile = `${APP_NAME_FROM_PACKAGE_JSON}-${day}-${month}-${date.getFullYear()}-errors.log`;
            const fe: FileHandle = await fs.open(path.resolve(this.#eLogDir, errFile), "a");
            await fe.write(input + "\n");
            await fe.close();
        }
    }

    /**
     * Prints log to stdout, then writes to the respective file.
     * @param input Content to log.
     * @param file_input Content to write to log file.
     * @param error If the output should be written to error log instead of default.
     */
    static #logger(input: string, file_input: string, error?: boolean): void {
        console.log(input);
        this.#logTofile(file_input, error);
    }

    static error(input: any): void;
    static error(input: any, error: Error): void;

    /**
         * Log as `[ERROR]`
     * @param input Content to log.
     * @param prefix Optional: ex. `[ERROR] - [prefix] Lorem Ipsum`
     * @param error Optional
     */
    static error(input: any, error?: Error, prefix?: string): void {
        const {log, file_log} = this.#formatLog(`[ERROR]`, ` \x1b[41m\x1b[315m x \x1b[0m\x1b[31m `, input, prefix);
        this.#logger(log, file_log, true);

        if (error && error.stack) {
            const {log, file_log} = this.#formatLog(`[TRACE]`, ` \x1b[41m\x1b[315m x \x1b[0m\x1b[31m `, error.stack, prefix);
            this.#logger(log, file_log, true);
        }
    }

    /**
     * Log as `[WARN]`
     * @param input Content to log.
     * @param prefix Optional: ex. `[WARN] - [prefix] Lorem Ipsum`
     */
    static warn(input: any, prefix?: string): void {
        const {log, file_log} = this.#formatLog(`[WARN] `, ` \x1b[43m\x1b[30m ! \x1b[0m\x1b[33m `, input, prefix);
        this.#logger(log, file_log);
    }

    /**
     * Log as `[DEBUG]`
     * (only if NODE_ENV is set to development)
     * @param input Content to log.
     * @param prefix Optional: ex. `[DEBUG] - [prefix] Lorem Ipsum`
     * @param force If the log should ignore the value of NODE_ENV.
     */
    static debug(input: any, prefix?: string, force?: boolean): void {
        if (!force && process.env.NODE_ENV !== "development") return;
        const {log, file_log} = this.#formatLog(`[DEBUG] `, ` \x1b[45m\x1b[30m d \x1b[0m\x1b[35m `, input, prefix);
        this.#logger(log, file_log);
    }

    /**
     * Log as `[WAIT]`
     * @param input Content to log.
     * @param prefix Optional: ex. `[WAIT] - [prefix] Lorem Ipsum`
     */
    static wait(input: any, prefix?: string): void {
        const {log, file_log} = this.#formatLog(`[WAIT] `, ` \x1b[46m\x1b[30m ⧖ \x1b[0m\x1b[36m `, input, prefix);
        this.#logger(log, file_log);
    }

    /**
     * Log as `[INFO]`
     * @param input Content to log.
     * @param prefix Optional: ex. `[INFO] - [prefix] Lorem Ipsum`
     */
    static info(input: any, prefix?: string): void {
        const {log, file_log} = this.#formatLog(`[INFO] `, ` \x1b[44m\x1b[30m i \x1b[0m\x1b[36m `, input, prefix);
        this.#logger(log, file_log);
    }

    /**
     * Log as `[DONE]`
     * @param input Content to log.
     * @param prefix Optional: ex. `[DONE] - [prefix] Lorem Ipsum`
     */
    static done(input: any, prefix?: string): void {
        const {log, file_log} = this.#formatLog(`[DONE] `, ` \x1b[42m\x1b[30m ✓ \x1b[0m\x1b[32m `, input, prefix);
        this.#logger(log, file_log);
    }

    /**
     * Log a message without any formatting.
     * @param input
     */
    static raw(input: any): void {
        this.#logger(String(input), input);
    }

    /**
     * Formats the content to the log format.
     * @param symbol
     * @param prefix
     * @param input
     * @param extraPrefix
     * @private
     */
    static #formatLog(symbol: string, prefix: string, input: any, extraPrefix?: string): { log: string, file_log: string } {
        const cleanPrefix: string = symbol.concat(' ', this.#getDate());
        const log: string = extraPrefix ? cleanPrefix.concat(' - [',extraPrefix,'] ',input) : cleanPrefix.concat(' - ',input);

        return {
            log: prefix.concat(log, FORMAT_SUFFIX)
                .replaceAll(NEWLINE_REGEX, FORMAT_SUFFIX.concat('\n', prefix, cleanPrefix, ' > ',extraPrefix ? extraPrefix.replaceAll(CHAR_REGEX,' ').concat('   ') : '  '))
                .concat(FORMAT_SUFFIX),
            file_log: log.replaceAll(NEWLINE_REGEX, '\n'.concat(cleanPrefix, ' >   '))
        };
    }

    /**
     * Format the content to the log format without ANSI formatting.
     * @param symbol
     * @param input
     * @private
     */
    static #formatFileLog(symbol: string, input: any): string {
        const prefix: string = symbol.concat('  ', this.#getDate(), ' - ');
        return prefix.concat(input).replaceAll(NEWLINE_REGEX, '\n'.concat(prefix, ' >   '));
    }
}

export default Log;