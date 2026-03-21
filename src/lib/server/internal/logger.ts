import {promises as fs} from "node:fs";
import {building} from "$app/environment";

/**
 * A TypeScript logger for applications using the Bun Runtime.
 * @auther https://github.com/thorbm1500
 */

export const APPLICATION: string = await Bun.file('./package.json').json().then(pkg => pkg.name);
const DEFAULT_LOG_DIRECTORY = 'logs'; //todo: Inherit from Application Settings.
const ERROR_LOG_DIRECTORY = 'logs/error'; //todo: Inherit from Application Settings.

export const enum LogLevel {
    DEBUG = 0,
    WAIT = 0,
    INFO = 1,
    DONE = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}

const enum LogPrefix {
    DEBUG = '\x1b[1;35;49m[DEBUG]\x1b[0;35;49m',
    WAIT = '\x1b[1;93;49m[WAIT]\x1b[0;93;49m ',
    INFO = '\x1b[1;36;49m[INFO]\x1b[0;36;49m ',
    DONE = '\x1b[1;92;49m[DONE]\x1b[0;92;49m ',
    WARN = '\x1b[1;38;5;208;49m[WARN]\x1b[0;38;5;208;49m ',
    ERROR = '\x1b[1;91;100m[ERROR]\x1b[1;91;49m',
    FATAL = '\x1b[1;91;100m[FATAL]\x1b[1;91;49m'
}

function getLogFileName(date: Date, error: boolean = false): string {
    const directory: string = error ? ERROR_LOG_DIRECTORY : DEFAULT_LOG_DIRECTORY;
    return directory.concat('/', APPLICATION, '-', new Intl.DateTimeFormat("da-DK", {day: "2-digit", month: "2-digit", year: "numeric"}).format(date), error ? '.error.log' : '.log');
}

function getTimestamp(): string {
    return '['.concat(new Intl.DateTimeFormat("en-GB", {hour: "2-digit", minute: "2-digit", second: "2-digit"}).format(new Date()), ']');
}

async function ensureDirectories(): Promise<void> {
    if (!(await fs.exists(DEFAULT_LOG_DIRECTORY))) await fs.mkdir(DEFAULT_LOG_DIRECTORY, {recursive: true});
    if (!(await fs.exists(ERROR_LOG_DIRECTORY))) await fs.mkdir(ERROR_LOG_DIRECTORY, {recursive: true});
}

/**
 * A Logger class.
 */
export class Logger {

    /**
     * The current Log Level.
     * @private
     */
    private level: LogLevel;

    private buffer = new Bun.ArrayBufferSink();
    private bufferSize: number = 0;

    private currentDate: Date = new Date();

    /**
     * @param level The {@link LogLevel} to initialize with. Default: `info`
     */
    constructor(level: LogLevel = LogLevel.INFO) {
        this.buffer.start({stream: true, asUint8Array: true})
        this.level = level;

        if (!building) {
            // noinspection JSIgnoredPromiseFromCall
            ensureDirectories();
        }

        this.debug(` » New Logger instance created.`);
    }

    private isLoggable(level: LogLevel): boolean {
        return level >= this.level;
    }

    private writeErrorsToFile(data: string | Uint8Array): void {
        fs.appendFile(getLogFileName(this.currentDate, true), data)
            .catch(err => console.error(`Failed to write data to error log file.`, err));
    }

    private dumpBuffer(): void {
        const buffer = this.buffer.flush() as Uint8Array;
        fs.appendFile(getLogFileName(this.currentDate), buffer)
            .catch(err => this.error(`Failed to write buffer to log file.`, err));

        this.bufferSize = 0;
    }

    private write(data: string, error: boolean = false): void {
        if (error) this.writeErrorsToFile(data);

        if (new Date().getUTCDay() !== this.currentDate.getUTCDay()) {
            this.dumpBuffer();
            this.currentDate = new Date();
        }

        this.buffer.write(data);
        if (++this.bufferSize > 10) {
            this.dumpBuffer();
        }
    }

    private log(level: LogLevel, prefix: string, ...data: any[]): void {
        if (building) return;

        const timestamp: string = ' '.concat(getTimestamp(), ' ');

        let i = 0;
        for (const log of data.join(``).split('\n')) {
            if (this.isLoggable(level)) console.write(prefix, timestamp, i === 0 ? '┃ ' : '┃   ', log, '\u001b[0m\n');
            this.write('['.concat(typeof level, ']', timestamp, log, '\n'), level >= LogLevel.ERROR);
            i++;
        }
    }

    /**
     * Get the current Log Level set.
     * @return Current Level.
     */
    getLevel(): LogLevel {
        return this.level;
    }

    /**
     * Set the Log Level.
     * @param level The new Log Level.
     * @return The Logger instance.
     */
    setLevel(level: LogLevel): Logger {
        this.level = level;
        return this;
    }

    /**
     * This method prints the content as a formatted log at {@link LogLevel.DEBUG}.
     * The log will only be printed to the console, if the current level is
     * equal to or lower than the level of {@link LogLevel.DEBUG}
     * @param data Content to log
     */
    debug(...data: any[]): void {
        this.log(LogLevel.DEBUG, LogPrefix.DEBUG, ...data);
    }

    /**
     * This method prints the content as a formatted log at {@link LogLevel.INFO}.
     * The log will only be printed to the console, if the current level is
     * equal to or lower than the level of {@link LogLevel.INFO}
     * @param data Content to log
     */
    info(...data: any[]): void {
        this.log(LogLevel.INFO, LogPrefix.INFO, ...data);
    }

