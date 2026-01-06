/**
 * Web fallback for HealthKit plugin
 * HealthKit is iOS-only, so this provides a fallback for web/other platforms
 */
import { WebPlugin } from "@capacitor/core";

export class HealthKitWeb extends WebPlugin {
  async isAvailable() {
    console.warn("HealthKit is not available on web platform");
    return { available: false };
  }

  async requestAuthorization() {
    throw new Error(
      "HealthKit is not available on web platform. This feature requires an iOS device."
    );
  }

  async querySteps() {
    throw new Error(
      "HealthKit is not available on web platform. This feature requires an iOS device."
    );
  }
}

