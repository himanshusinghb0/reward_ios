import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserData } from "@/lib/redux/slice/gameSlice";
import { fetchWalletScreen } from "@/lib/redux/slice/walletTransactionsSlice";

/**
 * Custom hook to manage homepage data efficiently
 * Prevents unnecessary API calls and re-renders
 */
export const useHomepageData = (token, user) => {
  const dispatch = useDispatch();

  // Get all necessary state from Redux
  const {
    stats,
    statsStatus,
    dashboardData,
    dashboardStatus,
    details,
    detailsStatus,
  } = useSelector((state) => state.profile);

  const { userDataStatus, userData } = useSelector((state) => state.games);
  const { walletScreenStatus, walletScreen } = useSelector(
    (state) => state.walletTransactions
  );

  // OPTIMIZED: Enhanced data availability check with persistence awareness
  const dataAvailability = useMemo(() => {
    const hasStats =
      (dashboardData?.stats || stats) &&
      (statsStatus === "succeeded" || dashboardStatus === "succeeded");
    const hasUserData =
      userData && (userDataStatus === "succeeded" || userDataStatus === "idle");
    const hasWalletData =
      walletScreen &&
      (walletScreenStatus === "succeeded" || walletScreenStatus === "idle");
    const hasDashboardData = dashboardData && dashboardStatus === "succeeded";

    // OPTIMIZED: More intelligent loading state
    const isLoading =
      statsStatus === "loading" ||
      userDataStatus === "loading" ||
      walletScreenStatus === "loading";
    const hasAnyData =
      hasStats || hasUserData || hasWalletData || hasDashboardData;

    return {
      hasStats,
      hasUserData,
      hasWalletData,
      hasDashboardData,
      // Only show loading if we have NO data at all and are actively loading
      shouldShowLoading: !hasAnyData && isLoading,
    };
  }, [
    dashboardData,
    stats,
    userDataStatus,
    userData,
    walletScreenStatus,
    walletScreen,
    statsStatus,
    dashboardStatus,
  ]);

  // Only fetch data if it's not already available
  useEffect(() => {
    if (!token || !user?._id) return;

    // Only fetch if data is not already loaded
    if (userDataStatus === "idle" && !userData) {
      console.log("🎮 [useHomepageData] Fetching user data (not cached)");
      dispatch(
        fetchUserData({
          userId: user._id,
          token: token,
        })
      );
    }

    if (walletScreenStatus === "idle" && !walletScreen) {
      console.log("💰 [useHomepageData] Fetching wallet data (not cached)");
      dispatch(fetchWalletScreen(token));
    }
  }, [
    token,
    user,
    userDataStatus,
    walletScreenStatus,
    userData,
    walletScreen,
    dispatch,
  ]);

  return {
    // Data
    stats: dashboardData?.stats || stats,
    userData,
    walletScreen,
    details,

    // Loading states
    isLoading: dataAvailability.shouldShowLoading,
    hasStats: dataAvailability.hasStats,
    hasUserData: dataAvailability.hasUserData,
    hasWalletData: dataAvailability.hasWalletData,

    // Status
    statsStatus,
    userDataStatus,
    walletScreenStatus,
    detailsStatus,
  };
};
