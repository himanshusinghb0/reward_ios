package com.jackson.app;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Hide the action bar before splash screen
        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }
        
        // Install the splash screen
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        
        super.onCreate(savedInstanceState);
        
        // Hide the action bar again after super.onCreate
        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }
        
        // Keep the splash screen visible for a minimum duration
        splashScreen.setKeepOnScreenCondition(() -> {
            // You can add conditions here to control when to hide the splash screen
            // For now, we'll let it show for a minimum duration
            return false; // This will hide the splash screen immediately after the app loads
        });
    }
}
