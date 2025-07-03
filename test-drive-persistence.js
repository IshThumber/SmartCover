// Test script to verify Google Drive persistent state management
// This can be run in the browser console to test the functionality

(async function testDrivePersistence() {
  console.log("=== Testing Google Drive Persistent State ===");

  // Import the Drive API
  const { driveApi, checkDriveConnection } = await import("./src/utils/driveApi.js");

  console.log("1. Checking initial state...");
  const initialConnection = await checkDriveConnection();
  console.log("Initial connection status:", initialConnection);

  // Check localStorage state
  const savedState = localStorage.getItem("driveApiState");
  if (savedState) {
    const state = JSON.parse(savedState);
    console.log("2. Saved state in localStorage:", {
      hasAccessToken: !!state.accessToken,
      isSignedIn: state.isSignedIn,
      tokenExpiryTime: state.tokenExpiryTime ? new Date(state.tokenExpiryTime) : null,
      timeUntilExpiry: state.tokenExpiryTime
        ? Math.floor((state.tokenExpiryTime - Date.now()) / (60 * 1000)) + " minutes"
        : "N/A",
    });
  } else {
    console.log("2. No saved state found in localStorage");
  }

  console.log("3. Testing token validation...");
  if (driveApi.default) {
    const manager = driveApi.default;
    const isValid = await manager.validateStoredToken();
    console.log("Token validation result:", isValid);

    if (manager.isTokenExpiring()) {
      console.log("⚠️ Token is expiring soon! Time remaining:", manager.getTokenTimeRemaining(), "minutes");
    } else {
      console.log("✅ Token is not expiring soon");
    }
  }

  console.log("=== Test Complete ===");
})().catch(console.error);
