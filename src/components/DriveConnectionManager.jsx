import React, { useState, useEffect } from "react";
import { Cloud, CloudOff, CheckCircle, AlertCircle, Loader2, ExternalLink, History, Settings } from "lucide-react";
import { checkDriveConnection, connectToDrive, disconnectFromDrive, getCoverLetterHistory } from "../utils/driveApi";

const DriveConnectionManager = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [coverLetterHistory, setCoverLetterHistory] = useState([]);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setIsCheckingConnection(true);
      const connected = await checkDriveConnection();
      setIsConnected(connected);

      if (connected) {
        await loadCoverLetterHistory();
      }

      onConnectionChange?.(connected);
    } catch (error) {
      console.error("Error checking Drive connection:", error);
      setError("Failed to check Google Drive connection");
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError("");

    try {
      await connectToDrive();
      setIsConnected(true);
      await loadCoverLetterHistory();
      onConnectionChange?.(true);
    } catch (error) {
      console.error("Error connecting to Drive:", error);
      setError(error.message || "Failed to connect to Google Drive");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    setError("");

    try {
      await disconnectFromDrive();
      setIsConnected(false);
      setCoverLetterHistory([]);
      setShowHistory(false);
      onConnectionChange?.(false);
    } catch (error) {
      console.error("Error disconnecting from Drive:", error);
      setError("Failed to disconnect from Google Drive");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCoverLetterHistory = async () => {
    try {
      const history = await getCoverLetterHistory();
      setCoverLetterHistory(history);
    } catch (error) {
      console.error("Error loading cover letter history:", error);
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory && isConnected) {
      loadCoverLetterHistory();
    }
  };

  if (isCheckingConnection) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="text-gray-600">Checking Google Drive connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status Card */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-700">Connected to Google Drive</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CloudOff className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-600">Not connected to Google Drive</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isConnected && (
              <button
                onClick={toggleHistory}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <History className="w-4 h-4" />
                History
              </button>
            )}

            <button
              onClick={isConnected ? handleDisconnect : handleConnect}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isConnected
                  ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
              {isLoading ? "Processing..." : isConnected ? "Disconnect" : "Connect to Drive"}
            </button>
          </div>
        </div>

        {/* Connection Info */}
        {isConnected && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              ✓ Your cover letters will be automatically saved to a "SmartCover" folder in your Google Drive
            </p>
          </div>
        )}

        {!isConnected && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              Connect your Google Drive to automatically save generated cover letters and access them anywhere
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Cover Letter History */}
      {showHistory && isConnected && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Cover Letter History</h3>
            <span className="text-sm text-gray-500">({coverLetterHistory.length} files)</span>
          </div>

          {coverLetterHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Cloud className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No cover letters saved to Drive yet</p>
              <p className="text-sm">Generated cover letters with Drive export will appear here</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {coverLetterHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Cloud className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.file_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {item.drive_file_id && (
                    <a
                      href={`https://drive.google.com/file/d/${item.drive_file_id}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriveConnectionManager;
