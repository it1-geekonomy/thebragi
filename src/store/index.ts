import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";

type SessionState = {
  isAuthenticated: boolean;
  userName: string | null;
  scope: "anonymous" | "checkout" | "full";
  activePlan: string | null;
};

type CheckoutState = {
  selectedPlan: string | null;
  step: "account" | "verify" | "payment" | "success";
  organizationId: string | null;
  planId: string | null;
  userEmail: string | null;
};

const initialSessionState: SessionState = {
  isAuthenticated: false,
  userName: null,
  scope: "anonymous",
  activePlan: null,
};

const initialCheckoutState: CheckoutState = {
  selectedPlan: null,
  step: "account",
  organizationId: null,
  planId: null,
  userEmail: null,
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

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: initialCheckoutState,
  reducers: {
    selectPlan(state, action: PayloadAction<string>) {
      state.selectedPlan = action.payload;
      state.step = "account";
    },
    setCheckoutStep(state, action: PayloadAction<CheckoutState["step"]>) {
      state.step = action.payload;
    },
    setCheckoutData(state, action: PayloadAction<Partial<CheckoutState>>) {
      Object.assign(state, action.payload);
    },
    resetCheckout() {
      return initialCheckoutState;
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
export const { selectPlan, setCheckoutStep, setCheckoutData, resetCheckout } = checkoutSlice.actions;
export const { setMobileNavOpen } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    session: sessionSlice.reducer,
    checkout: checkoutSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

