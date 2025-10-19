import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProfile,
  getProfileStats,
  getVipStatus,
  getHomeDashboard,
  updateProfile as apiUpdateProfile,
  getLocationHistory,
  getUserAchievements,
} from "@/lib/api";

const initialState = {
  details: null,
  stats: null,
  vipStatus: null,
  dashboardData: null,
  locationHistory: null,
  achievements: [],
  detailsStatus: "idle",
  statsStatus: "idle",
  vipStatusState: "idle",
  dashboardStatus: "idle",
  locationStatus: "idle",
  achievementsStatus: "idle",
  error: null,
};

export const fetchHomeDashboard = createAsyncThunk(
  "profile/fetchHomeDashboard",
  async (token, { rejectWithValue }) => {
    try {
      return await getHomeDashboard(token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//Fetch user's main profile details
export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (token, { rejectWithValue }) => {
    try {
      return await getProfile(token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch user's stats (earnings, XP, etc.)
export const fetchProfileStats = createAsyncThunk(
  "profile/fetchProfileStats",
  async (token, { rejectWithValue }) => {
    try {
      return await getProfileStats(token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//  Fetch user's VIP status
export const fetchVipStatus = createAsyncThunk(
  "profile/fetchVipStatus",
  async (token, { rejectWithValue }) => {
    try {
      return await getVipStatus(token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//  Handle updating the user profile
export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async ({ profileData, token }, { dispatch, getState, rejectWithValue }) => {
    try {
      await apiUpdateProfile(profileData, token);
      const currentState = getState();
      const currentProfile = currentState.profile.details;
      return {
        ...currentProfile,
        ...profileData,
        profile: {
          ...currentProfile?.profile,
          ...profileData,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch user's location history
export const fetchLocationHistory = createAsyncThunk(
  "profile/fetchLocationHistory",
  async (token, { rejectWithValue }) => {
    try {
      return await getLocationHistory(token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch user's achievements
export const fetchUserAchievements = createAsyncThunk(
  "profile/fetchUserAchievements",
  async (
    { token, category = "games", status = "completed" },
    { rejectWithValue }
  ) => {
    try {
      return await getUserAchievements(token, category, status);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- SLICE DEFINITION ---
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.details = null;
      state.dashboardData = null;
      state.stats = null;
      state.vipStatus = null;
      state.locationHistory = null;
      state.achievements = [];
      state.detailsStatus = "idle";
      state.statsStatus = "idle";
      state.vipStatusState = "idle";
      state.dashboardStatus = "idle";
      state.locationStatus = "idle";
      state.achievementsStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeDashboard.pending, (state) => {
        state.dashboardStatus = "loading";
      })
      .addCase(fetchHomeDashboard.fulfilled, (state, action) => {
        state.dashboardStatus = "succeeded";
        state.dashboardData = action.payload;
      })

      // Reducers for fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.detailsStatus = "loading";
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.detailsStatus = "succeeded";
        state.details = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.detailsStatus = "failed";
        state.error = action.payload;
      })

      //  Reducers for fetchProfileStats
      .addCase(fetchProfileStats.pending, (state) => {
        state.statsStatus = "loading";
      })
      .addCase(fetchProfileStats.fulfilled, (state, action) => {
        state.statsStatus = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchProfileStats.rejected, (state, action) => {
        state.statsStatus = "failed";
        state.error = action.payload;
      })

      //  Reducers for fetchVipStatus
      .addCase(fetchVipStatus.pending, (state) => {
        state.vipStatusState = "loading";
      })
      .addCase(fetchVipStatus.fulfilled, (state, action) => {
        state.vipStatusState = "succeeded";
        state.vipStatus = action.payload;
      })
      .addCase(fetchVipStatus.rejected, (state, action) => {
        state.vipStatusState = "failed";
        state.error = action.payload;
      })

      //Reducers for updateUserProfile (optional, for handling saving state)
      .addCase(updateUserProfile.pending, (state) => {})
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.details = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Reducers for fetchLocationHistory
      .addCase(fetchLocationHistory.pending, (state) => {
        state.locationStatus = "loading";
      })
      .addCase(fetchLocationHistory.fulfilled, (state, action) => {
        state.locationStatus = "succeeded";
        state.locationHistory = action.payload;
      })
      .addCase(fetchLocationHistory.rejected, (state, action) => {
        state.locationStatus = "failed";
        state.error = action.payload;
      })

      // Reducers for fetchUserAchievements
      .addCase(fetchUserAchievements.pending, (state) => {
        state.achievementsStatus = "loading";
      })
      .addCase(fetchUserAchievements.fulfilled, (state, action) => {
        state.achievementsStatus = "succeeded";
        state.achievements = action.payload.data?.achievements || [];
      })
      .addCase(fetchUserAchievements.rejected, (state, action) => {
        state.achievementsStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearProfile } = profileSlice.actions;

export default profileSlice.reducer;
