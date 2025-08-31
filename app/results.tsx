// app/results.tsx
import { View, Text, ScrollView, Image, ActivityIndicator, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScanLine from '@/components/ScanLine';
import { analyzeFoodImage, FoodAnalysisResult } from '@/utils/gemini';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '@/components/CustomAlert';

export default function ResultsScreen() {
  const { imageUri } = useLocalSearchParams();
  const [analysis, setAnalysis] = useState<FoodAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const analyzeImage = async () => {
      if (imageUri) {
        try {
          const result = await analyzeFoodImage(imageUri as string);
          
          if (!result.isFood) {
            setAlertTitle("Not a Food Product");
            setAlertMessage(result.error || "Please scan a food product's back label.");
            setAlertVisible(true);
            setLoading(false);
            return;
          }
          
          setAnalysis(result);
        } catch (error) {
          console.error("Analysis error:", error);
          setAlertTitle("Analysis Failed");
          setAlertMessage("Failed to analyze the image. Please try again.");
          setAlertVisible(true);
        } finally {
          setLoading(false);
        }
      }
    };
    
    analyzeImage();
  }, [imageUri]);

  const renderStars = (rating: number | undefined) => {
    if (rating === undefined || rating === null) return null;
    
    // Ensure rating is between 0 and 5
    const clampedRating = Math.max(0, Math.min(5, rating));
    const fullStars = Math.floor(clampedRating);
    const hasHalfStar = clampedRating % 1 >= 0.5;
    
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return <Text key={index} style={styles.starFull}>★</Text>;
          } else if (index === fullStars && hasHalfStar) {
            return <Text key={index} style={styles.starHalf}>★</Text>;
          } else {
            return <Text key={index} style={styles.starEmpty}>★</Text>;
          }
        })}
        <Text style={styles.ratingText}>{clampedRating.toFixed(1)}</Text>
      </View>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "#10b981"; // emerald-500
    if (rating >= 2.5) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
  };

  const getRatingBgColor = (rating: number) => {
    if (rating >= 4) return "rgba(16, 185, 129, 0.1)"; // emerald-500 with opacity
    if (rating >= 2.5) return "rgba(245, 158, 11, 0.1)"; // amber-500 with opacity
    return "rgba(239, 68, 68, 0.1)"; // red-500 with opacity
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
    router.replace('/(tabs)');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Only show image container if it's a food product */}
        {!alertVisible && imageUri && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: imageUri as string }} 
              style={styles.loadingImage}
              resizeMode="cover"
            />
            <ScanLine />
          </View>
        )}
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Analyzing your food...</Text>
        <CustomAlert 
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={handleAlertClose}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)')}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Results</Text>
        <View style={{ width: 40 }} /> {/* Spacer for alignment */}
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {/* Show title only if it's a food product */}
        {analysis && analysis.isFood && (
          <Text style={styles.title}>Nutrition Analysis</Text>
        )}
        
        {/* Food Image - only show if it's a food product */}
        {analysis && analysis.isFood && imageUri && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: imageUri as string }} 
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
        
        {/* Rating - Minimal design with just stars and colored text */}
        {analysis && analysis.isFood && analysis.rating && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Overall Rating</Text>
            <View style={styles.starsBox}>
              {analysis.rating && renderStars(analysis.rating)}
            </View>
            <Text style={[
              styles.verdictText,
              { 
                color: analysis.rating && analysis.rating >= 3 
                  ? '#10b981'  // green-500 for good ratings
                  : '#ef4444'   // red-500 for poor ratings
              }
            ]}>
              {analysis.verdict || 
               (analysis.rating && analysis.rating >= 4 ? 'Excellent Choice!' : 
               analysis.rating && analysis.rating >= 3 ? 'Good Choice' : 
               'Needs Improvement')}
            </Text>
          </View>
        )}
        
        {/* Ingredients to Watch - only show if it's a food product and has ingredients to watch */}
        {analysis && analysis.isFood && analysis.ingredientsToWatch && Array.isArray(analysis.ingredientsToWatch) && analysis.ingredientsToWatch.length > 0 && (
          <View style={styles.ingredientsContainer}>
            <Text style={styles.sectionTitle}>Ingredients to Watch</Text>
            {analysis.ingredientsToWatch.map((ingredient, index) => {
              // Validate ingredient object
              if (!ingredient || !ingredient.name) return null;
              
              return (
                <View 
                  key={index} 
                  style={styles.ingredientItem}
                >
                  <View style={styles.ingredientHeader}>
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    <View style={[
                      styles.ingredientTag, 
                      { 
                        backgroundColor: 
                          ingredient.category === 'avoid' ? '#ef4444' : 
                          ingredient.category === 'limit' ? '#f87171' : 
                          ingredient.category === 'moderate' ? '#fbbf24' : 
                          '#22c55e' 
                      }
                    ]}>
                      <Text style={styles.ingredientTagText}>
                        {ingredient.category ? ingredient.category.charAt(0).toUpperCase() + ingredient.category.slice(1) : 'Review'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.ingredientDescription}>
                    {ingredient.reason || 'No specific reason provided'}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
      
      <CustomAlert 
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={handleAlertClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Outfit',
    color: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingImage: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    width: 256,
    height: 256,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  image: {
    width: 256,
    height: 256,
    borderRadius: 16,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
    color: '#64748b',
    fontFamily: 'Outfit',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Outfit',
    color: '#0f172a',
    paddingHorizontal: 16,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Outfit',
    color: '#334155',
    marginBottom: 12,
  },
  starsBox: {
    alignItems: 'center',
    marginVertical: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starFull: {
    fontSize: 32,
    color: '#f59e0b',
    fontFamily: 'Outfit',
    marginHorizontal: 2,
  },
  starHalf: {
    fontSize: 32,
    color: '#f59e0b',
    fontFamily: 'Outfit',
    marginHorizontal: 2,
    opacity: 0.7,
  },
  starEmpty: {
    fontSize: 32,
    color: '#e2e8f0',
    fontFamily: 'Outfit',
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 20,
    color: '#334155',
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: 'Outfit',
  },
  verdictText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Outfit',
    marginTop: 12,
  },
  ingredientsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'Outfit',
    color: '#0f172a',
  },
  ingredientItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientName: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: 16,
    fontFamily: 'Outfit',
    flex: 1,
    marginRight: 8,
  },
  ingredientTag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ingredientTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Outfit',
  },
  ingredientDescription: {
    color: '#64748b',
    fontSize: 14,
    fontFamily: 'Outfit',
    lineHeight: 20,
  },
});