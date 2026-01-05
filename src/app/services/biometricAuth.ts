// Biometric Authentication Service
// Using Web Authentication API (WebAuthn) for fingerprint/face recognition

interface BiometricCredential {
  id: string;
  email: string;
  publicKey: string;
}

const STORAGE_KEY = 'turjitrade_biometric_credentials';

/**
 * Check if biometric authentication is available
 */
export function isBiometricAvailable(): boolean {
  return (
    window.PublicKeyCredential !== undefined &&
    navigator.credentials !== undefined
  );
}

/**
 * Register biometric credential for a user
 */
export async function registerBiometric(email: string): Promise<boolean> {
  if (!isBiometricAvailable()) {
    console.warn('Biometric authentication not available on this device');
    return false;
  }

  try {
    // Create a random challenge
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Create credential options
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'TurjiTrade',
        id: window.location.hostname,
      },
      user: {
        id: new Uint8Array(16),
        name: email,
        displayName: email,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Use built-in authenticator (fingerprint/face)
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'none',
    };

    // Create credential
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      throw new Error('Failed to create credential');
    }

    // Store credential info
    const credentialData: BiometricCredential = {
      id: credential.id,
      email,
      publicKey: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
    };

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentialData));

    console.log('✅ Biometric credential registered successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to register biometric:', error);
    return false;
  }
}

/**
 * Authenticate using biometric
 */
export async function authenticateWithBiometric(): Promise<{ email: string } | null> {
  if (!isBiometricAvailable()) {
    console.warn('Biometric authentication not available on this device');
    return null;
  }

  // Check if there's a stored credential
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) {
    console.warn('No biometric credential found');
    return null;
  }

  try {
    const credentialData: BiometricCredential = JSON.parse(storedData);

    // Create a random challenge
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Create credential request options
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [
        {
          id: Uint8Array.from(atob(credentialData.publicKey), c => c.charCodeAt(0)),
          type: 'public-key',
        },
      ],
      timeout: 60000,
      userVerification: 'required',
    };

    // Get credential
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    }) as PublicKeyCredential;

    if (!assertion) {
      throw new Error('Failed to get credential');
    }

    console.log('✅ Biometric authentication successful');
    return { email: credentialData.email };
  } catch (error) {
    console.error('❌ Biometric authentication failed:', error);
    return null;
  }
}

/**
 * Check if biometric is registered for any user
 */
export function hasBiometricCredential(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Remove biometric credential
 */
export function removeBiometricCredential(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Biometric credential removed');
    return true;
  } catch (error) {
    console.error('❌ Failed to remove biometric credential:', error);
    return false;
  }
}

/**
 * Get stored email for biometric
 */
export function getBiometricEmail(): string | null {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) return null;
  
  try {
    const credentialData: BiometricCredential = JSON.parse(storedData);
    return credentialData.email;
  } catch {
    return null;
  }
}