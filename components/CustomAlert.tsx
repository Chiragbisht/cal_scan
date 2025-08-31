import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
}

export default function CustomAlert({ 
  visible, 
  title, 
  message, 
  onClose, 
  buttonText = 'Retake' 
}: CustomAlertProps) {
  if (!visible) return null;
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Ionicons name="warning" size={24} color="#ef4444" />
            <Text style={styles.title} numberOfLines={2}>
              {title || 'Alert'}
            </Text>
          </View>
          {message ? (
            <Text style={styles.message}>
              {message}
            </Text>
          ) : null}
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#fefefe', // off-white color
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    width: '80%',
    maxWidth: 320,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
    fontFamily: 'Outfit',
    color: '#0f172a',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Outfit',
    color: '#64748b',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 100,
  },
  buttonText: {
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Outfit',
    fontSize: 16,
  },
});