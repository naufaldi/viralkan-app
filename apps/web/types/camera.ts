export interface CameraDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface CameraError {
  type: "permission" | "no-device" | "stream" | "capture" | "unknown";
  message: string;
}

export interface CameraCaptureOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "image/jpeg" | "image/png" | "image/webp";
}

export interface CameraStreamOptions {
  deviceId?: string;
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
  frameRate?: number;
}
