class Toast {

    toasts: string[] = $state([]);
    delay: number = $derived.by(() => 8 / (.75 + (Math.max(1.0, this.toasts.length) / 4.0)))

    constructor() {
        this.#garbageCollector();
    }

    addToast(content: string): void {
        this.#createToast(content,
            ``,
            `background:var(--toast-background);border:.075rem solid var(--toast-border);
            backdrop-filter: blur(2px) brightness(1.5) !important;`)
    }

    addSuccessToast(content: string): void {
        this.#createToast(content,
            `<svg style="margin-right:.25rem;transform:translateY(.075rem);" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>`,
            `background:var(--toast-background-success);border:.075rem solid var(--toast-border-success);
            backdrop-filter: blur(2px) brightness(1.5) !important;`)
    }

    addWarningToast(content: string): void {
        this.#createToast(content,
            `<svg style="margin-right:.25rem;transform:translateY(.075rem);" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>`,
            `background:var(--toast-background-warning);border:.075rem solid var(--toast-border-warning);
            backdrop-filter: blur(2px) brightness(1.5) !important;`)
    }

    addErrorToast(content: string): void {
        this.#createToast(content,
            `<svg style="margin-right:.25rem;transform:translateY(.075rem);" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>`,
            `background:var(--toast-background-error);border:.075rem solid var(--toast-border-error);
            backdrop-filter: blur(2px) brightness(1.5) !important;`)
    }

    #createToast(content: string, icon: string, styling: string): void {
        const toast = `<div class="toast-container" style="display:flex;">
                            <div class="toast"
                            style="display:flex;flex-flow:row nowrap;align-items:center;justify-content:center;padding:1.25rem 1.75rem;border-radius:.75rem;color:var(--theme-text);font-family:'FunnelDisplay', sans-serif;font-weight:600;font-size:1.1rem;transition:72ms ease-in-out;${styling} 0ms 1">
                             ${icon}
                             ${content}
                       </div>
                       <div class="toast"
                            style="position:absolute;opacity:.5;display:flex;flex-flow:row nowrap;align-items:center;justify-content:center;padding:1.25rem 1.75rem;border-radius:.75rem;color:var(--theme-text);font-family:'FunnelDisplay', sans-serif;font-weight:600;font-size:1.1rem;transition:72ms ease-in-out;${styling} 0ms 1">
                             ${icon}                       
                             ${content}
                       </div>
                      </div>`;

        this.toasts.push(toast);
    }

    removeToast(): void {
        if (this.toasts.length > 0) this.toasts.shift();
    }

    #garbageCollector(): void {
        setTimeout((): void => {
            this.removeToast();
            this.#garbageCollector();
        }, this.delay * 1000);
    }

}

export default Toast;