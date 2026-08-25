/**
 * The one font stack every generated document uses.
 *
 * Keep this identical to --aito-font-sans in src/styles/index.css, which the application uses.
 * They had drifted: the app rendered in Segoe UI Variable while the Huddle guide export declared
 * only Segoe UI, so a downloaded page did not match the screen it came from. Segoe UI Variable
 * also carries the heavier weights this design asks for; without it the browser synthesises a
 * fake bold at font-weight 700 and 800, which reads as yet another typeface.
 *
 * Order follows the house typography rule: Segoe UI, then Calibri, then Arial.
 */
export const HUDDLE_FONT_STACK = '"Segoe UI Variable", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, Calibri, Arial, Helvetica, sans-serif';
