/**
 * `inventar.ts` is a utility file, combining all utility-type classes in a single file.
 * This might seem atypical, but was done after the utility file `Cookies.ts` was created;
 * It's a solution to clear separation between internal and external code.
 */

/**
 * A utility class for cookies.
 */
class Cookies {
    static readonly Session: 'auth-session' = 'auth-session';
}

export default { Cookies };