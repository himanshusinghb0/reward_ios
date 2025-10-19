"use client";

import React, { useEffect, useState } from 'react';
import { SplashScreen as CapSplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export default function SplashScreen({ children }) {
    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Check if we're running on a native platform (mobile) or web
                const isNative = Capacitor.isNativePlatform();

                if (isNative) {
                    // On mobile: Let the native splash screen show for the configured duration
                    // The native splash screen will auto-hide after 2 seconds
                    // We just need to wait for the app to be ready
                    const checkAppReady = () => {
                        const currentPath = window.location.pathname;
                        const isNotOnRootPage = currentPath !== '/';

                        if (isNotOnRootPage) {
                            // App has navigated - it's ready
                            setIsAppReady(true);
                        } else {
                            // Still loading - check again
                            setTimeout(checkAppReady, 100);
                        }
                    };

                    // Start checking after a short delay to let native splash show
                    setTimeout(checkAppReady, 500);
                } else {
                    // On web: No splash screen needed
                    setIsAppReady(true);
                }
            } catch (error) {
                console.error('Error in splash screen initialization:', error);
                setIsAppReady(true);
            }
        };

        initializeApp();
    }, []);

    // Always return children - let native splash screen handle the visual
    return children;
}