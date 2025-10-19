"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { login, signup, getProfile } from "@/lib/api";
import useOnboardingStore from "@/stores/useOnboardingStore";
import { App } from "@capacitor/app";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserProfile,
  fetchProfileStats,
  fetchVipStatus,
  clearProfile,
  fetchHomeDashboard,
  fetchLocationHistory,
  fetchUserAchievements,
} from "@/lib/redux/slice/profileSlice";
import { fetchFinancialGoals } from "@/lib/redux/slice/cashCoachSlice";
import { fetchOnboardingOptions } from "@/lib/redux/slice/onboardingSlice";
import { fetchVipTiers } from "@/lib/redux/slice/vipSlice";
import {
  fetchWalletTransactions,
  fetchWalletScreen,
  fetchFullWalletTransactions,
} from "@/lib/redux/slice/walletTransactionsSlice";
import {
  fetchAccountOverview,
  clearAccountOverview,
} from "@/lib/redux/slice/accountOverviewSlice";
import { fetchUserData, clearGames } from "@/lib/redux/slice/gameSlice";
import { clearWalletTransactions } from "@/lib/redux/slice/walletTransactionsSlice";
import { store, persistor } from "@/lib/redux/store";
import {
  fetchCalendar as fetchDailyCalendar,
  fetchToday as fetchDailyToday,
} from "@/lib/redux/slice/dailyChallengeSlice";

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

