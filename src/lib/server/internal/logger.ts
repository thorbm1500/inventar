import {promises as fs} from 'node:fs';

//todo - General cleanup

/**
 * A TypeScript logger for applications using the Bun Runtime.
 * @auther https://github.com/thorbm1500
 */

export const APPLICATION: string = await Bun.file('./package.json').json().then(pkg => pkg.name);
const DEFAULT_LOG_DIRECTORY = 'logs'; //todo: Inherit from Application Settings.
const ERROR_LOG_DIRECTORY = 'logs/error'; //todo: Inherit from Application Settings.

export const enum LogLevel {
    DEBUG,
    INFO,
    WARN,
    ERROR,
    FATAL
}

const enum LogPrefix {
    DEBUG = '\x1b[1;35;49m[DEBUG]\x1b[0;35;49m',
    INFO = '\x1b[1;36;49m[INFO]\x1b[0;36;49m ',
    WARN = '\x1b[1;93;100m[WARN]\x1b[0;93;49m ',
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

        ensureDirectories();

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

    private write(data: string): void {
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
        const timestamp: string = ' '.concat(getTimestamp(), ' ');
        const logs: string[] = data.join().split('\n');
        const firstLog: string = logs.shift() ?? '';

        if (this.isLoggable(level)) console.write(prefix, timestamp, '┃ ', firstLog, '\u001b[0m\n');

        this.write('['.concat(typeof level, ']', timestamp, firstLog, '\n'));
        if (level >= LogLevel.ERROR) this.writeErrorsToFile('['.concat(typeof level, ']', timestamp, firstLog, '\n'));

        for (const log of logs) {
            if (this.isLoggable(level)) console.write(prefix, timestamp, '┣━━ ', log, '\u001b[0m\n');

            this.write('['.concat(typeof level, ']', timestamp, log, '\n'));
            if (level >= LogLevel.ERROR) this.writeErrorsToFile('['.concat(typeof level, ']', timestamp, log, '\n'));
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

    debug(...data: any[]): void {
        this.log(LogLevel.DEBUG, LogPrefix.DEBUG, data);
    }

    info(...data: any[]): void {
        this.log(LogLevel.INFO, LogPrefix.INFO, data);
    }

    warn(...data: any[]): void {
        this.log(LogLevel.WARN, LogPrefix.WARN, data);
    }

    error(...data: any[]): void {
        this.log(LogLevel.ERROR, LogPrefix.ERROR, data);
    }

    fatal(...data: any[]): void {
        // Will be logged regardless of current level, due to being the highest possible level.
        this.log(LogLevel.FATAL, LogPrefix.FATAL, data);
    }

    /**
     * Dumps the buffer, and writes it to the log file, ensuring all pending logs are written.
     */
    destroy(): void {
        console.log(`Shutting down Logger. Goodbye.`);
        this.dumpBuffer();
    }
}