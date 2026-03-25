import {LOGGER} from "../../hooks.server.ts";

/** Works with attributes
 * https://www.proshop.dk/Eltandboerste/Oral-B-Tandboerstehoveder-iO-Ultimate-Clean-Sort-6-stk/3089812
 * https://www.netonnet.se/art/mobil-smartwatch/mobiltelefoner/iphone/apple-iphone-17-pro-max-256gb-deep-blue/1059087.9044/
 * https://ardustore.dk/produkt/adafruit-feather-dvi-rp2040-udviklingsboard
 * https://eu.store.bambulab.com/products/1-4-12x15-camera-screw-3pcs-fc014
 * https://www.elgiganten.dk/product/tv-lyd-smart-home/hojtalere-hi-fi/hojttalere/sonos-era-300-hojttaler-sort/592015
 * https://www.power.dk/computere-og-tablets/monitorer-og-skaerme/pc-skaerme/cepter-alpha-49-dfhd-gamingskaerm/p-1945285/?ttclid=E_C_P_Ct0BqbzbB_mR6T8RuGrXiFy5ku1PEXFa0zGXVL5Wi7iKsxKmQgkMIyAD1Bk6gE4IPQKyl0jtIRNtgiFcLFPq30YvQmbfJkwT6ekymof_J8Skb9uosJsKgNR5EOwQVwU-bQr2nUksBtgaPeTNUXge3wAUgxnNOevY4zC9s2PQRa8oNCSVC1WaMa4TR59JwUn_N8P5wEhqzrwCNiV7lc3ytw38f0Faa_sCcx4GiFRVuF2k5wcpv0IhYYRGX376nSy3LGTXuK4AXlpz3TGYRXbXysJz5ocB-QgU4df5aw1qBIYSBHYyLjA
 * https://www.jemogfix.dk/plaeneklipperolie-sae-30-600-ml-autozone/2114/9052291/
 */

declare type Query = string | { value: string, canContainSymbols?: true };

export interface ProcessResults {
    price: number | null,
    discount?: boolean,
    currency?: string,
    brand?: string,
    category?: string
}

class ClassQuery {

    static readonly PRICES: Query[] = [
        "prod_price_current",
        "current-price-display",
        "price-item",
        "product-price",
        "product-detail-price",
        "product-details__price",
        "formatted-primary-price",
        "checkoutPrice",
        "unitpriceinclvat",
        "priceinclvatrichformatted",
        "price",
        "price--withoutTax",
        "ProductPrice",
        "woocommerce-Price",
        "product__price__price",
        "site-currency-campaign"
    ]

}

class AttributeQuery {

    static readonly PRICES: Query[] = [
        "data-price",
        "data-price-amount"
    ]

    static readonly CURRENCY: Query[] = [
        "data-currency"
    ]

    static readonly BRAND: Query[] = [
        {value: "data-brand", canContainSymbols: true}
    ]

    static readonly CATEGORIES: Query[] = [
        {value: "data-category", canContainSymbols: true}
    ]
}

class ContentQuery {

    static readonly PRICES: Query[] = [
        `itemprop="price"`
    ]
}

class JsonParser {

    private readonly json: Object | undefined;
    private results: ProcessResults = {price: null};

    constructor(data: string) {
        let startIndex: number = data.indexOf(`>`, data.indexOf(`type="application/ld+json"`)) + 1;
        let endIndex: number = data.indexOf("</script>", startIndex);

        let json: Object | undefined = undefined;

        try {
            json = Bun.JSON5.parse(data.slice(startIndex, endIndex)) as Object;
        } catch (ignored) {
        }

        if (json) this.json = json;
        //console.log(json);
    }

    private process(key: string, value: any): void {
        console.log(`[process]`, key, `:`, value);

        if (key === 'price' && typeof value === 'string') {
            let n = Number.parseFloat(value);
            if (!Number.isNaN(n)) {
                if (this.results.price) {
                    if (this.results.price > n) return;
                }
                this.results.price = n;
                return;
            }
        }

        if (!this.results.currency) {
            if (key === 'priceCurrency' || key === 'currency') {
                this.results.currency = value;
            }
        }

        if ((!this.results.price || !this.results.currency) && key.includes('offers')) {
            for (const e of Object.entries(value)) {
                if (e[0].includes('priceSpecification')) {
                    for (const f of e[1] as Array<string>) {
                        for (const g of Object.entries(f as Object)) {
                            if (g[0] === 'priceCurrency') {
                                this.results.currency = String(g[1]);
                            } else if (g[0] === 'price') {
                                this.results.price = Number.parseFloat(String(g[1]));
                                if (Number.isNaN(this.results.price)) this.results.price = null;
                            }
                        }
                    }

                    break;
                }
            }

            return;
        }

        if (!this.results.brand && key === "brand") {
            for (const e of Object.entries(value)) {
                if (e[0] === "name") {
                    this.results.brand = String(e[1]);
                    break;
                }
            }

            return;
        }

        if (!this.results.category && key === "category") {
            if (typeof value === 'string') this.results.category = value;

            return;
        }

        if (!this.results.price && (typeof value === 'string' || typeof value === 'number') && key === "price") {
            this.results.price = Number.parseFloat(String(value));
            if (Number.isNaN(this.results.price)) this.results.price = null;
            return;
        }
    }

