"use client";

import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store"; // Import the store and persistor

export function ReduxProvider({ children }) {
  // OPTIMIZED: Wrap with PersistGate to handle data persistence
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="text-white text-lg">Loading...</div>
          </div>
        }
        persistor={persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}
