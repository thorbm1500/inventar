import fs, {type FileHandle} from "node:fs/promises";
import fss from "node:fs";
import path from "node:path";

// Forked from https://github.com/NullDev, with permission from the original author.
// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

const APP_NAME_FROM_PACKAGE_JSON: string = await fs.readFile(path.resolve("./package.json"), "utf-8").then((content: string): string => JSON.parse(content).name);

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

    /**
     * Logs as error.
     * @param input Content to log.
     * @param error Optional: Error to log.
     */
    static error(input: any, error?: Error): void {
        const log: string = "[ERROR] " + this.#getDate() + " - " + input;
        this.#logger(" \x1b[41m\x1b[315m x \x1b[0m\x1b[31m " + log + "\x1b[0m", log, true);
        if (error && error.stack) {
            const eLog: string = "[TRACE] " + this.#getDate() + " - " + error.stack;
            this.#logger(" \x1b[41m\x1b[315m x \x1b[0m\x1b[31m " + eLog + "\x1b[0m", eLog, true);
        }
    }

    /**
     * Log as warning
     * @param input Content to log.
     */
    static warn(input: any): void {
        const log: string = "[WARN]  " + this.#getDate() + " - " + input;
        this.#logger(" \x1b[43m\x1b[30m ! \x1b[0m\x1b[33m " + log + "\x1b[0m", log);
    }

    /**
     * Log as debug
     * (only if NODE_ENV is set to development)
     * @param input Content to log.
     * @param force If the log should ignore the value of NODE_ENV.
     */
    static debug(input: any, force?: boolean): void {
        if (process.env.NODE_ENV !== "development" && !force) return;
        const log: string = "[DEBUG] " + this.#getDate() + " - " + input;
        this.#logger(" \x1b[45m\x1b[30m d \x1b[0m\x1b[35m " + log + "\x1b[0m", log);
    }

    /**
     * Log as wait
     * @param input
     */
    static wait(input: any): void {
        const log: string = "[WAIT]  " + this.#getDate() + " - " + input;
        this.#logger(" \x1b[46m\x1b[30m ⧖ \x1b[0m\x1b[36m " + log + "\x1b[0m", log);
    }

    /**
     * Log as info
     * @param input
     */
    static info(input: any): void {
        const log: string = "[INFO]  " + this.#getDate() + " - " + input;
        this.#logger(" \x1b[44m\x1b[30m i \x1b[0m\x1b[36m " + log + "\x1b[0m", log);
    }

    /**
     * Log as done
     * @param input
     */
    static done(input: any): void {
        const log: string = "[DONE]  " + this.#getDate() + " - " + input;
        this.#logger(" \x1b[42m\x1b[30m ✓ \x1b[0m\x1b[32m " + log + "\x1b[0m", log);
    }

    /**
     * Log a message without any formatting
     *
     * @static
     * @param input
     * @memberof Log
     */
    static raw(input: any): void {
        this.#logger(String(input), input);
    }
}

export default Log;