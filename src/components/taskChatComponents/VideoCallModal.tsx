"use client"

import { X, Video, Users, Loader2, Send, MessageCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/clerk-react"
import {
  LiveKitRoom,
  FocusLayout,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  useParticipants,
  LayoutContextProvider,
  useCreateLayoutContext,
  useChat,
  TrackRefContext,
  useTrackRefContext,
  useRoomContext,
} from "@livekit/components-react"
import { Track, ParticipantKind } from "livekit-client"
import "@livekit/components-styles"
import { LiveKitApiFactory, Configuration } from "@/api-client"

import { useToast } from "@/components/ui/use-toast"

const WS_URL = import.meta.env.VITE_LIVEKIT_URL

const apiBaseUrl = import.meta.env.VITE_BACKEND_API_KEY
const apiConfig = new Configuration({ basePath: apiBaseUrl })

const liveKitApi = LiveKitApiFactory(apiConfig)

const getLiveKitToken = async (roomName: string, identity: string, name?: string, metadata?: string) => {
  const res = await liveKitApi.livekitControllerGetToken(roomName, identity, name, metadata)
  if (res.status !== 200) throw new Error("Failed to get token")
  return res.data
}

interface VideoCallModalProps {
  taskName?: string
  onClose: () => void
}

function EnhancedChat() {
  const { chatMessages, send } = useChat()
  const [message, setMessage] = useState("")
  const [isExpanded, setIsExpanded] = useState(true)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      send(message.trim())
      setMessage("")
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white border-l-2 border-slate-100 shadow-lg">
      {/* Chat Header */}
      <CardHeader className="pb-3 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              <MessageCircle className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-gray-900">Chat</CardTitle>
              <CardDescription className="text-xs text-gray-500">{chatMessages.length} messages</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-0" : "rotate-45"}`} />
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <>
          {/* Messages Area */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="h-full overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="p-3 bg-gray-100 rounded-full mb-3">
                    <MessageCircle className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No messages yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className="group">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-slate-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {msg.from?.name || msg.from?.identity || "Anonymous"}
                          </span>
                          <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>

                        {/* Message Bubble */}
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
                          <p className="text-sm text-gray-800 leading-relaxed break-words">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>

          {/* Message Input */}
          <div className="border-t bg-white/90 backdrop-blur-sm p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="pr-12 border-gray-300 focus:border-slate-500 focus:ring-slate-500/20 bg-white"
                  maxLength={500}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-xs text-gray-400">{message.length}/500</span>
                </div>
              </div>
              <Button
                type="submit"
                disabled={!message.trim()}
                size="sm"
                className="px-3 bg-slate-600 hover:bg-slate-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </Card>
  )
}

// Custom ParticipantTile wrapper with proper props
function CustomParticipantTile({ trackRef, disableSpeakingIndicator = false, ...props }: any) {
  return (
    <ParticipantTile
      trackRef={trackRef}
      disableSpeakingIndicator={disableSpeakingIndicator}
      showConnectionQuality={true}
      showDisplayName={true}
      showMicrophone={true}
      showCamera={true}
      {...props}
      className="rounded-lg overflow-hidden shadow-md"
    />
  )
}

// Custom Video Conference with proper layout and controls
function MyVideoConference({ onLeave }: { onLeave: () => void }) {
  const layoutContext = useCreateLayoutContext()
  const participants = useParticipants()
  
  const { toast } = useToast()
  const callStartedRef = useRef(false)

  // Get all tracks for camera and screen share with proper options
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { 
      onlySubscribed: false,
      updateOnlyOn: [Track.Source.Camera, Track.Source.ScreenShare]
    },
  )

  // Separate screen share and camera tracks
  const screenShareTracks = tracks.filter((track) => track.source === Track.Source.ScreenShare)
  const cameraTracks = tracks.filter((track) => track.source === Track.Source.Camera)

  // Determine which layout to use
  const hasScreenShare = screenShareTracks.length > 0
  const focusTrack = hasScreenShare ? screenShareTracks[0] : null

  // Listen for room disconnect event to trigger onLeave
  const room = useRoomContext?.()
  
  useEffect(() => {
    if (!room) return

    const handleConnected = () => {
      if (!callStartedRef.current) {
        callStartedRef.current = true
        toast({ title: "Video Call Started", description: "You have joined the call." })
      }
    }

    const handleDisconnected = () => {
      if (callStartedRef.current) {
        callStartedRef.current = false
        toast({ title: "Video Call Ended", description: "You have left the call." })
      }
      onLeave()
    }

    room.on("connected", handleConnected)
    room.on("disconnected", handleDisconnected)
    return () => {
      room.off("connected", handleConnected)
      room.off("disconnected", handleDisconnected)
    }
  }, [room, onLeave, toast])

  return (
    <LayoutContextProvider value={layoutContext}>
      <div className="h-full flex flex-col relative">
        <RoomAudioRenderer />

        {/* Main content area */}
        <div className="flex-1 flex min-h-0">
          {/* Video area */}
          <div className="flex-1 relative bg-gray-900">
            {hasScreenShare && focusTrack ? (
              // Screen share layout with focus on screen share
              <div className="h-full flex flex-col">
                {/* Main screen share area */}
                <div className="flex-1 relative">
                  <FocusLayout trackRef={focusTrack}>
                    <CustomParticipantTile />
                  </FocusLayout>
                </div>
                
                {/* Camera thumbnails at bottom */}
                {cameraTracks.length > 0 && (
                  <div className="h-32 flex gap-2 p-2 bg-black/20">
                    {cameraTracks.map((track, index) => (
                      <div key={track.participant.sid || index} className="w-24 h-28 flex-shrink-0">
                        <TrackRefContext.Provider value={track}>
                          <CustomParticipantTile 
                            trackRef={track}
                            disableSpeakingIndicator={true}
                          />
                        </TrackRefContext.Provider>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Grid layout for camera feeds only
              <GridLayout tracks={cameraTracks}>
                <CustomParticipantTile />
              </GridLayout>
            )}
          </div>

          {/* Chat sidebar */}
          <div className="w-80 flex-shrink-0">
            <EnhancedChat />
          </div>
        </div>

        {/* Control bar - fixed at bottom with proper z-index */}
        <div
          className="relative z-50 bg-white border-t border-gray-200"
          style={{
            minHeight: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 16px",
          }}
        >
          <Card className="w-full max-w-2xl shadow-sm border-0 bg-transparent">
            <CardContent className="p-2">
              <ControlBar
                controls={{
                  microphone: true,
                  camera: true,
                  chat: false, // Disabled since we have custom chat
                  screenShare: true,
                  leave: true,
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  width: "100%",
                  height: "auto",
                  position: "static",
                  zIndex: 9999,
                }}
                className="[&_.lk-button-group]:gap-2 [&_.lk-button]:bg-gray-100 [&_.lk-button]:hover:bg-gray-200 [&_.lk-button]:border [&_.lk-button]:border-gray-300 [&_.lk-button]:rounded-lg [&_.lk-button]:shadow-sm [&_.lk-dropdown-menu]:bg-white [&_.lk-dropdown-menu]:border [&_.lk-dropdown-menu]:border-gray-200 [&_.lk-dropdown-menu]:rounded-lg [&_.lk-dropdown-menu]:shadow-lg [&_.lk-dropdown-menu]:z-[9999] [&_.lk-dropdown-menu]:mt-2"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutContextProvider>
  )
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ taskName, onClose }) => {
  const { user, isLoaded } = useUser()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [identity, setIdentity] = useState("")
  const [roomName, setRoomName] = useState(taskName || "")
  const [name, setName] = useState("")
  const [metadata, setMetadata] = useState("")

  // Auto-populate user identity from Clerk when user data is loaded
  useEffect(() => {
    if (isLoaded && user) {
      setIdentity(user.username || user.id)
      // Removed auto-filling of display name
    }
  }, [isLoaded, user])

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const resp = await getLiveKitToken(roomName, identity, name, metadata)
      setToken(resp.accessToken)
    } catch (err) {
      setError((err as Error).message || "Failed to get token")
      setToken(null)
    }
    setLoading(false)
  }

  const handleClose = () => {
    setToken(null)
    setLoading(false)
    setError(null)
    onClose()
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      {!token && (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Users className="h-6 w-6 text-slate-600" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="hover:bg-gray-100"
                aria-label="Close form"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle>Join Video Conference</CardTitle>
            <CardDescription>Enter your details to join the video call</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  value={roomName}
                  readOnly
                  disabled
                  className="w-full bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="identity">User Identity</Label>
                <Input
                  id="identity"
                  placeholder="Your unique user ID"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="How others will see you"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metadata">Metadata</Label>
                <Input
                  id="metadata"
                  placeholder="Additional information (optional)"
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                  className="w-full"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !identity.trim()} 
                  className="flex-1 bg-slate-600 hover:bg-slate-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Join Call
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {token && (
        <div
          className="relative flex h-[85vh] w-[90%] max-w-[90vw] min-w-[320px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          style={{ minHeight: 500 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b bg-gray-50/50 p-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <Video className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Video Conference</h2>
                <p className="text-sm text-gray-500">Connect with your team</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100"
              onClick={handleClose}
              aria-label="Close Video Call"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Modal Content */}
          <div className="flex flex-1 flex-col overflow-hidden min-h-0">
            <div className="relative flex-1 bg-gray-100 min-h-0">
              <LiveKitRoom
                token={token}
                serverUrl={WS_URL}
                connect={true}
                style={{ width: "100%", height: "100%" }}
                options={{
                  adaptiveStream: true,
                  dynacast: true,
                  publishDefaults: {
                    audioPreset: {
                      maxBitrate: 20_000,
                    },
                    videoPreset: {
                      width: 1280,
                      height: 720,
                      maxBitrate: 1_500_000,
                    },
                    dtx: false,
                    red: false,
                    simulcast: true,
                    screenShareEncoding: {
                      maxBitrate: 3_000_000,
                      maxFramerate: 15,
                    },
                  },
                  videoCaptureDefaults: {
                    resolution: {
                      width: 1280,
                      height: 720,
                      frameRate: 30,
                    },
                  },
                  screenShareCaptureOptions: {
                    audio: true,
                    resolution: {
                      width: 1920,
                      height: 1080,
                      frameRate: 15,
                    },
                  },
                }}
              >
                <MyVideoConference onLeave={handleClose} />
              </LiveKitRoom>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoCallModal