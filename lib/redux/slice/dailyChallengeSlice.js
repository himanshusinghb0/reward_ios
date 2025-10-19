import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDailyChallengeCalendar,
  getTodaysChallenge,
  selectChallengeGame as apiSelectChallengeGame,
  startChallenge as apiStartChallenge,
  completeChallenge as apiCompleteChallenge,
} from "../../api";

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  // Calendar
  calendar: null, // { year, month, monthName, today, calendarDays[] }
  calendarStatus: "idle", // idle | loading | succeeded | failed

  // Today
  today: null, // { hasChallenge, challenge, progress, countdown, actions }
  todayStatus: "idle",

  // UI
  modalOpen: false,

  // Streak
  streak: { current: 0, milestones: [5, 10, 20, 30], nextMilestone: 5 },

  // Completion
  completionStatus: "idle",

  // Error handling
  error: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Fetch daily challenges for user
 * Retrieves historical and current challenge data
 */
export const fetchCalendar = createAsyncThunk(
  "dailyChallenge/fetchCalendar",
  async ({ year, month, token }, { rejectWithValue }) => {
    try {
      const response = await getDailyChallengeCalendar(year, month, token);
      if (!response.success)
        throw new Error(response.error || "Calendar error");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch calendar");
    }
  }
);

export const fetchToday = createAsyncThunk(
  "dailyChallenge/fetchToday",
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await getTodaysChallenge(token);
      if (!response.success) throw new Error(response.error || "Today error");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch today's challenge"
      );
    }
  }
);

export const selectGame = createAsyncThunk(
  "dailyChallenge/selectGame",
  async ({ gameId, token }, { rejectWithValue }) => {
    try {
      const response = await apiSelectChallengeGame(gameId, token);
      if (!response.success)
        throw new Error(response.error || "Select game error");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to select game");
    }
  }
);

export const startTodayChallenge = createAsyncThunk(
  "dailyChallenge/start",
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await apiStartChallenge(token);
      if (!response.success) throw new Error(response.error || "Start error");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to start challenge");
    }
  }
);

/**
 * Complete a daily challenge
 * Updates challenge status and awards rewards
 */
export const completeTodayChallenge = createAsyncThunk(
  "dailyChallenge/complete",
  async ({ conversionId, token }, { rejectWithValue }) => {
    try {
      const response = await apiCompleteChallenge(conversionId, token);
      if (!response.success)
        throw new Error(response.error || "Complete challenge error");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to complete challenge");
    }
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate mock challenges for development
 */
function generateMockChallenges() {
  const challenges = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    challenges.push({
      id: `challenge_${date.getTime()}`,
      date: date.toISOString(),
      description: "Complete a purchase in any game",
      coinReward: 20,
      xpReward: 50,
      status: i < 5 ? "completed" : "expired",
      completedAt: i < 5 ? date.toISOString() : null,
    });
  }

  return challenges;
}

/**
 * Generate mock completed dates for development
 */
function generateMockCompletedDates() {
  const dates = [];
  const today = new Date();

  // Simulate completed challenges for the last 5 days
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString());
  }

  return dates;
}

/**
 * Calculate current streak from completed dates
 */
function calculateStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0;

  // Sort dates in descending order
  const sortedDates = completedDates
    .map((d) => new Date(d))
    .sort((a, b) => b - a);

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedDates.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    checkDate.setHours(0, 0, 0, 0);

    const completedDate = new Date(sortedDates[i]);
    completedDate.setHours(0, 0, 0, 0);

    if (checkDate.getTime() === completedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get end of current day
 */
function getEndOfDay() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

// ============================================================================
// SLICE
// ============================================================================

const dailyChallengeSlice = createSlice({
  name: "dailyChallenge",
  initialState,
  reducers: {
    /**
     * Reset daily challenge state
     */
    resetDailyChallengeState: (state) => {
      return initialState;
    },

    /**
     * Update streak manually (for testing)
     */
    setModalOpen: (state, action) => {
      state.modalOpen = action.payload;
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Calendar
      .addCase(fetchCalendar.pending, (state) => {
        state.calendarStatus = "loading";
        state.error = null;
      })
      .addCase(fetchCalendar.fulfilled, (state, action) => {
        state.calendarStatus = "succeeded";
        state.calendar = action.payload;
        if (action.payload?.streak) state.streak = action.payload.streak;
      })
      .addCase(fetchCalendar.rejected, (state, action) => {
        state.calendarStatus = "failed";
        state.error = action.payload;
      })

      // Today
      .addCase(fetchToday.pending, (state) => {
        state.todayStatus = "loading";
        state.error = null;
      })
      .addCase(fetchToday.fulfilled, (state, action) => {
        state.todayStatus = "succeeded";
        state.today = action.payload;
      })
      .addCase(fetchToday.rejected, (state, action) => {
        state.todayStatus = "failed";
        state.error = action.payload;
      })

      // Select game
      .addCase(selectGame.fulfilled, (state, action) => {
        if (!state.today) state.today = {};
        state.today.selectedGame = action.payload.selectedGame;
        // Some APIs include actions.canPlay flag
        if (state.today.actions) {
          state.today.actions.canPlay = !!action.payload.canPlayNow;
        }
      })

      // Start
      .addCase(startTodayChallenge.fulfilled, (state, action) => {
        if (!state.today) return;
        state.today.progress = state.today.progress || {};
        state.today.progress.status = "started";
        state.today.started = action.payload;
      })

      // Complete
      .addCase(completeTodayChallenge.pending, (state) => {
        state.completionStatus = "submitting";
        state.error = null;
      })
      .addCase(completeTodayChallenge.fulfilled, (state, action) => {
        state.completionStatus = "succeeded";
        if (state.today) {
          state.today.progress = state.today.progress || {};
          state.today.progress.status = "completed";
          state.today.progress.rewardsEarned = action.payload.rewards;
        }
        if (action.payload?.streak) state.streak = action.payload.streak;
      })
      .addCase(completeTodayChallenge.rejected, (state, action) => {
        state.completionStatus = "failed";
        state.error = action.payload;
      });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const { resetDailyChallengeState, setModalOpen, clearError } =
  dailyChallengeSlice.actions;

export default dailyChallengeSlice.reducer;
