import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SubscriptionStatus = "trialing" | "active" | "none" | "expired";

type SessionState = {
  isAuthenticated: boolean;
  userName: string | null;
  userEmail: string | null;
  companyName: string | null;
  scope: "anonymous" | "checkout" | "full";
  activePlan: string | null;
  organizationId: string | null;
  isNewSignup: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  role: string | null;
};

const initialSessionState: SessionState = {
  isAuthenticated: false,
  userName: null,
  userEmail: null,
  companyName: null,
  scope: "anonymous",
  activePlan: null,
  organizationId: null,
  isNewSignup: false,
  subscriptionStatus: null,
  trialStartedAt: null,
  trialEndsAt: null,
  role: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState: initialSessionState,
  reducers: {
    setMockSession(state, action: PayloadAction<Partial<SessionState>>) {
      Object.assign(state, action.payload);
    },
    clearSession() {
      return initialSessionState;
    },
  },
});

type UiState = {
  mobileNavOpen: boolean;
};

const initialUiState: UiState = {
  mobileNavOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState: initialUiState,
  reducers: {
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload;
    },
  },
});

export const { setMockSession, clearSession } = sessionSlice.actions;
export const { setMobileNavOpen } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    session: sessionSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
