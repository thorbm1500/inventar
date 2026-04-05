import type {User, UserSettings} from "$lib/server/db/components/user";
import type {ApplicationLocale} from "$lib/locale/locales";

export class ContextHandler {

    private static instance: ContextHandler;

    private user: User | null = $state(null);
    private userSettings: UserSettings | null = $state(null);
    private locale: ApplicationLocale | null = $state(null);

    static getInstance(): ContextHandler {
        if (!ContextHandler.instance) ContextHandler.instance = new ContextHandler();
        return ContextHandler.instance;
    }

    static setLocale(locale: ApplicationLocale): void {
        ContextHandler.getInstance().locale = locale;
    }

    static getLocale(): ApplicationLocale {
        return <ApplicationLocale>ContextHandler.getInstance().locale;
    }

    static setUser(user: User): void {
        ContextHandler.getInstance().user = user;
    }

    static getUser(): User {
        return <User>ContextHandler.getInstance().user;
    }

    static setUserSettings(userSettings: UserSettings): void {
        ContextHandler.getInstance().userSettings = userSettings;
    }

    static getUserSettings(): UserSettings {
        return <UserSettings>ContextHandler.getInstance().userSettings;
    }
}