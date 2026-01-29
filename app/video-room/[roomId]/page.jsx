"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import SessionFeedbackModal from "@/components/SessionFeedbackModal";
import DigitalPrescriptionModal from "@/components/DigitalPrescriptionModal";

export default function VideoRoom() {
  const { roomId } = useParams();
  const { data: session } = useSession();
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasOffered, setHasOffered] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [patientUserId, setPatientUserId] = useState(null);
  const remoteStreamRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    let mounted = true;
    let pc = null;
    let socketInstance = null;

    const initCall = async () => {
      try {
        // Get media first - handle multiple tab scenario
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: true,
          });
          console.log('✅ Media access granted');
        } catch (error) {
          console.error('❌ Media access failed:', error.name, error.message);
          if (error.name === 'NotAllowedError') {
            setMediaError('Camera/microphone access denied. Please allow access and refresh.');
          } else if (error.name === 'NotReadableError') {
            setMediaError('Camera/microphone is being used by another tab. Please close other video tabs and refresh.');
          } else {
            setMediaError('Failed to access camera/microphone. Please check your device.');
          }
          return; // Don't throw, just return to prevent reload loop
        }

        if (!mounted) return;

        console.log('Local stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, readyState: t.readyState })));
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          // Force video to be visible
          localVideoRef.current.style.display = 'block';
          
          // Proper play promise handling
          const playPromise = localVideoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Local video started playing');
              })
              .catch(error => {
                console.log('Local video play failed:', error);
              });
          }
        }

        // Create persistent remote stream
        const remoteStream = new MediaStream();
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }

        // Create peer connection
        pc = new RTCPeerConnection(iceServers);
        setPeerConnection(pc);

        // Add tracks
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream
        pc.ontrack = (event) => {
          console.log('Received remote track:', event.track.kind, event.track.readyState);
          const track = event.track;
          
          if (remoteStreamRef.current) {
            // Add track to persistent remote stream
            remoteStreamRef.current.addTrack(track);
            console.log('Added track to remote stream. Total tracks:', remoteStreamRef.current.getTracks().length);
            
            // Ensure video element has the stream and plays
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStreamRef.current;
              
              // Proper play promise handling
              const playPromise = remoteVideoRef.current.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('Remote video started playing');
                  })
                  .catch(error => {
                    console.log('Remote video play failed:', error);
                  });
              }
            }
            
            setRemoteStream(remoteStreamRef.current);
            setIsConnected(true);
          }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate && socketInstance) {
            socketInstance.emit("ice-candidate", {
              roomId,
              candidate: event.candidate,
            });
          }
        };

        // Initialize socket with fallback system
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
        
        socketInstance = io(socketUrl, {
          forceNew: true,
          transports: ['polling', 'websocket'],
          upgrade: true,
          rememberUpgrade: false
        });
        
        socketInstance.on('connect', () => {
          console.log('🔌 Socket connected:', socketInstance.id);
          setSocket(socketInstance);
        });
        
        socketInstance.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error);
        });

        // Register user/doctor first
        if (session.user.isDoctor) {
          socketInstance.emit("register-doctor", { doctorId: session.user.id });
          console.log('Doctor registered:', session.user.id);
        } else {
          socketInstance.emit("register-user", { userId: session.user.id });
          console.log('User registered:', session.user.id);
        }

        // Join room
        socketInstance.emit("join-room", roomId);
        console.log('Joined room:', roomId, 'as', session.user.isDoctor ? 'doctor' : 'patient');

        // Socket events
        socketInstance.on("offer", async (offer) => {
          try {
            console.log('Patient received offer, current state:', pc.signalingState);
            if (pc.signalingState === 'stable') {
              await pc.setRemoteDescription(offer);
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              socketInstance.emit("answer", { roomId, answer });
              console.log('Patient sent answer');
            } else {
              console.log('Patient ignoring offer, wrong state:', pc.signalingState);
            }
          } catch (error) {
            console.error("Patient error handling offer:", error);
          }
        });

        socketInstance.on("answer", async (answer) => {
          try {
            console.log('Received answer, current state:', pc.signalingState);
            if (pc.signalingState === 'have-local-offer') {
              await pc.setRemoteDescription(answer);
            } else {
              console.log('Ignoring answer, wrong state:', pc.signalingState);
            }
          } catch (error) {
            console.error("Error handling answer:", error);
          }
        });

        socketInstance.on("ice-candidate", async (candidate) => {
          try {
            if (pc.remoteDescription) {
              await pc.addIceCandidate(candidate);
            } else {
              console.log('Queuing ICE candidate');
              setTimeout(() => {
                if (pc.remoteDescription) {
                  pc.addIceCandidate(candidate).catch(console.error);
                }
              }, 1000);
            }
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        });

        socketInstance.on("user-disconnected", () => {
          console.log('Other user disconnected');
          setIsConnected(false);
          setRemoteStream(null);
          if (!session.user.isDoctor) {
            setShowFeedback(true);
          } else {
            setShowPrescription(true);
          }
        });

        // Listen for re-escalation notifications
        socketInstance.on("re-escalation-started", (data) => {
          console.log('Re-escalation started:', data);
          alert(data.message);
        });

        // Get room info for feedback
        fetchRoomInfo();

        // Doctor creates offer after delay
        if (session.user.isDoctor) {
          setTimeout(async () => {
            try {
              if (pc.signalingState === 'stable' && !hasOffered) {
                console.log('Doctor creating offer, signaling state:', pc.signalingState);
                setHasOffered(true);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                console.log('Doctor sending offer to room:', roomId);
                socketInstance.emit("offer", { roomId, offer });
              } else {
                console.log('Doctor cannot create offer:', { state: pc.signalingState, hasOffered });
              }
            } catch (error) {
              console.error("Doctor error creating offer:", error);
              setHasOffered(false);
            }
          }, 3000);
        }
      } catch (error) {
        console.error("Error initializing call:", error);
        // Show user-friendly error message
        if (error.name === 'NotReadableError' || error.name === 'NotAllowedError') {
          // Media access issues - likely multiple tabs
          return;
        }
      }
    };

    initCall();

    return () => {
      mounted = false;
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (pc) {
        pc.close();
      }
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [roomId, session?.user?.id]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const fetchRoomInfo = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`);
      const data = await response.json();
      if (data.room) {
        setDoctorName(data.room.doctorId?.name || "Doctor");
        setSessionId(data.room.sessionId);
        // Set patient ID from room data - userId is the patient
        const patientId = data.room.userId?._id || data.room.userId;
        console.log('Room data - Patient ID:', patientId, 'Doctor ID:', data.room.doctorId?._id);
        setPatientUserId(patientId);
      }
    } catch (error) {
      console.error("Failed to fetch room info:", error);
      // Fallback to URL param or session user ID if not doctor
      const urlParams = new URLSearchParams(window.location.search);
      const userIdFromUrl = urlParams.get('userId');
      setPatientUserId(userIdFromUrl || (!session?.user?.isDoctor ? session?.user?.id : null));
    }
  };

  const handleFeedback = async (satisfied, rating, comment) => {
    try {
      const response = await fetch('/api/session/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          satisfied,
          rating,
          comment,
          userEmail: session.user.email
        })
      });
      
      const data = await response.json();
      console.log('Feedback response:', data);
      
      if (satisfied) {
        alert('Thank you for your feedback! We appreciate you taking the time to share your experience.');
        window.location.href = '/dashboard';
      } else {
        if (data.reEscalated) {
          const message = data.isDifferentDoctor ? 
            `We understand your concerns. We're connecting you with a different doctor: Dr. ${data.newDoctorName}` :
            `We're giving you another chance with Dr. ${data.newDoctorName}. They'll try a different approach.`;
          alert(message);
          // Wait a moment for the escalation to be processed
          setTimeout(() => {
            window.location.href = '/dashboard/mental-counselor';
          }, 2000);
        } else {
          alert('We apologize for the experience. No doctors are currently available for re-connection. Please try again later or contact emergency services if urgent.');
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Failed to submit feedback. Please try again.');
      window.location.href = '/dashboard';
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (socket) {
      socket.emit("end-call", roomId);
      socket.disconnect();
    }
    if (session.user.isDoctor) {
      setShowPrescription(true);
    } else {
      setShowFeedback(true);
    }
  };

  if (!session) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (mediaError) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-red-50 to-orange-50 items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-red-800 text-xl font-semibold mb-4">Media Access Error</h2>
          <p className="text-red-600 mb-6">{mediaError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Elegant Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-emerald-100">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🎥</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-emerald-800">Therapy Session</h1>
                <p className="text-sm text-emerald-600 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  {isConnected ? 'Connected & Secure' : 'Connecting...'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                {session?.user?.isDoctor ? '👩‍⚕️ Therapist' : '🌱 You'}
              </div>
              <div className="text-sm text-emerald-600 bg-white/70 px-3 py-1 rounded-full">
                🌿 Safe Space
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 p-3 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-8 h-full max-w-7xl mx-auto">
          {/* Remote participant */}
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-100 transform hover:scale-[1.02] transition-transform duration-300">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              preload="metadata"
              controls={false}
              className="w-full h-full object-cover"
              style={{ 
                display: remoteStream ? "block" : "none",
                backgroundColor: '#000'
              }}
              onLoadedMetadata={() => console.log('Remote video metadata loaded')}
              onCanPlay={() => console.log('Remote video can play')}
              onError={(e) => console.error('Remote video error:', e)}
            />
            {!remoteStream && (
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-emerald-300 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
                    <span className="text-4xl">
                      {session?.user?.isDoctor ? "🌱" : "👩‍⚕️"}
                    </span>
                  </div>
                  <p className="text-emerald-800 font-semibold text-lg mb-2">
                    {session?.user?.isDoctor ? "Your Patient" : "Your Therapist"}
                  </p>
                  <p className="text-emerald-600 text-sm flex items-center justify-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-bounce"></span>
                    Connecting to safe space...
                  </p>
                </div>
              </div>
            )}
            <div className="absolute bottom-6 left-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              {session?.user?.isDoctor ? "🌱 Patient" : "👩‍⚕️ Therapist"}
            </div>
            {remoteStream && (
              <div className="absolute top-6 right-6 bg-green-500 text-white p-2 rounded-full shadow-lg animate-pulse">
                🟢
              </div>
            )}
          </div>

          {/* Local participant */}
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-teal-100 transform hover:scale-[1.02] transition-transform duration-300">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              preload="metadata"
              controls={false}
              className="w-full h-full object-cover"
              style={{ 
                display: isVideoOff ? "none" : "block",
                backgroundColor: '#000',
                transform: 'scaleX(-1)'
              }}
              onLoadedMetadata={() => console.log('Local video metadata loaded')}
              onCanPlay={() => console.log('Local video can play')}
              onError={(e) => console.error('Local video error:', e)}
            />
            {isVideoOff && (
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-teal-100 via-cyan-100 to-emerald-100">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-teal-300 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <span className="text-4xl">
                      {session?.user?.isDoctor ? "👩‍⚕️" : "🌱"}
                    </span>
                  </div>
                  <p className="text-teal-800 font-semibold text-lg">
                    {session?.user?.name || "You"}
                  </p>
                  <p className="text-teal-600 text-sm mt-2">Camera is off</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-6 left-6 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              {session?.user?.isDoctor ? "👩‍⚕️ You" : "🌱 You"}
            </div>
            {isMuted && (
              <div className="absolute top-6 left-6 bg-red-500 text-white p-3 rounded-full shadow-lg animate-bounce">
                🔇
              </div>
            )}
            <div className="absolute top-6 right-6 bg-blue-500 text-white p-2 rounded-full shadow-lg">
              🟢
            </div>
          </div>
        </div>
      </div>

      {/* Floating Controls */}
      <div className="pb-4 sm:pb-8">
        <div className="flex items-center justify-center px-3">
          <div className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-2xl border border-emerald-100">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleMute}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 ${
                  isMuted
                    ? "bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600"
                    : "bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
                } flex items-center justify-center`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                <span className="text-white text-lg sm:text-2xl">
                  {isMuted ? "🔇" : "🎤"}
                </span>
              </button>

              <button
                onClick={toggleVideo}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 ${
                  isVideoOff
                    ? "bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600"
                    : "bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600"
                } flex items-center justify-center`}
                title={isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                <span className="text-white text-lg sm:text-2xl">
                  {isVideoOff ? "📹" : "📷"}
                </span>
              </button>

              <div className="w-px h-6 sm:h-8 bg-emerald-200"></div>

              <button
                onClick={endCall}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 flex items-center justify-center"
                title="End session"
              >
                <span className="text-lg sm:text-2xl">📞</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-3 sm:mt-4 px-3">
          <p className="text-xs sm:text-sm text-emerald-600 bg-white/70 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full inline-block shadow-md">
            🔒 End-to-end encrypted • Your privacy is protected
          </p>
        </div>
      </div>
      
      <SessionFeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        onFeedback={handleFeedback}
        doctorName={doctorName}
      />
      
      <DigitalPrescriptionModal
        isOpen={showPrescription}
        onClose={() => {
          setShowPrescription(false);
          window.location.href = '/doctor';
        }}
        patientId={patientUserId || (!session?.user?.isDoctor ? session?.user?.id : 'unknown')}
        doctorId={session?.user?.id}
        sessionId={sessionId}
      />
    </div>
  );
}