    /**
     * This method prints the content as a formatted log at {@link LogLevel.WAIT}.
     * The log will only be printed to the console, if the current level is
     * equal to or lower than the level of {@link LogLevel.WAIT}.<br>
     * Logs at this level, are used to signal that a process that <i>should</i>
     * be awaited, has been started, or is currently ongoing.
     * @param data Content to log
     * @see Logger.timed
     */
    wait(...data: any[]): void {
        this.log(LogLevel.WAIT, LogPrefix.WAIT, ...data);
    }

    /**
     * This method prints the content as a formatted log at {@link LogLevel.DONE}.
     * The log will only be printed to the console, if the current level is
     * equal to or lower than the level of {@link LogLevel.DONE}
     * @param data Content to log
     */
    done(...data: any[]): void {
        this.log(LogLevel.DONE, LogPrefix.DONE, ...data);
    }

    /**
     * This method prints the content as a formatted log at {@link LogLevel.WARN}.
     * The log will only be printed to the console, if the current level is
     * equal to or lower than the level of {@link LogLevel.WARN}
     * @param data Content to log
     */
    warn(...data: any[]): void {
        this.log(LogLevel.WARN, LogPrefix.WARN, ...data);
    }

    /**
     * This method prints the content as a formatted log at {@link LogLevel.ERROR}.
     * The log will only be printed to the console, if the current level is
     * equal to or lower than the level of {@link LogLevel.ERROR}
     * @param data Content to log
     */
    error(...data: any[]): void {
        this.log(LogLevel.ERROR, LogPrefix.ERROR, ...data);
    }

    /**
     * This method prints the content as a formatted log at {@link LogLevel.FATAL}.
     * The log will only be printed to the console, if the current level is
     * equal to or lower than the level of {@link LogLevel.FATAL}.<br>
     * Note: This will <i>always</i> be logged, as it is the highest possible level.
     * @param data Content to log
     */
    fatal(...data: any[]): void {
        // Will be logged regardless of current level, due to being the highest possible level.
        this.log(LogLevel.FATAL, LogPrefix.FATAL, ...data);
    }

    /**
     * This method formats the two given numbers to a human-readable format.
     * @param start Nanosecond start-time
     * @param end Nanosecond end-time
     * @private
     */
    formatNanoseconds(start: number, end: number): string {
        let time: number = end - start;

        // Nanoseconds
        if (time < 1000) return ` [${time}ns]`;
        else time = time / 1000;

        // Microseconds
        if (time < 1000) return ` [${Math.trunc(time)}µs]`;
        else time = time / 1000;

        // Milliseconds
        if (time < 10000) return ` [${Math.trunc(time)}ms]`;
        else time = time / 1000;

        // Seconds
        if (time < 60) return ` [${time.toFixed(2)}s]`;
        else time = time / 60;

        // Minutes
        if (time < 60) {
            const decimal: number = time - Math.trunc(time);

            if (decimal > .5) return ` [${Math.trunc(time)}.5m]`;
            else return ` [${Math.trunc(time)}m]`;
        }
        else time = time / 60;

        // Hours
        if (time < 24) {
            const decimal: number = time - Math.trunc(time);

            if (decimal > .5) return ` [${Math.trunc(time)}.5h]`;
            else return ` [${Math.trunc(time)}h]`;
        }
        else time = time / 24;

        // Days
        if (time < 7) {
            const decimal: number = time - Math.trunc(time);

            if (decimal > .5) return ` [${Math.trunc(time)}.5d]`;
            else return ` [${Math.trunc(time)}d]`;
        }
        // Average days pr. month, of 365 days with 12 months.
        else time = time / 7;

        // Weeks
        if (time < 4) {
            const decimal: number = time - Math.trunc(time);

            if (decimal > .5) return ` [${Math.trunc(time)}.5w]`;
            else return ` [${Math.trunc(time)}w]`;
        }
        else time = time / 4;

        // Months
        if (time < 12) {
            const decimal: number = time - Math.trunc(time);

            if (decimal > .5) return ` [${Math.trunc(time)}.5M]`;
            else return ` [${Math.trunc(time)}M]`;
        }

        // Years
        return ` [${((time * 4) / 365).toFixed(1)}y]`;
    }

    /**
     * This method is used to time the execution of asynchronized code.
     * @param startLog
     * @param endLog
     * @param func
     * @see Logger.timedSync
     */
    async timed(startLog: string, endLog: string, func: Function): Promise<void> {
        this.wait(startLog);

        const startTime: number = Bun.nanoseconds();
        await func();

        this.done(endLog.concat(this.formatNanoseconds(startTime, Bun.nanoseconds())));
    }

    /**
     * This method is used to time the execution of synchronized code.
     * @param startLog
     * @param endLog
     * @param func
     * @see Logger.timed
     */
    timedSync(startLog: string, endLog: string, func: Function): void {
        this.wait(startLog);

        const startTime: number = Bun.nanoseconds();
        func();

        this.done(endLog.concat(this.formatNanoseconds(startTime, Bun.nanoseconds())));
    }

    /**
     * The method dumps the buffer, and writes it to the log file, ensuring all pending logs are written.
     */
    destroy(): void {
        console.log(`Shutting down Logger. Goodbye.`);
        this.dumpBuffer();
    }
}