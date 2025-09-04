"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"; // Import auth context
import { updateLocationSettings, updateLocation } from "@/lib/api"; // Import API functions
import { Geolocation } from '@capacitor/geolocation';

export default function LocationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // State for user feedback
  const router = useRouter();
  const [isSkipping, setIsSkipping] = useState(false);
  const { user, token } = useAuth(); // Get user and token for API calls
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  // --- 2. THIS IS THE REPLACED FUNCTION THAT USES THE NATIVE PLUGIN ---
  const handleContinue = async () => {
    if (!user || !token) {
      setError("Authentication session not found. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, request permission. This triggers the native Android dialog.
      const permissionStatus = await Geolocation.requestPermissions();

      if (permissionStatus.location === 'granted') {
        // If permission is granted, get the current GPS position.
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
        });
        const { latitude, longitude } = position.coords;

        // Update your backend with the location data and settings
        await Promise.all([
          updateLocationSettings(user.mobile, "granted", "while_using"),
          updateLocation({ latitude, longitude }, token)
        ]);
        localStorage.setItem("locationCompleted", "true");

        // Navigate to the next page on success
        router.push("/homepage");

      } else {
        // This block runs if the user taps "Don't allow"
        console.warn('Location permission was denied by the user.');
        await updateLocationSettings(user.mobile, "denied", "never");
        setError("Location access is required for key features. You can enable it later in app settings.");
      }
    } catch (err) {
      console.error("Geolocation plugin error:", err);
      // This block handles errors like the user's GPS being turned off
      let errorMessage = "Could not get your location. Please ensure location services are enabled on your device and try again.";

      try {
        await updateLocationSettings(user.mobile, "denied", "never");
      } catch (apiError) {
        console.error("Failed to update settings after location error:", apiError);
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) {
      setError("Authentication session not found. Please log in again.");
      return;
    }

    setIsSkipping(true);
    setError(null);

    try {
      // Update the backend immediately when the user chooses to skip
      await updateLocationSettings(user.mobile, "denied", "never");
      console.log("User chose to skip. Settings updated, showing warning.");

      // THIS IS THE KEY CHANGE: Show the in-page warning
      setShowSkipWarning(true);

    } catch (apiError) {
      console.error("Failed to update location settings on skip:", apiError);
      setError("An error occurred. Please try again.");
    } finally {
      // Stop the "Skipping..." loader, the user will now see the warning
      setIsSkipping(false);
    }
  };

  const handleConfirmSkip = () => {
    router.push("/homepage");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div
      className="relative w-screen h-screen bg-[#272052] overflow-hidden"
      data-model-id="949:9584"
    >
      <div className="relative w-full max-w-[375px] h-full mx-auto flex flex-col">
        {/* Background blur effect */}
        <div className="absolute w-[300px] h-[300px] top-20 left-1/2 transform -translate-x-1/2 bg-[#af7de6] rounded-full blur-[200px] opacity-60" />

        {/* Header */}
        <div className="flex items-center justify-between w-full px-5 pt-12 pb-4 z-10">
          <button
            className="w-6 h-6 cursor-pointer"
            aria-label="Go back"
            onClick={handleGoBack}
          >
            <img
              className="w-full h-full"
              alt=""
              src="https://c.animaapp.com/gGYGC01x/img/arrow-back-ios-new@2x.png"
            />
          </button>

          <h1 className="text-[#FFFFFF] [font-family:'Poppins',Helvetica] mr-20 font-semibold text-xl text-center">
            Location Access
          </h1>

          <div className="w-6 h-6"></div>
        </div>

        {/* Main content - centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="flex flex-col items-center text-center max-w-sm">
            <div className="w-64 h-64 mb-6 flex items-center justify-center">
              <img
                className="w-full h-full object-contain"
                alt="Location access illustration"
                src="https://c.animaapp.com/gGYGC01x/img/image-4028@2x.png"
                loading="eager"
              />
            </div>

            <p className="text-[#F4F3FC] [font-family:'Poppins',Helvetica] font-normal text-lg leading-relaxed mb-8">
              You must select &quot;Allow While Using the App&quot; on the next
              screen for Jackson app to work
            </p>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="w-full px-6 pb-8">

          {!showSkipWarning ? (
            <div className="w-full max-w-sm mx-auto">
              <button
                className="w-full h-12 rounded-xl bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] cursor-pointer transition-opacity duration-200 hover:opacity-90 active:opacity-80 disabled:opacity-50 flex items-center justify-center mb-4"
                onClick={handleContinue}
                disabled={isLoading || isSkipping}
              >
                <span className="[font-family:'Poppins',Helvetica] font-semibold text-white text-base">
                  {isLoading ? "Requesting..." : "Continue"}
                </span>
              </button>

              <button
                onClick={handleSkip}
                disabled={isLoading || isSkipping}
                className="w-full py-3 [font-family:'Poppins',Helvetica] font-medium text-[#FFFFFF] text-sm text-center hover:text-white transition-colors duration-200 disabled:opacity-50"
              >
                {isSkipping ? "Updating..." : "Skip for now (Jackson won't work)"}
              </button>
            </div>
          ) : (
            <div className="w-full max-w-sm mx-auto">
              <p className="mb-6 text-yellow-300 [font-family:'Poppins',Helvetica] text-sm text-center leading-relaxed">
                Warning: Location-dependent features won't work correctly if you skip this step.
              </p>

              <button
                className="w-full h-12 rounded-xl bg-[linear-gradient(180deg,rgba(226,106,106,1)_0%,rgba(192,57,43,1)_100%)] cursor-pointer transition-opacity duration-200 hover:opacity-90 active:opacity-80 flex items-center justify-center"
                onClick={handleConfirmSkip}
              >
                <span className="[font-family:'Poppins',Helvetica] font-semibold text-white text-base">
                  Proceed Anyway
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

