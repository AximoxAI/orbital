import { X, Maximize2, Minimize2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { LiveKitApiFactory, Configuration } from "@/api-client";

const WS_URL = import.meta.env.VITE_LIVEKIT_URL;

const apiBaseUrl = import.meta.env.VITE_BACKEND_API_KEY;
const apiConfig = new Configuration({ basePath: apiBaseUrl });
// If you use authentication, pass the token in Configuration above.

const liveKitApi = LiveKitApiFactory(apiConfig);

const getLiveKitToken = async (
  roomName: string,
  identity: string,
  name?: string,
  metadata?: string
) => {
  // This returns a promise of AxiosResponse
  const res = await liveKitApi.livekitControllerGetToken(roomName, identity, name, metadata);
  if (res.status !== 200) throw new Error("Failed to get token");
  return res.data;
};

const TaskChatHeader = ({
  taskName,
  isFullPage,
  onClose,
  onMaximize,
  onMinimize,
  users,
}) => {
  const [showVideo, setShowVideo] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identity, setIdentity] = useState("");
  const [roomName, setRoomName] = useState(taskName || "");
  const [name, setName] = useState("");
  const [metadata, setMetadata] = useState("");

  const handleVideoClick = async () => {
    setShowVideo(true);
    setToken(null);
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await getLiveKitToken(roomName, identity, name, metadata);
      setToken(resp.accessToken);
    } catch (err) {
      setError((err as Error).message || "Failed to get token");
      setToken(null);
    }
    setLoading(false);
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
    setToken(null);
    setLoading(false);
    setError(null);
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 flex flex-wrap items-center gap-y-2 gap-x-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 truncate">Task Discussion</h3>
          <p className="text-xs sm:text-sm text-gray-600 truncate font-medium">{taskName}</p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={isFullPage ? onMinimize : onMaximize}
            className="hover:bg-gray-100 transition-colors duration-200"
            aria-label={isFullPage ? "Minimize" : "Maximize"}
          >
            {isFullPage ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* User Avatars Section + Video Call Button (right aligned) */}
      <div className="w-full max-w-[1500px] px-8 py-2 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          {/* Avatars row */}
          <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col items-center justify-center min-w-[90px] cursor-pointer group transition-all duration-200 hover:scale-105"
              >
                <div className="relative mb-3">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-3 border-white shadow-lg group-hover:shadow-xl transition-all duration-200"
                  />
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-3 border-white rounded-full shadow-sm"></div>
                  )}
                </div>
                <span className="text-sm text-gray-700 text-center max-w-[90px] truncate font-medium group-hover:text-gray-900 transition-colors duration-200">
                  {user.name}
                </span>
              </div>
            ))}
          </div>
          {/* Video call button at the far right */}
          <Button
            variant="outline"
            size="icon"
            className="ml-4 flex-shrink-0"
            onClick={handleVideoClick}
            aria-label="Start Video Call"
          >
            <Video className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* LiveKit Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div
            className="bg-white rounded-lg shadow-lg p-0 relative w-full max-w-3xl h-[80vh] flex flex-col pointer-events-auto"
            style={{ minHeight: 400, minWidth: 320 }}
            onClick={e => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={handleCloseVideo}
              aria-label="Close Video Call"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="flex-1 flex flex-col overflow-hidden p-6">
              {/* Show form if token is not fetched yet */}
              {!token && (
                <form onSubmit={handleJoinRoom} className="flex flex-col gap-3 items-center justify-center flex-1">
                  <input
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Room Name"
                    value={roomName}
                    onChange={e => setRoomName(e.target.value)}
                    required
                  />
                  <input
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Your Identity (unique user id)"
                    value={identity}
                    onChange={e => setIdentity(e.target.value)}
                    required
                  />
                  <input
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Display Name (optional)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  <input
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Metadata (optional)"
                    value={metadata}
                    onChange={e => setMetadata(e.target.value)}
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? "Joining..." : "Join Video Call"}
                  </Button>
                  {error && <span className="text-red-600">{error}</span>}
                </form>
              )}
              {/* Show LiveKitRoom after token is fetched */}
              {token && (
                <LiveKitRoom
                  token={token}
                  serverUrl={WS_URL}
                  connect={true}
                  style={{ width: "100%", height: "100%" }}
                >
                  <VideoConference style={{ width: "100%", height: "100%" }} />
                </LiveKitRoom>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskChatHeader;