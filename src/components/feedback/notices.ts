import { Alert } from 'react-native';

export function showComingSoon(feature: string): void {
  Alert.alert(feature, 'This part of the app is coming soon.');
}
