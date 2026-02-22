// WebAuthn Vault - Simplified implementation
// For production, use the full Local-Vault library
export class Vault {
    constructor() {
        this.vaultId = null;
        this.isAuthenticated = false;
        this.userData = null;
        this.keypair = null;
    }

    async initialize() {
        // Check if vault exists
        this.vaultId = localStorage.getItem('vault-id');
        
        if (this.vaultId) {
            console.log('✅ Vault found:', this.vaultId);
            // Try to load vault data
            await this.load();
        } else {
            console.log('ℹ️  No vault found. User needs to login/register.');
        }
    }

    async login() {
        // Check if we already have a vault
        if (this.vaultId) {
            return await this.unlock();
        } else {
            return await this.register();
        }
    }

    async register() {
        console.log('📝 Creating new vault...');
        
        try {
            // Create WebAuthn credential
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);
            
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: challenge,
                    rp: {
                        name: 'Eco-Taxi Form',
                        id: window.location.hostname
                    },
                    user: {
                        id: new Uint8Array(16),
                        name: 'eco-taxi-user',
                        displayName: 'Eco-Taxi User'
                    },
                    pubKeyCredParams: [
                        { type: 'public-key', alg: -7 }, // ES256
                        { type: 'public-key', alg: -257 } // RS256
                    ],
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'preferred'
                    },
                    timeout: 60000,
                    attestation: 'none'
                }
            });

            if (!credential) {
                throw new Error('Failed to create credential');
            }

            // Generate keypair for EcoTaxi
            const keypair = await this.generateKeypair();
            
            // Create vault ID
            this.vaultId = this.generateVaultId();
            localStorage.setItem('vault-id', this.vaultId);

            // Store user data (simplified - in production, encrypt this)
            const userData = {
                userName: 'Eco-Taxi User',
                userKeipair: keypair, // Note: keeping the typo for compatibility
                credentialId: this.arrayBufferToBase64(credential.rawId)
            };

            localStorage.setItem(`local-vault-${this.vaultId}`, JSON.stringify({
                data: JSON.stringify(userData), // In production, this would be encrypted
                accountID: credential.id,
                rpID: window.location.hostname
            }));

            this.isAuthenticated = true;
            this.userData = userData;
            this.keypair = keypair;

            console.log('✅ Vault created successfully!');
            console.log('   Vault ID:', this.vaultId);
            console.log('   Public key:', keypair.publicKey.substring(0, 16) + '...');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to create vault:', error);
            throw error;
        }
    }

    async unlock() {
        console.log('🔓 Unlocking vault...');
        
        try {
            // In a real implementation, we'd use WebAuthn to authenticate
            // For now, we'll just load the data if it exists
            
            const vaultData = localStorage.getItem(`local-vault-${this.vaultId}`);
            if (!vaultData) {
                throw new Error('Vault data not found');
            }

            const vault = JSON.parse(vaultData);
            const userData = JSON.parse(vault.data); // In production, decrypt this
            
            this.isAuthenticated = true;
            this.userData = userData;
            this.keypair = userData.userKeipair; // Note: typo for compatibility
            
            console.log('✅ Vault unlocked!');
            console.log('   User:', userData.userName);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to unlock vault:', error);
            throw error;
        }
    }

    async load() {
        // Try to load existing vault
        const vaultData = localStorage.getItem(`local-vault-${this.vaultId}`);
        if (vaultData) {
            const vault = JSON.parse(vaultData);
            const userData = JSON.parse(vault.data);
            this.userData = userData;
            this.keypair = userData.userKeipair;
            this.isAuthenticated = true;
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.userData = null;
        this.keypair = null;
        console.log('👋 Logged out');
    }

    getKeypair() {
        if (!this.isAuthenticated || !this.keypair) {
            throw new Error('Not authenticated or no keypair available');
        }
        return this.keypair;
    }

    async generateKeypair() {
        // Generate proper SECP256K1 keypair using @noble/secp256k1
        // EXACTLY matching the original source code architecture
        console.log('🔐 Generating SECP256K1 keypair (base64 format)...');
        
        // Wait for secp256k1 library to load
        while (!window.secp256k1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const secp = window.secp256k1;
        
        // Helper functions matching original Enigma.js
        const arrayToBase64 = (array) => {
            let binary = '';
            const bytes = new Uint8Array(array);
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        };
        
        // Generate random private key (32 bytes)
        const privateKeyBytes = secp.utils.randomPrivateKey();
        
        // Derive public key from private key (compressed format, 33 bytes)
        const publicKeyBytes = secp.getPublicKey(privateKeyBytes, true);
        
        // Convert to base64 strings (MATCHING ORIGINAL!)
        const privateKeyBase64 = arrayToBase64(privateKeyBytes);
        const publicKeyBase64 = arrayToBase64(publicKeyBytes);
        
        console.log('✅ SECP256K1 keypair generated (base64 format)');
        console.log('   Private key base64 length:', privateKeyBase64.length, 'chars');
        console.log('   Public key base64 length:', publicKeyBase64.length, 'chars');
        console.log('   Storage format: base64 (matches original)');
        console.log('   API format: will convert to hex on send');
        
        // Verify the keypair is valid
        try {
            const base64ToArray = (base64) => {
                const binary = atob(base64);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                return bytes;
            };
            
            const privBytes = base64ToArray(privateKeyBase64);
            const derivedPubBytes = secp.getPublicKey(privBytes, true);
            const derivedPubBase64 = arrayToBase64(derivedPubBytes);
            
            if (publicKeyBase64 !== derivedPubBase64) {
                throw new Error('Public key does not match private key!');
            }
            
            console.log('✅ Keypair cryptographically verified');
        } catch (e) {
            console.error('❌ Keypair verification failed:', e);
            throw new Error('Generated keypair is invalid: ' + e.message);
        }
        
        return {
            publicKey: publicKeyBase64,
            privateKey: privateKeyBase64
        };
    }

    generateVaultId() {
        const bytes = new Uint8Array(12);
        crypto.getRandomValues(bytes);
        return Array.from(bytes)
            .map(b => b.toString(36))
            .join('')
            .substring(0, 16);
    }

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}
