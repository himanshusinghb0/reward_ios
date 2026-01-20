/**
 * Game filtering helpers shared across UI sections.
 */

/**
 * Resolve a "display title" for a game across the different shapes we use in the app.
 * @param {any} game
 * @returns {string}
 */
export function getGameDisplayTitle(game) {
  if (!game) return "";

  // Most of the new API responses nest the original Besitos game under `besitosRawData`.
  const rawTitle = game?.besitosRawData?.title;
  if (typeof rawTitle === "string") return rawTitle;

  // Other common shapes used across the app
  const candidates = [
    game?.displayTitle,
    game?.details?.name,
    game?.name,
    game?.title,
  ];

  const found = candidates.find((t) => typeof t === "string" && t.trim() !== "");
  return found || "";
}

/**
 * True if game title contains "ios" (case-insensitive).
 * @param {any} game
 * @returns {boolean}
 */
export function isIosTitleGame(game) {
  const title = getGameDisplayTitle(game);
  return title.toLowerCase().includes("ios");
}

/**
 * Filter games whose title contains "ios" (case-insensitive).
 * @template T
 * @param {T[]} games
 * @returns {T[]}
 */
export function filterIosTitleGames(games) {
  if (!Array.isArray(games)) return [];
  return games.filter(isIosTitleGame);
}

