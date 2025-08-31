// app/camera.tsx
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Easing, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { SwitchCameraIcon, CaptureIcon } from '../components/CustomIcons';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const scannerPosition = useRef(new Animated.Value(0)).current;
  
  // Handle camera cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current.pausePreview();
      }
    };
  }, []);
  
  // Reset processing state when component mounts or when coming back from results
  useFocusEffect(
    React.useCallback(() => {
      setIsProcessing(false);
      setIsCameraReady(false);
      // Reset camera ref if needed
      if (cameraRef.current) {
        // Force a refresh of the camera preview
        cameraRef.current.pausePreview();
        setTimeout(() => {
          if (cameraRef.current) {
            cameraRef.current.resumePreview();
          }
        }, 100);
      }
      return () => {
        // Cleanup if needed
        if (cameraRef.current) {
          cameraRef.current.pausePreview();
        }
      };
    }, [])
  );

  // Animate the corners
  const cornerScale = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const animateCorners = () => {
      Animated.sequence([
        Animated.timing(cornerScale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(cornerScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ]).start(() => animateCorners());
    };
    
    animateCorners();
  }, []);

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.message}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.message}>
            Camera permission is required to scan food. Please allow camera access to use this feature.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    console.log('Take picture called. isProcessing:', isProcessing);
    console.log('Camera ref exists:', !!cameraRef.current);
    console.log('Camera is ready:', isCameraReady);
    
    if (cameraRef.current && !isProcessing && isCameraReady) {
      setIsProcessing(true);
      console.log('Starting to take picture...');
      
      try {
        // Small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true
        });
        
        console.log('Photo taken:', !!photo);
        
        if (photo) {
          // The scan frame is 260x260 pixels, centered horizontally, positioned at top: 250
          const frameSize = 260;
          const frameTop = 250;
          
          // Get screen dimensions
          const screenWidth = Dimensions.get('window').width;
          const screenHeight = Dimensions.get('window').height;
          
          // Calculate frame position on screen
          const frameLeft = (screenWidth - frameSize) / 2;
          
          // Calculate crop ratios
          const originXRatio = frameLeft / screenWidth;
          const originYRatio = frameTop / screenHeight;
          const sizeRatio = frameSize / screenWidth;
          
          // Apply crop based on photo dimensions
          const cropOriginX = Math.round(photo.width * originXRatio);
          const cropOriginY = Math.round(photo.height * originYRatio);
          const cropWidth = Math.round(photo.width * sizeRatio);
          const cropHeight = cropWidth; // Square frame
          
          // Ensure crop dimensions don't exceed photo boundaries
          const safeCropWidth = Math.min(cropWidth, photo.width - cropOriginX);
          const safeCropHeight = Math.min(cropHeight, photo.height - cropOriginY);
          
          const croppedPhoto = await manipulateAsync(
            photo.uri,
            [
              {
                crop: {
                  originX: cropOriginX,
                  originY: cropOriginY,
                  width: safeCropWidth,
                  height: safeCropHeight
                }
              }
            ],
            { compress: 0.8, format: SaveFormat.JPEG }
          );
          
          console.log('Navigating to results with cropped photo');
          // Use replace instead of push to prevent going back to camera
          router.replace({
            pathname: '/results',
            params: { imageUri: croppedPhoto.uri }
          });
        } else {
          console.log('No photo captured');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        setIsProcessing(false);
      }
    } else {
      console.log('Cannot take picture - camera not ready or already processing');
      // Reset the processing state to ensure it's not stuck
      if (isProcessing) {
        setTimeout(() => {
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleCameraReady = () => {
    console.log('Camera is ready');
    setIsCameraReady(true);
  };

  const handleMountError = (error: any) => {
    console.error('Camera mount error:', error);
    setIsCameraReady(false);
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        ratio="4:3"
        onCameraReady={handleCameraReady}
        onMountError={handleMountError}
      />
      
      <View style={styles.overlay}>
        {/* Top Bar with Back Button */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Scan Nutrition Label</Text>
          
          {/* Empty view for spacing - this was the scanFrame which should be moved elsewhere */}
          <View style={{ width: 40 }} />
        </View>
        
        {/* Scan Frame */}
        <View style={styles.scanFrame}>
          <Animated.View style={[styles.cornerTL, { transform: [{ scale: cornerScale }] }]} />
          <Animated.View style={[styles.cornerTR, { transform: [{ scale: cornerScale }] }]} />
          <Animated.View style={[styles.cornerBL, { transform: [{ scale: cornerScale }] }]} />
          <Animated.View style={[styles.cornerBR, { transform: [{ scale: cornerScale }] }]} />
        </View>
        
        {/* Capture Button Container */}
        <View style={styles.captureContainer}>
          <View style={styles.captureButtonOuter}>
            <TouchableOpacity
              style={[styles.captureButton, (isProcessing || !isCameraReady) && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={isProcessing || !isCameraReady}
              activeOpacity={0.7}
            >
              {isProcessing ? (
                <View style={styles.recordingIndicator} />
              ) : (
                <CaptureIcon size={32} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Camera Switch Button */}
        <TouchableOpacity 
          style={styles.switchCameraButton}
          onPress={toggleCameraType}
        >
          <SwitchCameraIcon size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Outfit',
    marginLeft: 10,
  },
  scanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
    height: '100%',
  },
  scanFrame: {
    width: 260,
    height: 260,
    overflow: 'hidden',
    position: 'absolute',
    top: 250,       // Fixed pixel value from top
    left: '17%',    // 10% from left
    right: '17%',   // 10% from right
    alignSelf: 'center',
  },
  scannerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#4CAF50',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 12,
    transformOrigin: 'top left',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderTopRightRadius: 12,
    transformOrigin: 'top right',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomLeftRadius: 12,
    transformOrigin: 'bottom left',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomRightRadius: 12,
    transformOrigin: 'bottom right',
    ...Platform.select({
      ios: {
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
    }),
  },
  scanText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 24,
    fontSize: 16,
    fontFamily: 'Outfit',
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  captureContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  switchCameraButton: {
    position: 'absolute',
    right: 30,
    bottom: 80,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  captureButton: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureInnerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
  },
  recordingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff0000',
  },
  message: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
    fontFamily: 'Outfit',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  permissionButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Outfit',
  },
});