"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Camera, RotateCcw, AlertCircle, Loader2, X } from "lucide-react";

interface CameraCaptureProps {
  onPhotoCapture: (file: File) => void;
  onClose: () => void;
  disabled?: boolean;
}

export const CameraCapture = ({
  onPhotoCapture,
  onClose,
  disabled = false,
}: CameraCaptureProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-request camera permission and start stream - MDN approach
  useEffect(() => {
    if (disabled) return;

    const startCamera = async () => {
      try {
        // Clear any existing error first
        setError(null);
        setHasPermission(false);
        setIsStreaming(false);

        // Stop any existing stream first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Small delay to ensure cleanup
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Request camera access with responsive constraints
        const constraints = {
          video: isMobile
            ? {
                width: { ideal: 720, min: 480 },
                height: { ideal: 1280, min: 640 },
                facingMode: "environment", // Use back camera on mobile
              }
            : {
                width: { ideal: 1280, min: 640 },
                height: { ideal: 720, min: 480 },
              },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Wait for video to be ready before playing
          await new Promise((resolve, reject) => {
            const video = videoRef.current!;

            const handleCanPlay = () => {
              video.removeEventListener("canplay", handleCanPlay);
              video.removeEventListener("error", handleError);
              resolve(void 0);
            };

            const handleError = () => {
              video.removeEventListener("canplay", handleCanPlay);
              video.removeEventListener("error", handleError);
              reject(new Error("Video failed to load"));
            };

            video.addEventListener("canplay", handleCanPlay);
            video.addEventListener("error", handleError);

            // Timeout after 5 seconds
            setTimeout(() => {
              video.removeEventListener("canplay", handleCanPlay);
              video.removeEventListener("error", handleError);
              reject(new Error("Video loading timeout"));
            }, 5000);
          });

          await videoRef.current.play();
          setIsStreaming(true);
          setHasPermission(true);
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("Camera error:", error);

        // Don't show error if it's just AbortError from cleanup
        if (error.name === "AbortError") {
          return;
        }

        let errorMessage = "Failed to access camera";
        if (error.name === "NotAllowedError") {
          errorMessage =
            "Camera permission denied. Please allow camera access.";
        } else if (error.name === "NotFoundError") {
          errorMessage = "No camera found on this device.";
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera is being used by another application.";
        }

        setError(errorMessage);
        setIsStreaming(false);
        setHasPermission(false);
      }
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      startCamera();
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsStreaming(false);
      setHasPermission(false);
    };
  }, [disabled, isMobile]);

  const handleCapture = async () => {
    if (disabled || isCapturing || !videoRef.current || !isStreaming) return;

    try {
      setIsCapturing(true);
      setError(null);

      const video = videoRef.current;

      // Ensure video is ready
      if (video.readyState < 2) {
        throw new Error("Video not ready for capture");
      }

      const width = video.videoWidth;
      const height = video.videoHeight;

      if (!width || !height) {
        throw new Error("Video dimensions not available");
      }

      // Create canvas with actual video dimensions - MDN approach
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas 2D context not supported");
      }

      // Set canvas size to match video stream
      canvas.width = width;
      canvas.height = height;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, width, height);

      // Convert canvas to blob - MDN approach
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(new Error("Canvas toBlob failed"));
            }
          },
          "image/jpeg",
          0.92, // High quality
        );
      });

      // Create file with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const file = new File([blob], `camera_${timestamp}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      console.log("Photo captured:", {
        dimensions: `${width}x${height}`,
        size: `${(file.size / 1024).toFixed(1)}KB`,
      });

      onPhotoCapture(file);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Capture error:", error);
      setError(`Failed to capture photo: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetry = () => {
    if (disabled) return;

    // Reset states and try again
    setError(null);
    setHasPermission(false);
    setIsStreaming(false);

    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Restart after a short delay
    setTimeout(() => {
      const constraints = {
        video: isMobile
          ? {
              width: { ideal: 720, min: 480 },
              height: { ideal: 1280, min: 640 },
              facingMode: "environment", // Use back camera on mobile
            }
          : {
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
            },
        audio: false,
      };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().then(() => {
              setIsStreaming(true);
              setHasPermission(true);
            });
          }
        })
        .catch((err) => {
          console.error("Retry failed:", err);
          setError("Camera access failed. Please check permissions.");
        });
    }, 500);
  };

  return (
    <div className={`${isMobile ? "flex h-full flex-col" : "space-y-4"}`}>
      {/* Camera Preview */}
      <Card
        className={`overflow-hidden border border-neutral-200 shadow-md ${isMobile ? "flex-1" : ""}`}
      >
        <CardContent className="flex items-center justify-center p-0">
          <div
            className="relative bg-neutral-900"
            style={{
              aspectRatio: isMobile ? "9/16" : "16/9",
              maxHeight: isMobile ? "calc(100vh - 200px)" : "auto",
            }}
          >
            {/* Video Element - MDN approach */}
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              autoPlay
              playsInline
              muted
              style={{
                transform: isMobile ? "scaleX(1)" : "scaleX(-1)", // Don't mirror on mobile (back camera)
              }}
            >
              Video stream not available.
            </video>

            {/* Permission Request Overlay */}
            {!hasPermission && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80">
                <div className="text-center">
                  <Camera className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                  <p className="font-medium text-neutral-300">
                    Requesting camera access...
                  </p>
                  <p className="mt-2 text-sm text-neutral-400">
                    Please allow camera permission when prompted
                  </p>
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90">
                <div className="mx-auto max-w-sm p-6 text-center">
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                  <p className="mb-2 font-medium text-neutral-300">
                    Camera Error
                  </p>
                  <p className="mb-4 text-sm text-neutral-400">{error}</p>
                  <div className="flex justify-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      disabled={disabled}
                      className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="text-neutral-400 hover:bg-neutral-800 hover:text-white"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Camera Controls Overlay - Simple MDN approach */}
            {isStreaming && !error && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center gap-4">
                {/* Capture Button */}
                <Button
                  type="button"
                  size="lg"
                  onClick={handleCapture}
                  disabled={disabled || isCapturing}
                  className="h-16 w-16 rounded-full border-4 border-white/20 bg-white/95 text-neutral-800 shadow-lg transition-all duration-200 hover:bg-white hover:shadow-xl"
                >
                  {isCapturing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6" />
                  )}
                </Button>
              </div>
            )}

            {/* Camera Status */}
            {isStreaming && (
              <div className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                Camera Active
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      {!isMobile && (
        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Position camera on damaged road and press camera button to take
            photo
          </p>
        </div>
      )}
    </div>
  );
};
