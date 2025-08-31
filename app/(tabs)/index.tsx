// app/(tabs)/index.tsx
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraIcon } from '../../components/CustomIcons';

export default function HomeScreen() {
  const router = useRouter();

  const handleScanFood = () => {
    router.push('/camera');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CalScan</Text>
      <Text style={styles.subtitle}>Scan food products for instant nutritional insights</Text>
      
      <TouchableOpacity 
        style={styles.scanButton}
        onPress={handleScanFood}
        activeOpacity={0.8}
      >
        <View style={styles.scanButtonContent}>
          <CameraIcon size={24} color="white" style={styles.cameraIcon} />
          <Text style={styles.scanButtonText}>Scan Food</Text>
        </View>
      </TouchableOpacity>
      
      <Text style={styles.footerText}>
        Point your camera at a food product's back label
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    fontFamily: 'Outfit',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 48,
    textAlign: 'center',
    fontFamily: 'Outfit',
    fontWeight: '400',
    paddingHorizontal: 20,
  },
  scanButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '80%',
    maxWidth: 300,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    marginRight: 10,
  },
  scanButtonText: {
    color: '#f5f5f5',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Outfit',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Outfit',
    fontWeight: '400',
    marginTop: 40,
    maxWidth: 300,
    lineHeight: 20,
  },
});