import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, TouchableWithoutFeedback } from 'react-native';
import { Camera } from 'expo-camera';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';

const Home = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [imageUri, setImageUri] = useState(null); // State to store the captured image URI
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
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

  const takePicture = async (navigation) => {
    if (cameraRef.current && isCameraReady) {
      try {
        const { uri, width, height } = await cameraRef.current.takePictureAsync();
        console.log('Picture taken:', uri);

        // Set the captured image URI to the state
        setImageUri(uri);
        // Navigate to new screen
        navigation.navigate('Picture', { imageUri: uri, width, height });
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
                backgroundColor: 'transparent',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 100,
                marginTop: 600,
              }}
            >
              <TouchableOpacity
                style={{
                  margin: 0
                }}
                onPress={flipCamera}
              >
                <Text style={{ fontSize: 18, color: 'white' }}>
                  Flip
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  margin: 0,
                }}
                onPress={() => takePicture(navigation)}
              >
                <Text style={{ fontSize: 18, color: 'white' }}>
                  Capture
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
          {/* {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 200, height: 200, alignSelf: 'center', marginTop: 20 }}
            />
          )} */}
        </View>
      )}
    </View>
  );
}

export default function App() {
  const Stack = createStackNavigator();

  const PictureScreen = ({ route }) => {
    const { imageUri, width, height } = route.params;
    const [pre, setPre] = useState(null);


    const _cropImage = async (x, y) => {
      const ratioX = width / 300;
      const ratioY = height / 300;
      const manipResult = await manipulateAsync(
        imageUri,
        [{ crop: { height: width * 0.2, width: height * 0.2, originX: x * ratioX, originY: y * ratioY } }],
        { compress: 1, format: SaveFormat.PNG, base64: true }
      );
      console.log(manipResult.base64);
      setPre(manipResult);
    }

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableWithoutFeedback onPress={(e) => {
          console.log(e.nativeEvent.locationX, e.nativeEvent.locationY, width, height);
          _cropImage(e.nativeEvent.locationX, e.nativeEvent.locationY);
        }}>

          <Image source={{ uri: imageUri }} style={{ width: 300, height: 300, resizeMode: "contain" }} />
        </TouchableWithoutFeedback>
        {pre && <Image source={{ uri: pre.localUri || pre.uri }} style={{ width: 300, height: 300, resizeMode: "contain" }} />}
      </View>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Picture" component={PictureScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}