import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  raiseTicket,
  getUserTickets,
  getTicketDetails,
  getTicketStats,
  deleteTicket,
  getUserGamesList,
} from "@/lib/api";

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Create a new support ticket
 */
export const createTicket = createAsyncThunk(
  "tickets/createTicket",
  async ({ ticketData, token }, { rejectWithValue }) => {
    try {
      const response = await raiseTicket(ticketData, token);
      if (response?.success && response.data?.ticketId) {
        return response.data;
      } else {
        throw new Error(response?.message || "Failed to create ticket");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create ticket");
    }
  }
);

/**
 * Fetch user's tickets with optional filters
 */
export const fetchUserTickets = createAsyncThunk(
  "tickets/fetchUserTickets",
  async ({ filters = {}, token }, { rejectWithValue }) => {
    try {
      const response = await getUserTickets(filters, token);
      if (response?.success && response.data) {
        return {
          tickets: response.data.tickets || [],
          pagination: response.data.pagination || null,
        };
      } else {
        throw new Error(response?.message || "Failed to fetch tickets");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch tickets");
    }
  }
);

/**
 * Fetch ticket statistics
 */
export const fetchTicketStats = createAsyncThunk(
  "tickets/fetchTicketStats",
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await getTicketStats(token);
      if (response?.success && response.data) {
        return response.data;
      } else {
        throw new Error(response?.message || "Failed to fetch ticket stats");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch ticket stats");
    }
  }
);

/**
 * Fetch user's games list for ticket form
 */
export const fetchUserGames = createAsyncThunk(
  "tickets/fetchUserGames",
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await getUserGamesList(token);
      if (response?.success && response.data) {
        return response.data.games || [];
      } else {
        throw new Error(response?.message || "Failed to fetch user games");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch user games");
    }
  }
);

/**
 * Delete a ticket
 */
export const removeTicket = createAsyncThunk(
  "tickets/removeTicket",
  async ({ ticketId, token }, { rejectWithValue }) => {
    try {
      const response = await deleteTicket(ticketId, token);
      if (response?.success) {
        return ticketId;
      } else {
        throw new Error(response?.message || "Failed to delete ticket");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete ticket");
    }
  }
);

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  // Ticket data
  tickets: [],
  userGames: [],
  stats: null,

  // Loading states
  loading: {
    tickets: false,
    stats: false,
    games: false,
    creating: false,
    deleting: false,
  },

  // Error states
  errors: {
    tickets: null,
    stats: null,
    games: null,
    creating: null,
    deleting: null,
  },

  // UI state
  filters: {
    status: "all",
    category: null,
    page: 1,
    limit: 20,
  },

  pagination: null,

  // Success states
  lastCreatedTicket: null,
  lastDeletedTicket: null,
};

