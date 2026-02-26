import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  PhoneOff, Loader2, Users
} from "lucide-react";
import { useSocketStore } from "../store/socket.store";  ///    ../../store/socket.store
import { useAuthStore } from "../store/auth.store";
import { useSession, useSessionActions } from "../../src/hooks/useSessions"; //   ../../hooks/useSessions
import { cn } from "../lib/utils";

type CallState = "connecting" | "waiting" | "connected" | "ended";

export default function VideoCallPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { socket } = useSocketStore();
  const { user } = useAuthStore();
  const { session } = useSession(sessionId ?? null);
  const { complete } = useSessionActions();

  // Local media
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [callState, setCallState] = useState<CallState>("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);

  const role = user?.role as "student" | "tutor";

  // ─── Create RTCPeerConnection ────────────────────────────────────────────────
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Receive remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setCallState("connected");
      }
    };

    // Send ICE candidates via socket
    pc.onicecandidate = (event) => {
      if (event.candidate && sessionId) {
        socket?.emit("webrtc_ice_candidate", {
          sessionId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setCallState("ended");
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [socket, sessionId]);

  // ─── Setup local media + join call room ────────────────────────────────────
  useEffect(() => {
    if (!sessionId || !socket) return;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        // Join the socket call room
        socket.emit("join_call", { sessionId });
        setCallState("waiting");
      })
      .catch((err) => {
        console.error("Camera/mic access denied:", err);
        setCallState("waiting");
        socket.emit("join_call", { sessionId });
      });

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerConnectionRef.current?.close();
    };
  }, [sessionId, socket]);

  // ─── Socket event listeners ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !sessionId) return;

    // Someone else joined → tutor sends offer
    const onPeerJoined = async ({ role: peerRole }: { role: string }) => {
      setRemoteJoined(true);
      setCallState("connected");

      if (role === "tutor") {
        // Tutor initiates the offer
        const pc = createPeerConnection();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc_offer", { sessionId, offer });
      }
    };

    // Receive offer (student side)
    const onOffer = async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
      const pc = createPeerConnection();
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc_answer", { sessionId, answer });
      setCallState("connected");
    };

    // Receive answer (tutor side)
    const onAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      await peerConnectionRef.current?.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    };

    // Receive ICE candidate
    const onIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch {}
    };

    // Call ended by other party
    const onCallEnded = () => {
      setCallState("ended");
    };

    socket.on("call_peer_joined", onPeerJoined);
    socket.on("webrtc_offer", onOffer);
    socket.on("webrtc_answer", onAnswer);
    socket.on("webrtc_ice_candidate", onIceCandidate);
    socket.on("call_ended", onCallEnded);

    return () => {
      socket.off("call_peer_joined", onPeerJoined);
      socket.off("webrtc_offer", onOffer);
      socket.off("webrtc_answer", onAnswer);
      socket.off("webrtc_ice_candidate", onIceCandidate);
      socket.off("call_ended", onCallEnded);
    };
  }, [socket, sessionId, role, createPeerConnection]);

  // ─── Controls ────────────────────────────────────────────────────────────────

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
      socket?.emit("call_event", {
        sessionId,
        eventType: track.enabled ? "unmuted" : "muted",
      });
    }
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsCameraOff(!track.enabled);
      socket?.emit("call_event", {
        sessionId,
        eventType: track.enabled ? "video_on" : "video_off",
      });
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen share, revert to camera
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
      if (cameraTrack && peerConnectionRef.current) {
        const sender = peerConnectionRef.current
          .getSenders()
          .find((s) => s.track?.kind === "video");
        sender?.replaceTrack(cameraTrack);
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace video track in peer connection
        const sender = peerConnectionRef.current
          ?.getSenders()
          .find((s) => s.track?.kind === "video");
        sender?.replaceTrack(screenTrack);

        // Show screen in local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => toggleScreenShare();
        setIsScreenSharing(true);
      } catch {}
    }
  };

  const endCall = async () => {
    socket?.emit("end_call", { sessionId });
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerConnectionRef.current?.close();

    if (role === "tutor" && sessionId) {
      try { await complete(sessionId); } catch {}
    }

    navigate(role === "tutor" ? "/tutor/sessions" : "/student/sessions");
  };

  // ─── Auto navigate if ended ──────────────────────────────────────────────────
  useEffect(() => {
    if (callState === "ended") {
      const timer = setTimeout(() => {
        navigate(role === "tutor" ? "/tutor/sessions" : "/student/sessions");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [callState, navigate, role]);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Video area */}
      <div className="flex-1 relative">
        {/* Remote video (full screen) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Waiting overlay */}
        {callState === "waiting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="w-16 h-16 rounded-2xl bg-morpheus-accent/10 border border-morpheus-accent/20 flex items-center justify-center mb-4">
              <Users size={28} className="text-morpheus-accent" />
            </div>
            <p className="text-white font-display text-lg font-semibold mb-2">
              {session?.topic || "Tutoring Session"}
            </p>
            <div className="flex items-center gap-2 text-morpheus-muted text-sm">
              <Loader2 size={15} className="animate-spin" />
              Waiting for the other person to join…
            </div>
          </div>
        )}

        {/* Call ended overlay */}
        {callState === "ended" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
            <p className="text-white font-display text-xl font-semibold mb-2">
              Call Ended
            </p>
            <p className="text-morpheus-muted text-sm">Redirecting you...</p>
          </div>
        )}

        {/* Local video (picture-in-picture) */}
        <div className="absolute bottom-24 right-4 w-36 h-24 rounded-xl overflow-hidden border-2 border-white/10 shadow-xl bg-morpheus-surface">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {isCameraOff && (
            <div className="absolute inset-0 bg-morpheus-surface flex items-center justify-center">
              <VideoOff size={20} className="text-morpheus-muted" />
            </div>
          )}
        </div>

        {/* Session info */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2">
          <p className="text-white text-sm font-medium">
            {session?.topic || "Tutoring Session"}
          </p>
          {session?.subjectName && (
            <p className="text-white/60 text-xs">{session.subjectName}</p>
          )}
        </div>
      </div>

      {/* Controls bar */}
      <div className="bg-black/90 backdrop-blur-sm border-t border-white/10 px-6 py-4">
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          {/* Mute */}
          <button
            onClick={toggleMute}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              isMuted
                ? "bg-red-500 text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Camera */}
          <button
            onClick={toggleCamera}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              isCameraOff
                ? "bg-red-500 text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          {/* End call */}
          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
          >
            <PhoneOff size={22} />
          </button>

          {/* Screen share */}
          <button
            onClick={toggleScreenShare}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              isScreenSharing
                ? "bg-morpheus-accent text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
          </button>

          {/* Volume placeholder — browser controls audio automatically */}
          <button
            className="w-12 h-12 rounded-full bg-white/10 text-white/40 flex items-center justify-center cursor-not-allowed"
            title="Volume is controlled by your system"
          >
            <span className="text-xs">Vol</span>
          </button>
        </div>
      </div>
    </div>
  );
}
