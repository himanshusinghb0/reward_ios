/**
 * Game Download Utilities
 * Simple, clean logic based on Besitos documentation
 */

/**
 * Get user ID from localStorage
 */
export const getUserId = () => {
  try {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      return userData.id || userData.userId || userData._id;
    }
    return (
      localStorage.getItem("userId") ||
      localStorage.getItem("user_id") ||
      localStorage.getItem("id")
    );
  } catch {
    return null;
  }
};

/**
 * Add user ID to URL for tracking
 */
const addUserIdToUrl = (url, userId) => {
  if (!userId) return url;

  try {
    const urlObj = new URL(url);

    // Only add partner_user_id (as per Besitos documentation)
    // Don't add user_id as it might conflict with Besitos' internal tracking
    urlObj.searchParams.set("partner_user_id", userId);

    return urlObj.toString();
  } catch {
    return url;
  }
};

/**
 * Debug function to show Besitos URL information
 */
export const debugBesitosUrl = (game) => {
  const userId = getUserId();
  console.log("=== Besitos Debug ===");
  console.log("Game:", game.title || game.name, "- Android ID:", game.id);
  console.log("Original URL:", game.url);
  console.log("User ID:", userId);
  console.log("Game type:", getGameTypeDescription(getGameType(game)));
  console.log("=== End Debug ===");
};

/**
 * Handle game download - Simple, clean logic based on Besitos documentation
 * Enhanced with VPN detection and optimization
 */
export const handleGameDownload = async (game) => {
  try {
    const userId = getUserId();
    // OPTIMIZED: Use the correct download URL from the API response structure
    let finalUrl = game.details?.downloadUrl || game.downloadUrl || game.url;

    console.log("🔍 Debug Info:", {
      originalUrl: finalUrl,
      downloadUrl: game.details?.downloadUrl,
      fallbackUrl: game.url,
      userId,
      gameId: game.id || game._id,
      gameTitle: game.details?.name || game.title || game.name,
    });

    // Add user ID to URL for tracking (as per Besitos documentation)
    if (userId) {
      finalUrl = addUserIdToUrl(finalUrl, userId);
      console.log("✅ Added partner_user_id to URL:", finalUrl);
    } else {
      console.warn("⚠️ No user ID found - using original URL");
    }

    // Add VPN detection and optimization
    const { detectVpnUsage, getVpnTroubleshootingMessage } = await import(
      "./vpnUtils"
    );
    const vpnDetection = detectVpnUsage();

    if (vpnDetection.isVpnLikely) {
      console.log("🔍 VPN detected:", vpnDetection);
      console.log("💡 VPN Tips:", getVpnTroubleshootingMessage());
    }

    console.log("🎯 Starting game download", {
      game: game.details?.name || game.title || game.name,
      userId,
      url: finalUrl,
      vpnDetected: vpnDetection.isVpnLikely,
      vpnConfidence: vpnDetection.confidence,
    });

    // Open the URL directly - Besitos will handle the redirect to app store
    console.log("📱 Opening game URL:", finalUrl);

    // Use Capacitor Browser plugin for mobile apps
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      try {
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url: finalUrl });

        // Enhanced tracking for VPN users
        if (vpnDetection.isVpnLikely) {
          console.log("📊 VPN download tracking initiated");
          // Dispatch custom event for VPN-aware progress tracking
          window.dispatchEvent(
            new CustomEvent("gameDownloaded", {
              detail: {
                gameId: game.id || game._id,
                userId,
                vpnDetected: true,
                timestamp: Date.now(),
              },
            })
          );
        }

        return;
      } catch (browserError) {
        console.warn(
          "Browser plugin not available, falling back to window.open"
        );
      }
    }

    // Fallback to window.open
    const newWindow = window.open(finalUrl, "_blank", "noopener,noreferrer");
    if (
      !newWindow ||
      newWindow.closed ||
      typeof newWindow.closed === "undefined"
    ) {
      // Popup blocked → navigate directly
      window.location.href = finalUrl;
    }
  } catch (err) {
    console.error("Error handling game download:", err);
    // last resort
    window.location.href = game.url;
  }
};

/**
 * Check if game is available for download
 * REMOVED FILTERING - Show all games from API
 */
export const isGameAvailable = (game) => {
  if (!game) {
    return false;
  }

  // Show all games - no filtering
  return true;
};

/**
 * Get game type description
 */
const getGameTypeDescription = (gameType) => {
  switch (gameType) {
    case "app_store":
      return "App Store Game";
    case "play_store":
      return "Google Play Game";
    case "web_game":
      return "Web Game";
    case "redirect_service":
      return "Redirect Service (Tracked Download)";
    default:
      return "Unknown Game Type";
  }
};

/**
 * Get game type from URL
 */
const getGameType = (game) => {
  if (!game || !game.url) return "unknown";

  const url = game.url.toLowerCase();

  if (url.includes("apps.apple.com") || url.includes("itunes.apple.com")) {
    return "app_store";
  } else if (url.includes("play.google.com")) {
    return "play_store";
  } else if (
    url.includes("wall.besitos.ai") ||
    url.includes("besitos-service.test")
  ) {
    return "redirect_service";
  } else {
    return "web_game";
  }
};
