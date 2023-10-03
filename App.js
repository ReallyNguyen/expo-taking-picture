import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import { useRef } from 'react';

export default function Home() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [imageUri, setImageUri] = useState(null); // State to store the captured image URI
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const flipCamera = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        const { uri } = await cameraRef.current.takePictureAsync();
        console.log('Picture taken:', uri);

        // Set the captured image URI to the state
        setImageUri(uri);
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {hasPermission === null ? (
        <Text>Requesting camera permission...</Text>
      ) : hasPermission === false ? (
        <Text>No access to camera</Text>
      ) : (
        <View style={{ flex: 1 }}>
          <Camera
            style={{ flex: 1 }}
            type={cameraType}
            onCameraReady={() => setIsCameraReady(true)}
            ref={(ref) => {
              cameraRef.current = ref;
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={flipCamera}
              >
                <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  Flip
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={takePicture}
              >
                <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  Take Picture
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 200, height: 200, alignSelf: 'center', marginTop: 20 }}
            />
          )}
        </View>
      )}
    </View>
  );
}
