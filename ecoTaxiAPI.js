// EcoTaxi API Client with File Upload Support
// Architecture matches original ecoTaxi-form source code
import { CONFIG } from './config.js';

export class EcoTaxiAPI {
    constructor(vault) {
        this.vault = vault;
        this.baseUrl = CONFIG.ECO_TAXI.BASE_URL;
        this.adminKey = CONFIG.ECO_TAXI.ADMIN_KEY;
        this.chunkSize = CONFIG.ECO_TAXI.CHUNK_SIZE;
    }

    /**
     * Convert base64 to hex (matching original Enigma.js convertPublicKeyToHex)
     */
    base64ToHex(base64) {
        const binary = atob(base64);
        let hex = '';
        for (let i = 0; i < binary.length; i++) {
            const hexByte = binary.charCodeAt(i).toString(16);
            hex += hexByte.length === 2 ? hexByte : '0' + hexByte;
        }
        return hex;
    }

    /**
     * Convert keypair from base64 (storage format) to hex (API format)
     */
    convertKeypairToHex(keypairBase64) {
        return {
            publicKey: this.base64ToHex(keypairBase64.publicKey),
            privateKey: this.base64ToHex(keypairBase64.privateKey)
        };
    }

    /**
     * Register user on eco-taxi.one server (matching original EcoTaxi.js)
     */
    async registerUser(name) {
        const keypairBase64 = this.vault.getKeypair();
        const keypairHex = this.convertKeypairToHex(keypairBase64);
        
        console.log('📝 Registering user on eco-taxi.one...');
        console.log('   Name:', name);
        console.log('   Public key:', keypairHex.publicKey);
        
        const query = `
            mutation SignUp($name: String!, $keypair: InputKeyPair) {
                userSignUp(name: $name, keypair: $keypair) {
                    name
                    keys {
                        private_key
                        public_key
                    }
                }
            }
        `;

        const variables = {
            name: name,
            keypair: {
                publicKey: keypairHex.publicKey,
                privateKey: keypairHex.privateKey
            }
        };

        const result = await this.graphql(query, variables);
        console.log('✅ User registered on eco-taxi.one');
        return result.data.userSignUp;
    }

