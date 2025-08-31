import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>
      <Text style={styles.text}>
        This is the explore screen. You can add your own content here.
      </Text>
      <Text style={styles.text}>
        Navigate back to the home screen to scan food products.
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
    marginBottom: 24,
    fontFamily: 'Outfit',
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Outfit',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
});