const BROWSER_OFFLINE_RESPONSE = "Error! The browser is offline.";

function isOffline(logOnFailure: boolean = false): boolean {
    const browserConnectionState = navigator.onLine;

    if(logOnFailure && !browserConnectionState) {
        console.error(BROWSER_OFFLINE_RESPONSE);
    }

    return browserConnectionState;
}

export default { isOffline,BROWSER_OFFLINE_RESPONSE };