    async graphql(query, variables) {
        // Log the request for debugging
        console.log('📤 GraphQL Request Details:');
        console.log('   Mutation:', query.match(/mutation\s+(\w+)/)?.[1]);
        if (variables.myKeypair) {
            console.log('   Public Key (hex):', variables.myKeypair.publicKey);
            console.log('   Private Key (hex):', variables.myKeypair.privateKey);
            console.log('   Public length:', variables.myKeypair.publicKey.length, '(should be 66)');
            console.log('   Private length:', variables.myKeypair.privateKey.length, '(should be 64)');
            console.log('   Format: hex (converted from base64 storage)');
        }
        
        const response = await fetch(`${this.baseUrl}/naive_api`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query, variables })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ GraphQL Response Error:', errorText);
            console.error('   Status:', response.status);
            console.error('   Request payload:', JSON.stringify(variables, null, 2));
            throw new Error(`GraphQL request failed: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.errors) {
            console.error('❌ GraphQL Errors:', result.errors);
            throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`);
        }

        console.log('✅ GraphQL request successful');
        return result;
    }

    async sendTextMessage(text) {
        const keypairBase64 = this.vault.getKeypair();
        const keypairHex = this.convertKeypairToHex(keypairBase64);
        const timestamp = Math.floor(Date.now() / 1000);
        
        console.log('📤 Sending text message to eco-taxi.one...');
        console.log('   Keypair converted: base64 → hex for API');
        console.log('   Timestamp:', timestamp);
        
        const query = `
            mutation ChatSendText(
                $keypair: InputKeyPair!
                $peer: PublicKey!
                $text: String!
                $timestamp: Int!
            ) {
                chatSendText(
                    myKeypair: $keypair
                    peerPublicKey: $peer
                    text: $text
                    timestamp: $timestamp
                ) {
                    id
                    index
                }
            }
        `;

        const variables = {
            keypair: {
                publicKey: keypairHex.publicKey,
                privateKey: keypairHex.privateKey
            },
            peer: this.adminKey,
            text: text,
            timestamp: timestamp
        };

        const result = await this.graphql(query, variables);
        console.log('✅ Text message sent');
        return result.data.chatSendText;
    }

    async uploadFile(file, onProgress) {
        const keypair = this.vault.getKeypair();
        
        console.log(`📤 Uploading file: ${file.name} (${this.formatBytes(file.size)})`);
        
        // Step 1: Get upload key
        const uploadKey = await this.getUploadKey(file);
        console.log('  ✅ Got upload key');
        
        // Step 2: Upload file in chunks
        await this.uploadChunks(file, uploadKey, onProgress);
        console.log('  ✅ File chunks uploaded');
        
        // Step 3: Send file to chat
        await this.sendFileMessage(uploadKey);
        console.log('  ✅ File sent to chat');
        
        return uploadKey;
    }

    async getUploadKey(file) {
        const keypairBase64 = this.vault.getKeypair();
        const keypairHex = this.convertKeypairToHex(keypairBase64);
        const timestamp = Math.floor(Date.now() / 1000);
        
        console.log('🔑 Getting upload key...');
        console.log('   File:', file.name, `(${this.formatBytes(file.size)})`);
        console.log('   Timestamp:', timestamp);
        
        const query = `
            mutation GetUploadKey(
                $myKeypair: InputKeyPair!
                $destination: InputUploadDestination!
                $entry: InputUploadEntry!
                $timestamp: Int!
            ) {
                uploadKey(
                    myKeypair: $myKeypair
                    destination: $destination
                    entry: $entry
                    timestamp: $timestamp
                )
            }
        `;

        const variables = {
            myKeypair: {
                publicKey: keypairHex.publicKey,
                privateKey: keypairHex.privateKey
            },
            destination: {
                type: 'DIALOG',
                keypair: {
                    publicKey: this.adminKey,
                    privateKey: ''
                }
            },
            entry: {
                clientName: file.name,
                clientType: file.type,
                clientSize: file.size,
                clientRelativePath: '/',
                clientLastModified: Math.floor(file.lastModified / 1000)
            },
            timestamp: timestamp
        };

        const result = await this.graphql(query, variables);
        console.log('✅ Upload key received');
        return result.data.uploadKey;
    }

    async uploadChunks(file, uploadKey, onProgress) {
        const totalChunks = Math.ceil(file.size / this.chunkSize);
        const keyHex = this.base64ToHex(uploadKey);

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * this.chunkSize;
            const end = Math.min(start + this.chunkSize, file.size);
            const chunk = file.slice(start, end);

            const response = await fetch(`${this.baseUrl}/upload_chunk/${keyHex}`, {
                method: 'PUT',
                headers: {
                    'Content-Range': `bytes ${start}-${end - 1}/${file.size}`
                },
                body: chunk
            });

            if (!response.ok) {
                throw new Error(`Upload failed for chunk ${chunkIndex + 1}/${totalChunks}`);
            }

            if (onProgress) {
                const progress = ((chunkIndex + 1) / totalChunks) * 100;
                onProgress(progress, file.name);
            }
        }
    }

    async sendFileMessage(uploadKey) {
        const keypairBase64 = this.vault.getKeypair();
        const keypairHex = this.convertKeypairToHex(keypairBase64);
        const timestamp = Math.floor(Date.now() / 1000);
        
        console.log('📤 Sending file message to eco-taxi.one...');
        console.log('   Timestamp:', timestamp);
        
        const query = `
            mutation ChatSendFile(
                $keypair: InputKeyPair!
                $peer: PublicKey!
                $uploadKey: FileKey!
                $timestamp: Int!
            ) {
                chatSendFile(
                    myKeypair: $keypair
                    peerPublicKey: $peer
                    uploadKey: $uploadKey
                    timestamp: $timestamp
                ) {
                    id
                    index
                }
            }
        `;

        const variables = {
            keypair: {
                publicKey: keypairHex.publicKey,
                privateKey: keypairHex.privateKey
            },
            peer: this.adminKey,
            uploadKey: uploadKey,
            timestamp: timestamp
        };

        const result = await this.graphql(query, variables);
        console.log('✅ File message sent');
        return result.data.chatSendFile;
    }

    async uploadMultipleFiles(files, onProgress) {
        const results = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileProgress = (fileIndex, progress) => {
                const overallProgress = ((i / files.length) + (progress / 100 / files.length)) * 100;
                onProgress(overallProgress, `${file.name} (${i + 1}/${files.length})`);
            };
            
            const result = await this.uploadFile(file, fileProgress);
            results.push(result);
        }
        
        return results;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}
