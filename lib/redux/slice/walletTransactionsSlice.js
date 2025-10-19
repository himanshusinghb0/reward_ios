import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getWalletTransactions,
  getFullWalletTransactions,
  getWalletScreen,
} from "@/lib/api";

const initialState = {
  transactions: [],
  fullTransactions: [],
  walletScreen: null,
  status: "idle",
  fullTransactionsStatus: "idle",
  walletScreenStatus: "idle",
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasMore: false,
  },
  error: null,
};

// Fetch wallet transactions
export const fetchWalletTransactions = createAsyncThunk(
  "walletTransactions/fetchWalletTransactions",
  async ({ token, limit = 5 }, { rejectWithValue }) => {
    try {
      const response = await getWalletTransactions(token, limit);
      const transformedTransactions = response.map((transaction, index) => ({
        id: transaction._id,
        gameName: getGameNameFromDescription(transaction.description),
        coins: transaction.amount,
        xpBonus: getDefaultXpBonus(transaction.amount),
        gameLogoSrc: getDefaultGameImage(),
        status: transaction.status,
        description: transaction.description,
        referenceId: transaction.referenceId,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      }));
      return transformedTransactions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch full wallet transactions with pagination
export const fetchFullWalletTransactions = createAsyncThunk(
  "walletTransactions/fetchFullWalletTransactions",
  async (
    { token, page = 1, limit = 20, type = "all" },
    { rejectWithValue }
  ) => {
    try {
      const response = await getFullWalletTransactions(
        token,
        page,
        limit,
        type
      );

      console.log("🔍 [fetchFullWalletTransactions] API Response:", response);

      // Transform the API response to match the component's expected format
      // API returns array directly, not wrapped in data object
      const transformedTransactions = response.map((transaction) => ({
        id: transaction._id,
        gameName: getGameNameFromDescription(transaction.description),
        gameType: transaction.type === "credit" ? "Reward" : "Purchase",
        coins: transaction.amount,
        xpBonus: getDefaultXpBonus(transaction.amount),
        gameLogoSrc: getDefaultGameImage(),
        status: transaction.status,
        description: transaction.description,
        referenceId: transaction.referenceId,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      }));

      console.log(
        "🔍 [fetchFullWalletTransactions] Transformed Transactions:",
        transformedTransactions
      );

      return {
        transactions: transformedTransactions,
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalItems: transformedTransactions.length,
          hasMore: false,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch wallet screen data
export const fetchWalletScreen = createAsyncThunk(
  "walletTransactions/fetchWalletScreen",
  async (token, { rejectWithValue }) => {
    try {
      const response = await getWalletScreen(token);
      const walletScreenData = {
        user: response.data.user,
        wallet: response.data.wallet,
        xp: response.data.xp,
        highestEarningGames: response.data.highestEarningGames.map((game) => ({
          id: game.id,
          name: game.name,
          icon: game.icon,
          earnings: game.earnings,
          difficulty: game.difficulty,
          timeRequired: game.timeRequired,
          views: "5.6 K",
        })),
      };
      return walletScreenData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const getGameNameFromDescription = (description) => {
  if (!description) return "Game Reward";
  const parts = description.split("-");
  const gameName = parts[0].trim();
  return gameName || "Game Reward";
};

// Helper function to get default XP bonus based on coin amount
const getDefaultXpBonus = (coinAmount) => {
  if (coinAmount >= 100) return 50;
  if (coinAmount >= 50) return 50;
  if (coinAmount >= 25) return 50;
  if (coinAmount >= 10) return 50;
  return 50;
};

// Helper function to get default game image
const getDefaultGameImage = () => {
  return "/download.png";
};

// --- SLICE DEFINITION ---
const walletTransactionsSlice = createSlice({
  name: "walletTransactions",
  initialState,
  reducers: {
    clearWalletTransactions: (state) => {
      state.transactions = [];
      state.fullTransactions = [];
      state.walletScreen = null;
      state.status = "idle";
      state.fullTransactionsStatus = "idle";
      state.walletScreenStatus = "idle";
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasMore: false,
      };
      state.error = null;
    },
    addNewTransaction: (state, action) => {
      // Add a new transaction to the beginning of the list
      state.transactions.unshift(action.payload);
      state.fullTransactions.unshift(action.payload);
    },
    loadMoreTransactions: (state, action) => {
      // Append new transactions to existing ones for pagination
      state.fullTransactions = [...state.fullTransactions, ...action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletTransactions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWalletTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(fetchWalletTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        // Keep existing transactions on error to avoid UI flicker
      })

      // Reducers for fetchFullWalletTransactions
      .addCase(fetchFullWalletTransactions.pending, (state) => {
        state.fullTransactionsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchFullWalletTransactions.fulfilled, (state, action) => {
        state.fullTransactionsStatus = "succeeded";
        state.fullTransactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchFullWalletTransactions.rejected, (state, action) => {
        state.fullTransactionsStatus = "failed";
        state.error = action.payload;
        // Keep existing transactions on error to avoid UI flicker
      })

      // Reducers for fetchWalletScreen
      .addCase(fetchWalletScreen.pending, (state) => {
        state.walletScreenStatus = "loading";
        state.error = null;
      })
      .addCase(fetchWalletScreen.fulfilled, (state, action) => {
        state.walletScreenStatus = "succeeded";
        state.walletScreen = action.payload;
        state.error = null;
      })
      .addCase(fetchWalletScreen.rejected, (state, action) => {
        state.walletScreenStatus = "failed";
        state.error = action.payload;
        // Keep existing data on error to avoid UI flicker
      });
  },
});

export const {
  clearWalletTransactions,
  addNewTransaction,
  loadMoreTransactions,
} = walletTransactionsSlice.actions;

export default walletTransactionsSlice.reducer;
