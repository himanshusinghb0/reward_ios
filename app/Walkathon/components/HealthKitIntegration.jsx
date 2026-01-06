"use client";
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";

/**
 * HealthKit Integration Component
 * Handles Apple HealthKit integration for iOS devices using native Capacitor bridge
 * 
 * Uses Capacitor's native bridge to directly call HealthKit APIs on iOS
 */
export const HealthKitIntegration = ({
    onStepsSynced,
    token,
    onError,
    isJoined = false,
}) => {
    const [isAuthorizing, setIsAuthorizing] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [error, setError] = useState(null);
    const [isIOS, setIsIOS] = useState(false);

    // Debug logging helper
    const logHealthKit = (label, data) => {
        console.log(`[🏃 HEALTHKIT] ${label}`, data);
    };

    // Check if running on iOS/Capacitor - iOS-specific detection
    useEffect(() => {
        const checkPlatform = async () => {
            try {
                logHealthKit("🔍 Starting Platform Detection", {
                    timestamp: new Date().toISOString(),
                    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
                    windowExists: typeof window !== "undefined",
                    capacitorExists: typeof Capacitor !== 'undefined'
                });

                if (typeof window !== "undefined") {
                    logHealthKit("✅ Window Object Available", {
                        hasCapacitor: typeof Capacitor !== 'undefined',
                        isNativePlatform: Capacitor?.isNativePlatform?.() || false,
                        platform: Capacitor?.getPlatform?.() || 'unknown'
                    });

                    // Check if running on native iOS platform
                    if (Capacitor.isNativePlatform()) {
                        const platform = Capacitor.getPlatform();
                        const isIOSPlatform = platform === "ios";
                        setIsIOS(isIOSPlatform);

                        logHealthKit("📱 Native Platform Detected", {
                            platform,
                            isIOS: isIOSPlatform,
                            isNative: true,
                            healthKitAvailable: isIOSPlatform
                        });

                        if (isIOSPlatform) {
                            logHealthKit("✅ iOS Platform Detected - HealthKit Available", {
                                platform: "ios",
                                healthKitAvailable: true,
                                canUseHealthKit: true,
                                nextSteps: [
                                    "HealthKit native bridge should be configured",
                                    "Can call isAvailable() to verify",
                                    "Can request authorization",
                                    "Can query steps"
                                ]
                            });

                            // Try to check if HealthKit bridge exists
                            try {
                                logHealthKit("🔍 Checking HealthKit Bridge Configuration", {
                                    hasCapacitorPlugins: !!(Capacitor.Plugins),
                                    hasHealthKitPlugin: !!(Capacitor.Plugins?.HealthKit),
                                    hasWindowCapacitor: !!(window.Capacitor),
                                    hasWindowPlugins: !!(window.Capacitor?.Plugins),
                                    hasWindowHealthKit: !!(window.Capacitor?.Plugins?.HealthKit)
                                });

                                // Try to detect if native bridge methods exist
                                const hasMethods = {
                                    isAvailable: false,
                                    requestAuthorization: false,
                                    querySteps: false
                                };

                                // Check Method 1
                                if (Capacitor.Plugins?.HealthKit) {
                                    hasMethods.isAvailable = typeof Capacitor.Plugins.HealthKit.isAvailable === 'function';
                                    hasMethods.requestAuthorization = typeof Capacitor.Plugins.HealthKit.requestAuthorization === 'function';
                                    hasMethods.querySteps = typeof Capacitor.Plugins.HealthKit.querySteps === 'function';
                                }

                                // Check Method 2
                                if (window.Capacitor?.Plugins?.HealthKit) {
                                    hasMethods.isAvailable = hasMethods.isAvailable || typeof window.Capacitor.Plugins.HealthKit.isAvailable === 'function';
                                    hasMethods.requestAuthorization = hasMethods.requestAuthorization || typeof window.Capacitor.Plugins.HealthKit.requestAuthorization === 'function';
                                    hasMethods.querySteps = hasMethods.querySteps || typeof window.Capacitor.Plugins.HealthKit.querySteps === 'function';
                                }

                                logHealthKit("📋 HealthKit Bridge Methods Check", {
                                    methodsFound: hasMethods,
                                    isAvailableExists: hasMethods.isAvailable,
                                    requestAuthorizationExists: hasMethods.requestAuthorization,
                                    queryStepsExists: hasMethods.querySteps,
                                    allMethodsAvailable: hasMethods.isAvailable && hasMethods.requestAuthorization && hasMethods.querySteps,
                                    status: hasMethods.isAvailable && hasMethods.requestAuthorization && hasMethods.querySteps
                                        ? "✅ All HealthKit methods available - Bridge configured correctly"
                                        : "⚠️ Some HealthKit methods missing - Bridge may not be configured",
                                    recommendations: hasMethods.isAvailable && hasMethods.requestAuthorization && hasMethods.querySteps
                                        ? []
                                        : [
                                            "Ensure HealthKitBridge.swift and HealthKitBridge.m exist in ios/App/App/",
                                            "Ensure bridge files are added to Xcode project",
                                            "Run: npx cap sync ios",
                                            "Open Xcode: npx cap open ios",
                                            "Build and run on physical iOS device"
                                        ]
                                });
                            } catch (err) {
                                logHealthKit("⚠️ Error Checking HealthKit Bridge", {
                                    error: err.message,
                                    stack: err.stack,
                                    note: "This is OK - will be checked when methods are called"
                                });
                            }
                        } else {
                            logHealthKit("❌ Not iOS Platform", {
                                platform,
                                isIOS: false,
                                healthKitAvailable: false,
                                reason: `Platform is ${platform}, not iOS`,
                                note: "HealthKit is only available on iOS devices"
                            });
                        }
                    } else {
                        // Running on web - HealthKit not available
                        logHealthKit("🌐 Running on Web Platform", {
                            isNativePlatform: false,
                            platform: Capacitor.getPlatform(),
                            healthKitAvailable: false,
                            reason: "Not running on native iOS platform",
                            note: "HealthKit requires a physical iOS device. Use Capacitor to build iOS app.",
                            instructions: [
                                "Run: npx cap add ios (if not done)",
                                "Run: npx cap sync ios",
                                "Run: npx cap open ios",
                                "Build and run on physical iOS device"
                            ]
                        });
                        setIsIOS(false);
                    }
                } else {
                    logHealthKit("❌ Window Object Not Available", {
                        reason: "Running in non-browser environment",
                        healthKitAvailable: false
                    });
                    setIsIOS(false);
                }
            } catch (err) {
                logHealthKit("❌ Error Checking Platform", {
                    error: err.message,
                    stack: err.stack,
                    healthKitAvailable: false
                });
                console.error("Error checking iOS platform:", err);
                setIsIOS(false);
            }
        };
        checkPlatform();
    }, []);

    /**
     * Call native iOS HealthKit method using Capacitor bridge
     * Full implementation with native Capacitor plugin support
     */
    const callNativeMethod = useCallback(async (methodName, options = {}) => {
        logHealthKit("📞 Calling Native Method", {
            method: methodName,
            options,
            isIOS,
            isNativePlatform: Capacitor.isNativePlatform(),
            platform: Capacitor.getPlatform()
        });

        if (!isIOS || !Capacitor.isNativePlatform()) {
            const errorMsg = "HealthKit is only available on iOS devices";
            logHealthKit("❌ Native Method Failed", {
                method: methodName,
                reason: "Not iOS or not native platform",
                isIOS,
                isNativePlatform: Capacitor.isNativePlatform(),
                platform: Capacitor.getPlatform()
            });
            throw new Error(errorMsg);
        }

        try {
            logHealthKit("🔍 Attempting Method Call", {
                method: methodName,
                attempt: "Method 1 - Capacitor.Plugins.HealthKit"
            });

            // Method 1: Try direct Capacitor plugins (primary method)
            if (Capacitor.Plugins && Capacitor.Plugins.HealthKit) {
                const plugin = Capacitor.Plugins.HealthKit;
                logHealthKit("✅ Found Capacitor.Plugins.HealthKit", {
                    plugin: !!plugin,
                    hasMethod: typeof plugin[methodName] === 'function',
                    methods: Object.keys(plugin || {})
                });

                if (plugin && typeof plugin[methodName] === 'function') {
                    try {
                        logHealthKit("📤 Executing Method (Method 1)", {
                            method: methodName,
                            options,
                            timestamp: new Date().toISOString()
                        });
                        const result = await plugin[methodName](options);
                        logHealthKit("✅ Method Success (Method 1)", {
                            method: methodName,
                            result,
                            hasResult: result !== undefined && result !== null
                        });
                        if (result !== undefined && result !== null) {
                            return result;
                        }
                    } catch (err) {
                        logHealthKit("⚠️ Method 1 Failed", {
                            method: methodName,
                            error: err.message,
                            stack: err.stack
                        });
                    }
                } else {
                    logHealthKit("❌ Method Not Found (Method 1)", {
                        method: methodName,
                        availableMethods: Object.keys(plugin || {})
                    });
                }
            } else {
                logHealthKit("❌ Capacitor.Plugins.HealthKit Not Found", {
                    hasPlugins: !!Capacitor.Plugins,
                    plugins: Capacitor.Plugins ? Object.keys(Capacitor.Plugins) : []
                });
            }

            logHealthKit("🔍 Attempting Method Call", {
                method: methodName,
                attempt: "Method 2 - window.Capacitor.Plugins"
            });

            // Method 2: Try window Capacitor bridge
            if (window.Capacitor?.Plugins) {
                const plugin = window.Capacitor.Plugins.HealthKit || window.Capacitor.Plugins['HealthKit'];
                logHealthKit("✅ Found window.Capacitor.Plugins", {
                    hasPlugins: !!window.Capacitor.Plugins,
                    hasHealthKit: !!plugin,
                    hasMethod: plugin && typeof plugin[methodName] === 'function',
                    allPlugins: Object.keys(window.Capacitor.Plugins || {})
                });

                if (plugin && typeof plugin[methodName] === 'function') {
                    try {
                        logHealthKit("📤 Executing Method (Method 2)", {
                            method: methodName,
                            options,
                            timestamp: new Date().toISOString()
                        });
                        const result = await plugin[methodName](options);
                        logHealthKit("✅ Method Success (Method 2)", {
                            method: methodName,
                            result,
                            hasResult: result !== undefined && result !== null
                        });
                        if (result !== undefined && result !== null) {
                            return result;
                        }
                    } catch (err) {
                        logHealthKit("⚠️ Method 2 Failed", {
                            method: methodName,
                            error: err.message,
                            stack: err.stack
                        });
                    }
                } else {
                    logHealthKit("❌ Method Not Found (Method 2)", {
                        method: methodName,
                        pluginExists: !!plugin,
                        pluginMethods: plugin ? Object.keys(plugin) : []
                    });
                }
            } else {
                logHealthKit("❌ window.Capacitor.Plugins Not Found", {
                    hasWindowCapacitor: !!window.Capacitor,
                    hasPlugins: !!(window.Capacitor?.Plugins)
                });
            }

            logHealthKit("🔍 Attempting Method Call", {
                method: methodName,
                attempt: "Method 3 - registerPlugin"
            });

            // Method 3: Dynamic plugin registration
            try {
                logHealthKit("📦 Importing registerPlugin", {});
                const { registerPlugin } = await import('@capacitor/core');
                logHealthKit("✅ registerPlugin Imported", {});

                const HealthKitPlugin = registerPlugin('HealthKit');
                logHealthKit("📝 Plugin Registered", {
                    plugin: !!HealthKitPlugin,
                    hasMethod: HealthKitPlugin && typeof HealthKitPlugin[methodName] === 'function',
                    methods: HealthKitPlugin ? Object.keys(HealthKitPlugin) : []
                });

                if (HealthKitPlugin && typeof HealthKitPlugin[methodName] === 'function') {
                    try {
                        logHealthKit("📤 Executing Method (Method 3)", {
                            method: methodName,
                            options,
                            timestamp: new Date().toISOString()
                        });
                        const result = await HealthKitPlugin[methodName](options);
                        logHealthKit("✅ Method Success (Method 3)", {
                            method: methodName,
                            result,
                            hasResult: result !== undefined && result !== null
                        });
                        if (result !== undefined && result !== null) {
                            return result;
                        }
                    } catch (err) {
                        logHealthKit("⚠️ Method 3 Failed", {
                            method: methodName,
                            error: err.message,
                            stack: err.stack
                        });
                    }
                } else {
                    logHealthKit("❌ Method Not Found (Method 3)", {
                        method: methodName,
                        pluginExists: !!HealthKitPlugin
                    });
                }
            } catch (err) {
                logHealthKit("❌ registerPlugin Failed", {
                    error: err.message,
                    stack: err.stack
                });
            }

            logHealthKit("🔍 Attempting Method Call", {
                method: methodName,
                attempt: "Method 4 - Direct Native Bridge"
            });

            // Method 4: Try Capacitor native bridge directly
            if (window.Capacitor?.isNativePlatform()) {
                logHealthKit("✅ Native Platform Detected", {
                    isNativePlatform: window.Capacitor.isNativePlatform(),
                    hasPlugins: !!(window.Capacitor.Plugins),
                    hasHealthKit: !!(window.Capacitor.Plugins?.HealthKit)
                });

                try {
                    logHealthKit("📤 Executing Method (Method 4)", {
                        method: methodName,
                        options,
                        timestamp: new Date().toISOString()
                    });
                    const result = await window.Capacitor.Plugins.HealthKit?.[methodName]?.(options);
                    logHealthKit("✅ Method Success (Method 4)", {
                        method: methodName,
                        result,
                        hasResult: result !== undefined && result !== null
                    });
                    if (result !== undefined && result !== null) {
                        return result;
                    }
                } catch (err) {
                    logHealthKit("⚠️ Method 4 Failed", {
                        method: methodName,
                        error: err.message,
                        stack: err.stack
                    });
                }
            } else {
                logHealthKit("❌ Not Native Platform (Method 4)", {
                    isNativePlatform: window.Capacitor?.isNativePlatform()
                });
            }

            // If all methods fail, native bridge not set up
            const errorMsg = `HealthKit native bridge not configured. All 4 methods failed. Please create HealthKitBridge.swift and HealthKitBridge.m files. See SETUP_IOS_HEALTHKIT.md for setup instructions.`;
            logHealthKit("❌ All Methods Failed", {
                method: methodName,
                methodsAttempted: 4,
                error: errorMsg,
                recommendations: [
                    "Ensure iOS platform is added: npx cap add ios",
                    "Ensure bridge files exist: HealthKitBridge.swift, HealthKitBridge.m",
                    "Ensure HealthKit framework is linked in Xcode",
                    "Ensure HealthKit capability is enabled in Xcode",
                    "Build and run on physical iOS device (not simulator)"
                ]
            });
            throw new Error(errorMsg);
        } catch (err) {
            logHealthKit("❌ Native Method Error", {
                method: methodName,
                error: err.message,
                stack: err.stack,
                name: err.name
            });
            throw err;
        }
    }, [isIOS]);

    /**
     * Request HealthKit authorization
     */
    const requestHealthKitAuth = useCallback(async () => {
        if (!isIOS) {
            const errorMsg = "HealthKit is only available on iOS devices";
            logHealthKit("Auth Skipped", { reason: "Not iOS", isIOS });
            setError(errorMsg);
            onError?.(errorMsg);
            return false;
        }

        logHealthKit("Requesting Authorization", { timestamp: new Date().toISOString() });
        setIsAuthorizing(true);
        setError(null);

        try {
            // Check if HealthKit is available
            logHealthKit("🔍 Checking HealthKit Availability", {
                timestamp: new Date().toISOString()
            });

            let available = false;
            try {
                const result = await callNativeMethod('isAvailable');
                available = result?.available ?? false;

                logHealthKit("✅ HealthKit Availability Check", {
                    available,
                    result,
                    message: available ? "HealthKit is available on this device" : "HealthKit is NOT available on this device"
                });
            } catch (err) {
                logHealthKit("⚠️ Could Not Check HealthKit Availability", {
                    error: err.message,
                    stack: err.stack,
                    note: "Will continue anyway - will fail gracefully if not available"
                });
                // Continue anyway - will fail gracefully if not available
            }

            // Request authorization
            logHealthKit("📝 Requesting HealthKit Authorization", {
                permissions: {
                    read: ['steps'],
                    write: []
                },
                timestamp: new Date().toISOString()
            });

            const authResult = await callNativeMethod('requestAuthorization', {
                read: ['steps'],
                write: []
            });

            logHealthKit("📥 Authorization Response Received", {
                authResult,
                granted: authResult?.granted,
                status: authResult?.status,
                permissions: authResult?.permissions
            });

            const granted = authResult?.granted ?? false;
            setIsAuthorized(granted);

            if (!granted) {
                logHealthKit("❌ Authorization Denied", {
                    authResult,
                    reason: authResult?.reason || "User denied or not available",
                    message: "HealthKit authorization denied. Please enable in Settings → Privacy → Health.",
                    instructions: [
                        "Open iPhone Settings",
                        "Go to Privacy & Security",
                        "Tap Health",
                        "Find WeWard app",
                        "Enable 'Read' permission for Steps"
                    ]
                });
                throw new Error("HealthKit authorization denied. Please enable in Settings → Privacy → Health.");
            }

            logHealthKit("✅ Authorization Granted Successfully", {
                granted,
                authResult,
                timestamp: new Date().toISOString(),
                nextStep: "Can now query steps from HealthKit"
            });
            return true;
        } catch (err) {
            console.error("HealthKit authorization error:", err);
            const errorMsg = err.message || "Failed to authorize HealthKit access. Ensure native bridge is set up.";
            setError(errorMsg);
            onError?.(errorMsg);
            return false;
        } finally {
            setIsAuthorizing(false);
        }
    }, [isIOS, callNativeMethod, onError]);

    /**
     * Sync steps from HealthKit
     */
    const syncSteps = useCallback(async () => {
        if (!isAuthorized) {
            logHealthKit("Sync Skipped", { reason: "Not authorized", isAuthorized, isJoined });
            return;
        }
        if (!isJoined) {
            logHealthKit("Sync Skipped", { reason: "User not joined", isAuthorized, isJoined });
            return;
        }

        logHealthKit("Starting Step Sync", { timestamp: new Date().toISOString(), isAuthorized, isJoined });
        setIsSyncing(true);
        setError(null);

        try {
            // Get today's date range
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Get device info
            logHealthKit("📱 Getting Device Information", {
                timestamp: new Date().toISOString()
            });

            let deviceInfo = {
                platform: "ios",
                appVersion: "1.0.0",
                deviceId: "device_ios",
                osVersion: "iOS 17.0",
            };

            try {
                const device = await Device.getInfo();
                deviceInfo = {
                    platform: device.platform || "ios",
                    appVersion: device.appVersion || "1.0.0",
                    deviceId: device.id || "device_ios",
                    osVersion: device.osVersion || "iOS 17.0",
                };

                logHealthKit("✅ Device Information Retrieved", {
                    deviceInfo,
                    device,
                    platform: deviceInfo.platform,
                    osVersion: deviceInfo.osVersion,
                    appVersion: deviceInfo.appVersion
                });
            } catch (err) {
                logHealthKit("⚠️ Could Not Get Device Info", {
                    error: err.message,
                    stack: err.stack,
                    usingDefaults: true,
                    defaultDeviceInfo: deviceInfo
                });
            }

            // Query steps from HealthKit - Full iOS SDK integration
            logHealthKit("📊 Preparing Step Query", {
                dateRange: {
                    start: today.toISOString(),
                    end: tomorrow.toISOString(),
                    startDate: today.toLocaleDateString(),
                    endDate: tomorrow.toLocaleDateString()
                },
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });

            let todaySteps = 0;
            try {
                // Call native HealthKit querySteps method
                // This uses HKStatisticsQuery from iOS HealthKit SDK
                logHealthKit("📤 Calling querySteps Native Method", {
                    startDate: today.toISOString(),
                    endDate: tomorrow.toISOString(),
                    dateFormat: "ISO 8601",
                    timestamp: new Date().toISOString()
                });

                const stepResult = await callNativeMethod('querySteps', {
                    startDate: today.toISOString(), // ISO 8601 format
                    endDate: tomorrow.toISOString() // ISO 8601 format
                });

                logHealthKit("📥 Step Query Response Received", {
                    stepResult,
                    rawSteps: stepResult?.steps,
                    rawValue: stepResult?.value,
                    resultType: typeof stepResult,
                    hasSteps: !!(stepResult?.steps),
                    hasValue: !!(stepResult?.value)
                });

                // Extract steps from native response
                const rawSteps = stepResult?.steps || stepResult?.value || 0;
                logHealthKit("🔍 Extracting Step Count", {
                    rawSteps,
                    fromSteps: stepResult?.steps,
                    fromValue: stepResult?.value,
                    extracted: rawSteps
                });

                todaySteps = rawSteps;

                // Validate step count
                if (isNaN(todaySteps) || todaySteps < 0) {
                    logHealthKit("⚠️ Invalid Step Count Detected", {
                        todaySteps,
                        isNaN: isNaN(todaySteps),
                        isNegative: todaySteps < 0,
                        settingToZero: true
                    });
                    todaySteps = 0;
                }

                logHealthKit("✅ Steps Queried Successfully", {
                    steps: todaySteps,
                    date: today.toLocaleDateString(),
                    startDate: today.toISOString(),
                    endDate: tomorrow.toISOString(),
                    validation: {
                        isNumber: typeof todaySteps === 'number',
                        isPositive: todaySteps >= 0,
                        isValid: !isNaN(todaySteps) && todaySteps >= 0
                    },
                    message: todaySteps > 0
                        ? `Successfully retrieved ${todaySteps.toLocaleString()} steps from HealthKit`
                        : "No steps found for today (may need to walk more or check HealthKit permissions)"
                });
            } catch (err) {
                // If native method fails, log error
                logHealthKit("❌ Step Query Failed", {
                    error: err.message,
                    stack: err.stack,
                    name: err.name,
                    dateRange: {
                        start: today.toISOString(),
                        end: tomorrow.toISOString()
                    },
                    troubleshooting: [
                        "Check if HealthKit native bridge is configured",
                        "Verify HealthKit permissions are granted",
                        "Ensure running on physical iOS device (not simulator)",
                        "Check if Health app has step data for today"
                    ]
                });

                // Only use mock data in development for testing UI
                if (process.env.NODE_ENV === 'development') {
                    todaySteps = Math.floor(Math.random() * 5000) + 1000;
                    logHealthKit("⚠️ Using Mock Data (Development Only)", {
                        mockSteps: todaySteps,
                        reason: "Native method failed, using mock data for UI testing",
                        note: "This will NOT work in production - ensure native bridge is configured",
                        originalError: err.message
                    });
                } else {
                    // In production, re-throw the error
                    logHealthKit("❌ Production Error - Cannot Use Mock Data", {
                        error: err.message,
                        environment: process.env.NODE_ENV,
                        action: "Re-throwing error for production"
                    });
                    throw new Error(
                        `Failed to query steps from HealthKit: ${err.message}. ` +
                        `Ensure native bridge is properly configured.`
                    );
                }
            }

            // Format step data for backend API
            // This matches the backend validation exactly
            logHealthKit("📦 Formatting Step Data for Backend", {
                rawSteps: todaySteps,
                todayISO: today.toISOString(),
                deviceInfo,
                timestamp: new Date().toISOString()
            });

            const syncData = {
                steps: todaySteps, // Integer: 0-100,000 (validated by backend)
                date: today.toISOString(), // ISO 8601: "2025-10-20T00:00:00.000Z"
                source: "healthkit", // Must be: "healthkit" | "manual" | "imported"
                deviceInfo: {
                    platform: deviceInfo.platform || "ios",
                    appVersion: deviceInfo.appVersion || "1.0.0",
                    deviceId: deviceInfo.deviceId || "device_ios",
                    osVersion: deviceInfo.osVersion || "iOS 17.0",
                },
                healthKitData: {
                    isAuthorized: true,
                    lastSyncDate: new Date().toISOString(),
                    dataQuality: "high", // "high" | "medium" | "low"
                },
            };

            logHealthKit("✅ Step Data Formatted", {
                syncData,
                validation: {
                    stepsIsNumber: typeof syncData.steps === 'number',
                    stepsInRange: syncData.steps >= 0 && syncData.steps <= 100000,
                    dateIsISO: syncData.date.includes('T') && syncData.date.includes('Z'),
                    sourceIsHealthKit: syncData.source === 'healthkit',
                    hasDeviceInfo: !!syncData.deviceInfo,
                    hasHealthKitData: !!syncData.healthKitData
                },
                dataSize: JSON.stringify(syncData).length + " bytes"
            });

            logHealthKit("📤 Sending Step Data to Backend", {
                steps: syncData.steps,
                date: syncData.date,
                source: syncData.source,
                deviceInfo: syncData.deviceInfo,
                healthKitData: syncData.healthKitData,
                timestamp: new Date().toISOString()
            });

            await onStepsSynced?.(syncData);

            logHealthKit("✅ Steps Synced to Backend Successfully", {
                steps: syncData.steps,
                date: syncData.date,
                timestamp: new Date().toISOString(),
                nextStep: "Backend should update progress and leaderboard"
            });

            setLastSync(new Date());
            logHealthKit("🕐 Last Sync Time Updated", {
                lastSync: new Date().toISOString()
            });
        } catch (err) {
            console.error("HealthKit sync error:", err);
            const errorMsg = err.message || "Failed to sync steps from HealthKit";
            setError(errorMsg);
            onError?.(errorMsg);
        } finally {
            setIsSyncing(false);
        }
    }, [isAuthorized, isJoined, onStepsSynced, onError, callNativeMethod]);

    // Auto-sync when joined and authorized
    useEffect(() => {
        logHealthKit("🔄 Auto-Sync Setup Check", {
            isJoined,
            isAuthorized,
            willSetup: isJoined && isAuthorized,
            timestamp: new Date().toISOString()
        });

        if (isJoined && isAuthorized) {
            logHealthKit("✅ Setting Up Auto-Sync", {
                interval: "30 seconds",
                willPerformInitialSync: true,
                timestamp: new Date().toISOString()
            });

            // Initial sync
            logHealthKit("🚀 Performing Initial Sync", {
                timestamp: new Date().toISOString()
            });
            syncSteps();

            // Set up periodic sync (every 30 seconds for real-time updates)
            logHealthKit("⏰ Setting Up Periodic Sync Interval", {
                interval: 30000,
                intervalSeconds: 30,
                note: "Will sync every 30 seconds as per AC2 requirement"
            });

            const interval = setInterval(() => {
                logHealthKit("⏰ Periodic Sync Triggered", {
                    interval: "30 seconds",
                    timestamp: new Date().toISOString()
                });
                syncSteps();
            }, 30000); // 30 seconds - real-time syncing as per AC2

            return () => {
                logHealthKit("🛑 Auto-Sync Stopped", {
                    reason: "Component unmounted or dependencies changed",
                    timestamp: new Date().toISOString()
                });
                clearInterval(interval);
            };
        } else {
            logHealthKit("⏸️ Auto-Sync Not Setup", {
                reason: !isJoined ? "User not joined" : "HealthKit not authorized",
                isJoined,
                isAuthorized
            });
        }
    }, [isJoined, isAuthorized, syncSteps]);

    // Log component render status
    useEffect(() => {
        logHealthKit("🎨 Component Render Status", {
            isIOS,
            isAuthorized,
            isAuthorizing,
            isSyncing,
            isJoined,
            hasError: !!error,
            errorMessage: error || null,
            lastSync: lastSync ? lastSync.toISOString() : null,
            componentMounted: true,
            timestamp: new Date().toISOString()
        });
    }, [isIOS, isAuthorized, isAuthorizing, isSyncing, isJoined, error, lastSync]);

    return (
        <div className="w-full px-4 space-y-4">
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-900/20 border border-red-500/50 rounded-lg p-3"
                    >
                        <p className="text-red-400 text-sm">{error}</p>
                        {error.includes("HealthKit") && (
                            <p className="text-gray-400 text-xs mt-2">
                                Make sure "Movement and Fitness" is enabled in Settings → Privacy & Security → Health.
                            </p>
                        )}
                        {error.includes("native bridge") && (
                            <p className="text-orange-400 text-xs mt-2">
                                ⚠️ Please set up the native HealthKit bridge. See IOS_SETUP.md for instructions.
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {!isIOS && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-900/20 border border-gray-700/50 rounded-lg p-4"
                >
                    <div className="space-y-2">
                        <p className="text-gray-400 text-sm text-center">
                            HealthKit integration is only available on iOS devices.
                        </p>
                        <p className="text-gray-500 text-xs text-center">
                            Platform: {Capacitor.getPlatform()} | Native: {Capacitor.isNativePlatform() ? "Yes" : "No"}
                        </p>
                    </div>
                </motion.div>
            )}

            {isIOS && !isAuthorized && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">🏃</div>
                        <div className="flex-1">
                            <h4 className="text-white font-semibold mb-2">
                                Connect Apple Health
                            </h4>
                            <p className="text-gray-300 text-sm mb-3">
                                Authorize WeWard to access your step count from Apple Health to
                                track your progress automatically. Steps will sync in real-time.
                            </p>
                            {error && (
                                <p className="text-gray-400 text-xs mb-3 mt-2">
                                    If after authorizing WeWard to access Apple Health, your
                                    counter is still at zero, check that the "Movement and
                                    Fitness" option is enabled in{" "}
                                    <span className="text-blue-400 underline">your settings</span>
                                    .
                                </p>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={requestHealthKitAuth}
                                disabled={isAuthorizing}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isAuthorizing ? "Authorizing..." : "Open Apple Health"}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}

            {isIOS && isAuthorized && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-green-900/20 border border-green-500/50 rounded-lg p-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">✅</div>
                            <div>
                                <p className="text-white font-semibold">Apple Health Connected</p>
                                {lastSync && (
                                    <p className="text-gray-400 text-xs">
                                        Last synced: {lastSync.toLocaleTimeString()}
                                    </p>
                                )}
                                <p className="text-green-400 text-xs mt-1">
                                    Auto-syncing every 30 seconds
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={syncSteps}
                            disabled={isSyncing || !isJoined}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSyncing ? "Syncing..." : "Sync Now"}
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {isSyncing && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"
                    />
                    <p className="text-gray-400 text-sm mt-2">Syncing steps from HealthKit...</p>
                </motion.div>
            )}
        </div>
    );
};
