import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator } from 'react-native';
import { Camera, CameraType, CameraView, useCameraPermissions } from 'expo-camera';

interface CameraAbstractionProps {
  mode: 'ENROLL' | 'VERIFY';
  onCaptureFace: (base64Frame: string) => void;
}

export const CameraAbstraction: React.FC<CameraAbstractionProps> = ({ mode, onCaptureFace }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!permission) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera for {mode}</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // NOTE: This acts as the Presentation Attack Detection (Liveness) boundary.
  // In a real configuration employing FaceTec or AWS Rekognition, this component 
  // swaps entirely to their proprietary native Android/iOS ViewController mapping!
  // Since we lack true open-source Liveness, we simulate a manual trigger for Phase 5 tests.

  const simulateFaceDetectionWrapper = async () => {
    setIsProcessing(true);
    // Simulating capturing a frame securely and pushing to the backend for cryptographic bounding
    setTimeout(() => {
        setIsProcessing(false);
        onCaptureFace("base64_mocked_frame_boundary_since_trueliveness_pending");
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="front">
        <View style={styles.overlay}>
           {isProcessing ? (
               <ActivityIndicator color="white" size="large" />
           ) : (
             <View style={styles.actionBlock}>
               <Text style={styles.overlayText}>
                  True Liveness/PAD Provider Pending.{'\n'}
                  Simulating Face Capture for {mode}.
               </Text>
               <Button title="Simulate Face Liveness Check" onPress={simulateFaceDetectionWrapper} />
             </View>
           )}
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 },
  actionBlock: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 20, borderRadius: 10, alignItems: 'center' },
  overlayText: { color: 'white', fontSize: 16, textAlign: 'center', marginBottom: 15 },
  text: { textAlign: 'center', paddingBottom: 10 }
});
