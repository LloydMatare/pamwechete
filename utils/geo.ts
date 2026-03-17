import * as Location from 'expo-location';

export const ZIMBABWE_BOUNDS = {
  minLat: -22.5,
  maxLat: -15.5,
  minLng: 25.0,
  maxLng: 33.1,
};

export async function isUserInZimbabwe(): Promise<{
  success: boolean;
  reason?: string;
  coords?: { latitude: number; longitude: number };
}> {
  // FAST TRACK FOR DEVELOPMENT
  if (__DEV__) {
    console.log('Skipping geo-lock in development mode');
    return { success: true };
  }

  try {
    // 1. IP Check (Primary: ipapi.co, Fallback: ip-api.com)
    let countryCode = '';
    try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        const contentType = ipResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const ipData = await ipResponse.json();
            countryCode = ipData.country_code;
        } else {
            // Fallback to ip-api.com
            const fallbackResponse = await fetch('http://ip-api.com/json');
            const fallbackData = await fallbackResponse.json();
            countryCode = fallbackData.countryCode;
        }
    } catch (e) {
        console.error('IP Check failed:', e);
    }
    
    if (countryCode && countryCode !== 'ZW') {
      return { success: false, reason: 'IP indicates you are outside Zimbabwe.' };
    }

    // 2. GPS Check (More accurate for critical actions)
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, reason: 'Location permission denied.' };
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const inBounds = 
      latitude >= ZIMBABWE_BOUNDS.minLat && 
      latitude <= ZIMBABWE_BOUNDS.maxLat && 
      longitude >= ZIMBABWE_BOUNDS.minLng && 
      longitude <= ZIMBABWE_BOUNDS.maxLng;

    if (!inBounds) {
      return { success: false, reason: 'GPS coordinates outside Zimbabwe bounds.' };
    }

    return { success: true, coords: { latitude, longitude } };
  } catch (error) {
    console.error('Geo-locking error:', error);
    return { success: false, reason: 'Error verifying location.' };
  }
}