// ============================================================================
// SLICE
// ============================================================================

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.errors = {
        tickets: null,
        stats: null,
        games: null,
        creating: null,
        deleting: null,
      };
    },

    // Clear success states
    clearSuccessStates: (state) => {
      state.lastCreatedTicket = null;
      state.lastDeletedTicket = null;
    },

    // Update filters (client-side only, no API call)
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Clear any existing filter errors when updating filters
      state.errors.tickets = null;
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = {
        status: "all",
        category: null,
        page: 1,
        limit: 20,
      };
    },

    // Clear tickets data
    clearTickets: (state) => {
      state.tickets = [];
      state.pagination = null;
      state.errors.tickets = null;
    },

    // Set loading state
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
  },
  extraReducers: (builder) => {
    // ============================================================================
    // CREATE TICKET
    // ============================================================================
    builder
      .addCase(createTicket.pending, (state) => {
        state.loading.creating = true;
        state.errors.creating = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.lastCreatedTicket = action.payload;
        state.errors.creating = null;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading.creating = false;
        state.errors.creating = action.payload;
      });

    // ============================================================================
    // FETCH USER TICKETS
    // ============================================================================
    builder
      .addCase(fetchUserTickets.pending, (state) => {
        state.loading.tickets = true;
        state.errors.tickets = null;
      })
      .addCase(fetchUserTickets.fulfilled, (state, action) => {
        state.loading.tickets = false;
        state.tickets = action.payload.tickets;
        state.pagination = action.payload.pagination;
        state.errors.tickets = null;
      })
      .addCase(fetchUserTickets.rejected, (state, action) => {
        state.loading.tickets = false;
        state.errors.tickets = action.payload;
      });

    // ============================================================================
    // FETCH TICKET STATS
    // ============================================================================
    builder
      .addCase(fetchTicketStats.pending, (state) => {
        state.loading.stats = true;
        state.errors.stats = null;
      })
      .addCase(fetchTicketStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
        state.errors.stats = null;
      })
      .addCase(fetchTicketStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.errors.stats = action.payload;
      });

    // ============================================================================
    // FETCH USER GAMES
    // ============================================================================
    builder
      .addCase(fetchUserGames.pending, (state) => {
        state.loading.games = true;
        state.errors.games = null;
      })
      .addCase(fetchUserGames.fulfilled, (state, action) => {
        state.loading.games = false;
        state.userGames = action.payload;
        state.errors.games = null;
      })
      .addCase(fetchUserGames.rejected, (state, action) => {
        state.loading.games = false;
        state.errors.games = action.payload;
      });

    // ============================================================================
    // DELETE TICKET
    // ============================================================================
    builder
      .addCase(removeTicket.pending, (state) => {
        state.loading.deleting = true;
        state.errors.deleting = null;
      })
      .addCase(removeTicket.fulfilled, (state, action) => {
        state.loading.deleting = false;
        state.tickets = state.tickets.filter(
          (ticket) => ticket.id !== action.payload
        );
        state.lastDeletedTicket = action.payload;
        state.errors.deleting = null;
      })
      .addCase(removeTicket.rejected, (state, action) => {
        state.loading.deleting = false;
        state.errors.deleting = action.payload;
      });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const {
  clearErrors,
  clearSuccessStates,
  updateFilters,
  resetFilters,
  clearTickets,
  setLoading,
} = ticketSlice.actions;

export default ticketSlice.reducer;

// ============================================================================
// SELECTORS
// ============================================================================

export const selectTickets = (state) => state.tickets.tickets;
export const selectUserGames = (state) => state.tickets.userGames;
export const selectTicketStats = (state) => state.tickets.stats;
export const selectTicketFilters = (state) => state.tickets.filters;
export const selectTicketPagination = (state) => state.tickets.pagination;

export const selectTicketLoading = (state) => state.tickets.loading;
export const selectTicketErrors = (state) => state.tickets.errors;

export const selectLastCreatedTicket = (state) =>
  state.tickets.lastCreatedTicket;
export const selectLastDeletedTicket = (state) =>
  state.tickets.lastDeletedTicket;

// Computed selectors
export const selectFilteredTickets = (state) => {
  const tickets = selectTickets(state);
  const filters = selectTicketFilters(state);

  if (filters.status === "all") return tickets;

  // Client-side filtering for better performance
  return tickets.filter((ticket) => ticket.status === filters.status);
};

// Selector for paginated tickets (client-side pagination)
export const selectPaginatedTickets = (state) => {
  const filteredTickets = selectFilteredTickets(state);
  const filters = selectTicketFilters(state);
  const limit = filters.limit || 20;
  const page = filters.page || 1;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    tickets: filteredTickets.slice(startIndex, endIndex),
    totalCount: filteredTickets.length,
    hasMore: endIndex < filteredTickets.length,
    currentPage: page,
    totalPages: Math.ceil(filteredTickets.length / limit),
  };
};

export const selectTicketLoadingState = (state) => {
  const loading = selectTicketLoading(state);
  return {
    isLoading: loading.tickets || loading.stats || loading.games,
    isCreating: loading.creating,
    isDeleting: loading.deleting,
    isFiltering: false, // No more filtering loading since we use client-side filtering
  };
};