const PROTECTED_ROUTES = [
  "/homepage",
  "/myprofile",
  "/edit-profile",
  "/games",
  "/permissions",
  "/location",
];
const PUBLIC_ONLY_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/select-age",
  "/onboarding/select-gender",
  "/onboarding/game-preferences",
  "/onboarding/game-styles",
  "/onboarding/player-type",
  "/welcome",
];

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUserFlow, setIsNewUserFlow] = useState(false);

  // NEW: Get the Redux dispatch function and the current status of the profile fetch
  const dispatch = useDispatch();
  const { detailsStatus } = useSelector((state) => state.profile);
  const { status: onboardingStatus } = useSelector((state) => state.onboarding);
  const { status: walletTransactionsStatus, walletScreenStatus } = useSelector(
    (state) => state.walletTransactions
  );
  const { status: accountOverviewStatus } = useSelector(
    (state) => state.accountOverview
  );
  // Deep link listener useEffect (No changes needed here)
  useEffect(() => {
    let listener = null;

    // Check if we're in a Capacitor environment
    if (typeof window !== "undefined" && window.Capacitor && App) {
      try {
        listener = App.addListener("appUrlOpen", (event) => {
          const urlString = event.url;
          const urlScheme = "com.jackson.app://";

          if (urlString.startsWith(urlScheme)) {
            const parsableUrl = new URL(
              urlString.replace(urlScheme, "http://app/")
            );
            const path = parsableUrl.pathname;
            const token = parsableUrl.searchParams.get("token");

            if (path === "/reset-password" && token) {
              router.push(`/reset-password?token=${token}`);
            } else if (path === "/auth/callback" && token) {
              handleSocialAuthCallback(token).then((result) => {
                router.replace(result.ok ? "/homepage" : "/login");
              });
            }
          }
        });
      } catch (error) {
        console.warn(
          "App.addListener not available in this environment:",
          error
        );
      }
    }

    return () => {
      if (listener) {
        try {
          // Try different possible cleanup methods
          if (listener.remove && typeof listener.remove === "function") {
            listener.remove();
          } else if (
            listener.unsubscribe &&
            typeof listener.unsubscribe === "function"
          ) {
            listener.unsubscribe();
          } else if (
            listener.destroy &&
            typeof listener.destroy === "function"
          ) {
            listener.destroy();
          } else if (typeof listener === "function") {
            listener();
          }
        } catch (error) {
          console.warn("Error cleaning up listener:", error);
        }
      }
    };
  }, [router]);

  // MODIFIED: This effect now focuses only on loading the session from storage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("❌ Failed to load session from storage", error);
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // OPTIMIZED: Smart data fetching with persistence awareness
  useEffect(() => {
    if (!token) return;

    // Get current state to check what data is already available
    const currentState = store.getState();
    const {
      detailsStatus,
      statsStatus,
      dashboardStatus,
      details,
      stats,
      dashboardData,
    } = currentState.profile;
    const { userDataStatus, userData, gamesBySection } = currentState.games;
    const { walletScreenStatus, walletScreen } =
      currentState.walletTransactions;
    const {
      calendarStatus: dailyCalendarStatus,
      todayStatus: dailyTodayStatus,
    } = currentState.dailyChallenge || {};

    // OPTIMIZED: Check if data exists and is valid before fetching
    const hasProfileData = details && detailsStatus === "succeeded";
    const hasStatsData =
      (stats || dashboardData?.stats) && statsStatus === "succeeded";
    const hasUserData = userData && userDataStatus === "succeeded";
    const hasWalletData = walletScreen && walletScreenStatus === "succeeded";
    const hasGamesData = gamesBySection && gamesBySection.length > 0;

    console.log("🔍 [AuthContext] Data availability check:", {
      hasProfileData,
      hasStatsData,
      hasUserData,
      hasWalletData,
      hasGamesData,
      detailsStatus,
      statsStatus,
      userDataStatus,
      walletScreenStatus,
      dailyCalendarStatus,
      dailyTodayStatus,
    });

    // PRIORITY 1: Only fetch essential data if not already loaded and valid
    if (!hasProfileData && detailsStatus === "idle") {
      console.log("🔑 [AuthContext] Fetching user profile (not cached)");
      dispatch(fetchUserProfile(token));
    }

    if (user && user._id && !hasUserData && userDataStatus === "idle") {
      console.log("🎮 [AuthContext] Fetching games data (not cached)");
      dispatch(
        fetchUserData({
          userId: user._id,
          token: token,
        })
      );
    }

    // NEW: Prefetch Daily Challenge data early for instant page load
    // Only trigger if not already loading/succeeded to avoid duplicate requests
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    if (dailyCalendarStatus === "idle") {
      console.log("📅 [AuthContext] Prefetching daily challenge calendar");
      dispatch(
        fetchDailyCalendar({
          year,
          month,
          token,
        })
      );
    }
    if (dailyTodayStatus === "idle") {
      console.log("🗓️ [AuthContext] Prefetching today's challenge");
      dispatch(
        fetchDailyToday({
          token,
        })
      );
    }

    // PRIORITY 2: Defer heavy data fetching to prevent app slowdown
    // Only fetch if not already loaded or loading
    if (!hasStatsData && statsStatus === "idle") {
      setTimeout(() => {
        console.log("📊 [AuthContext] Fetching profile stats (not cached)");
        dispatch(fetchProfileStats(token));
      }, 100);
    }

    if (!hasStatsData && dashboardStatus === "idle") {
      setTimeout(() => {
        console.log("🏠 [AuthContext] Fetching dashboard data (not cached)");
        dispatch(fetchHomeDashboard(token));
      }, 100);
    }

    // PRIORITY 3: Load heavy data after a longer delay - only if not already loaded
    setTimeout(() => {
      if (!hasWalletData && walletScreenStatus === "idle") {
        console.log("💰 [AuthContext] Fetching wallet data (not cached)");
        dispatch(fetchWalletScreen(token));
      }

      // Only fetch other heavy data if not already loaded
      dispatch(fetchAccountOverview()); // Account overview for games page
      dispatch(fetchVipStatus(token));
      dispatch(fetchFinancialGoals(token));
      dispatch(fetchVipTiers("US"));
      dispatch(fetchWalletTransactions({ token, limit: 5 }));
      dispatch(
        fetchFullWalletTransactions({
          token,
          page: 1,
          limit: 20,
          type: "all",
        })
      );
      dispatch(fetchLocationHistory(token));
      dispatch(
        fetchUserAchievements({
          token,
          category: "games",
          status: "completed",
        })
      );
    }, 500);
  }, [token, dispatch, user]);

  useEffect(() => {
    // Only fetch if we haven't fetched before
    if (onboardingStatus === "idle") {
      console.log("🚀 [Onboarding] Preloading all onboarding options...");
      dispatch(fetchOnboardingOptions("age_range"));
      dispatch(fetchOnboardingOptions("gender"));
      dispatch(fetchOnboardingOptions("game_preferences"));
      dispatch(fetchOnboardingOptions("game_style"));
      dispatch(fetchOnboardingOptions("dealy_game"));
    }
  }, [dispatch, onboardingStatus]);

  // Gatekeeper logic for routing (No changes needed here)
  useEffect(() => {
    if (isLoading) return;
    if (pathname === "/") return;

    const isAuthenticated = !!user;
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (isAuthenticated && isPublicOnlyRoute) {
      // Check if user has already completed permissions
      const permissionsAccepted =
        localStorage.getItem("permissionsAccepted") === "true";
      const locationCompleted =
        localStorage.getItem("locationCompleted") === "true";

      if (permissionsAccepted && locationCompleted) {
        // User has completed the flow, go to homepage
        router.replace("/homepage");
      } else if (permissionsAccepted && !locationCompleted) {
        // User accepted permissions but hasn't completed location
        router.replace("/location");
      } else {
        // User hasn't accepted permissions yet
        router.replace("/permissions");
      }
      return;
    }

    if (!isAuthenticated && isProtectedRoute) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && isProtectedRoute && isNewUserFlow) {
      setIsNewUserFlow(false);
    }
  }, [isLoading, user, pathname, router, isNewUserFlow]);

  // Prefetch Daily Rewards current week so data is ready on navigation
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const prefetchDailyRewards = async () => {
      try {
        const existing = localStorage.getItem("daily_rewards_current_week");
        if (existing) {
          try {
            const parsed = JSON.parse(existing);
            if (
              parsed?.cacheTime &&
              Date.now() - parsed.cacheTime < 5 * 60 * 1000
            ) {
              return; // Fresh cache exists
            }
          } catch (_) {}
        }

        const BASE_URL = "https://rewardsapi.hireagent.co";
        const resp = await fetch(`${BASE_URL}/api/daily-rewards/week`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        const data = await resp.json();
        if (resp.ok && data?.success && data?.data) {
          const cacheData = { data: data.data, cacheTime: Date.now() };
          localStorage.setItem(
            "daily_rewards_current_week",
            JSON.stringify(cacheData)
          );
        }
      } catch (_) {
        // ignore prefetch errors
      }
    };
    prefetchDailyRewards();
    return () => controller.abort();
  }, [token]);

  const handleAuthSuccess = (data) => {
    console.log("🔑 handleAuthSuccess called with:", data);
    const { token, user } = data;

    setUser(user);
    setToken(token); // Setting the token here triggers the Redux fetch effect above

    // Preload games data immediately after successful login
    if (user && user._id) {
      console.log("🎮 [AuthContext] Preloading games data after login");
      dispatch(
        fetchUserData({
          userId: user._id,
          token: token,
        })
      );
    }

    try {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("authToken", token);
      localStorage.setItem("onboardingComplete", "true");
    } catch (err) {
      console.error("❌ Failed to save to localStorage", err);
    }
    return { ok: true, user };
  };

  const signIn = async (emailOrMobile, password) => {
    try {
      const data = await login(emailOrMobile, password);
      localStorage.setItem("permissionsAccepted", "true");
      // Purge persisted state to avoid showing previous account balances
      try {
        localStorage.removeItem("persist:root");
        localStorage.removeItem("persist:walletTransactions");
        localStorage.removeItem("persist:profile");
        localStorage.removeItem("persist:accountOverview");
      } catch (_) {}
      // Clear Redux slices proactively
      dispatch(clearWalletTransactions());
      dispatch(clearProfile());
      dispatch(clearAccountOverview());
      return handleAuthSuccess(data);
    } catch (error) {
      return { ok: false, error: error.body || { error: error.message } };
    }
  };

  const signUpAndSignIn = async (signupData) => {
    try {
      const data = await signup(signupData);
      useOnboardingStore.getState().resetOnboarding();
      setIsNewUserFlow(true);
      return handleAuthSuccess(data);
    } catch (error) {
      return { ok: false, error: error.body || { error: error.message } };
    }
  };

  // MODIFIED: signOut now also clears the profile state in the Redux store
  const signOut = () => {
    console.log("🚪 signOut called. Clearing session...");
    dispatch(clearProfile()); // NEW: Dispatch action to reset the profile slice
    dispatch(clearGames()); // NEW: Clear games data when logging out
    dispatch(clearWalletTransactions());
    dispatch(clearAccountOverview());
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      localStorage.removeItem("onboarding-storage");
      localStorage.removeItem("persist:root");
      localStorage.removeItem("persist:walletTransactions");
      localStorage.removeItem("persist:profile");
      localStorage.removeItem("persist:accountOverview");

      // Clear daily rewards data from localStorage
      // Remove all daily rewards cache entries
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("daily_rewards_")) {
          localStorage.removeItem(key);
        }
      });

      console.log("🧹 Cleared user + token from localStorage & Redux store");
    } catch (err) {
      console.error("❌ Failed to clear localStorage", err);
    }
    router.push("/login");
  };

  // MODIFIED: This function now leverages our Redux thunk for cleaner logic
  const handleSocialAuthCallback = async (socialToken) => {
    setIsLoading(true);
    try {
      // Dispatch the thunk and await its completion
      const resultAction = await dispatch(fetchUserProfile(socialToken));

      // Check if the thunk was fulfilled (successful)
      if (fetchUserProfile.fulfilled.match(resultAction)) {
        const userProfile = resultAction.payload;
        return handleAuthSuccess({ token: socialToken, user: userProfile });
      } else {
        // If the thunk was rejected, throw an error to be caught below
        throw new Error(
          resultAction.payload || "Social auth profile fetch failed"
        );
      }
    } catch (error) {
      console.error("❌ handleSocialAuthCallback failed:", error);
      signOut();
      return { ok: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserInContext = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUpAndSignIn,
    signOut,
    updateUserInContext,
    handleSocialAuthCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