    parse(): ProcessResults {
        if (!this.json) return this.results;

        for (const entry of Object.entries(this.json)) {
            const key: string = entry[0];
            const value: any = entry[1];

            if (typeof value === 'object') {
                for (const obj of Object.entries(value)) {
                    if (typeof obj[1] === 'object') {
                        for (const entryChild of Object.entries(obj[1] as Object)) {
                            if (typeof entryChild[1] === 'object') {
                                for (const child of Object.entries(entryChild[1] as Object)) {
                                    if (typeof child[1] === 'object') {
                                        for (const o of Object.entries(child[1] as Object)) {
                                            this.process(o[0], o[1]);
                                        }
                                    } else {
                                        this.process(child[0], child[1]);
                                    }
                                }
                            } else {
                                this.process(entryChild[0], entryChild[1]);
                            }
                        }
                    } else {
                        this.process(obj[0], obj[1]);
                    }
                }
            } else {
                this.process(key, value);
            }
        }

        return this.results;
    }
}

class Util {
    static classNameRegex(className: string): RegExp {
        return new RegExp(`^\\s*<[a-zA-Z]*\\s`, 'gm');
    }

    static attributeRegex(attribute: string, options?: { symbols?: boolean }): RegExp {
        if (options?.symbols) return new RegExp(`(?<=${attribute}=")[\\w\\s\.\,\_\-]*(?=")`, 'g');
        else return new RegExp(`(?<=${attribute}=")[\\w,\.]*(?=")`, 'gi');
    }
}

class Internal {
    static async fetch(url: string, plain?: true): Promise<string> {
        LOGGER.debug(`Fetching external data...`);
        const response: Response = plain ? await Bun.fetch(url) : await Bun.fetch(url, {
            headers: [["User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"], ["Sec-Ch-Ua", `"Chromium";v="146", "Not-A.Brand";v="24", "Microsoft Edge";v="146"`]]
        });
        return await response.text();
    }

    static async process(data: string): Promise<ProcessResults> {
        const results: ProcessResults = new JsonParser(data).parse();

        if (!results.price) {
            for (const query of AttributeQuery.PRICES) {
                let result: RegExpMatchArray | null = null;

                if (typeof query === 'string') {
                    result = data.match(Util.attributeRegex(query));
                } else {
                    result = data.match(Util.attributeRegex(query.value, {symbols: query.canContainSymbols}));
                }

                if (result && result[0] !== undefined) {
                    results.price = Number.parseFloat(String(result[0]));
                    if (Number.isNaN(results.price)) results.price = null;
                    break;
                }
            }
        }

        if (!results.price) {
            for (const query of ClassQuery.PRICES) {
                let result: RegExpMatchArray | null = null;

                if (typeof query === 'string') {
                    result = data.match(Util.classNameRegex(query));
                }

                if (result && result[0] !== undefined) {
                    results.price = Number.parseFloat(String(result[0]));
                    if (Number.isNaN(results.price)) results.price = null;
                    break;
                }
            }
        }

        if (!results.currency) {
            for (const query of AttributeQuery.CURRENCY) {
                let result: RegExpMatchArray | null = null;

                if (typeof query === 'string') {
                    result = data.match(Util.attributeRegex(query));
                } else {
                    result = data.match(Util.attributeRegex(query.value, {symbols: query.canContainSymbols}));
                }

                if (result && result[0] !== undefined) {
                    results.currency = result[0];
                    break;
                }
            }
        }

        if (!results.brand) {
            for (const query of AttributeQuery.BRAND) {
                let result: RegExpMatchArray | null = null;

                if (typeof query === 'string') {
                    result = data.match(Util.attributeRegex(query));
                } else {
                    result = data.match(Util.attributeRegex(query.value, {symbols: query.canContainSymbols}));
                }

                if (result && result[0] !== undefined) {
                    results.brand = result[0];
                    break;
                }
            }
        }

        if (!results.category) {
            for (const query of AttributeQuery.CATEGORIES) {
                let result: RegExpMatchArray | null = null;

                if (typeof query === 'string') {
                    result = data.match(Util.attributeRegex(query));
                } else {
                    result = data.match(Util.attributeRegex(query.value, {symbols: query.canContainSymbols}));
                }

                if (result && result[0] !== undefined) {
                    results.category = result[0];
                    break;
                }
            }
        }

        return results;
    }
}

export async function fetchItemPrice(url: string): Promise<void> {
    LOGGER.debug(`Processing external '${url}'`);
    let body: string = await Internal.fetch(url, true);
    let results: ProcessResults = await Internal.process(body);

    if (!results.price && results.discount === undefined && !results.brand && !results.category && !results.currency) {
        // Attempt to fake a real human request to the site
        body = await Internal.fetch(url);
        results = await Internal.process(body);
    }

    console.log(`Final results:`, results);

    //const priceString = body.substring(body.indexOf('€'), body.indexOf('€') + 12).replaceAll(new RegExp(/[^\d|\.|\,]/,'gi'),'');
    //console.log(priceString);
}