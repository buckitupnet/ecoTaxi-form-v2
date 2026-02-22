# Form v2.0.2 - EcoTaxi Order Form with File Upload

🔗 **Repository**: https://github.com/buckitupnet/ecoTaxi-form-v2  
📦 **Based on**: [Buckitup-chat/ecoTaxi-form](https://github.com/Buckitup-chat/ecoTaxi-form)  
📅 **Version**: v2.0.2 (2026-02-22)

## Overview

This is a complete rewrite of the Eco-Taxi order form with **native file upload support built in from the ground up** and **production-grade SECP256K1 cryptography**. No workarounds, no hacks - clean, maintainable, secure architecture.

**Latest Version**: v2.0.2 (2026-02-22)  
**Status**: ⚠️ In Testing

## ⚠️ Current Status

**Working**:
- ✅ User registration on eco-taxi.one
- ✅ Text message sending via `chatSendText`
- ✅ Base64→Hex key architecture (matches original source)
- ✅ WebAuthn vault authentication
- ✅ Multi-language support (EN/KA)

**In Progress**:
- ⚠️ File upload (`uploadKey` mutation returns 500 - under investigation)

## Features

✅ **WebAuthn Authentication** - Secure vault-based user authentication  
✅ **Multi-language Support** - English & Georgian (easily extensible)  
✅ **File Uploads** - Native support for multiple file uploads with chunked transfer  
✅ **EcoTaxi.one Integration** - Full API integration with text + files  
✅ **Monday.com Integration** - Text-only order creation  
✅ **Progress Tracking** - Real-time upload progress feedback  
✅ **Responsive UI** - Mobile-friendly Tailwind CSS design  
✅ **No Build Step** - Uses ES6 modules, runs directly in browser  

## Architecture

### Clean Module Structure

```
form_2/
├── index.html          # Main HTML page
├── app.js              # Main application logic
├── config.js           # Configuration (API keys, URLs)
├── i18n.js             # Internationalization
├── vault.js            # WebAuthn vault system
├── ecoTaxiAPI.js       # EcoTaxi API client with file uploads
└── mondayAPI.js        # Monday.com API client
```

### How It Works

1. **User logs in** → WebAuthn creates/unlocks vault → Keypair generated/retrieved
2. **User fills form** → Selects files → Validation
3. **Form submission**:
   - Files uploaded to eco-taxi.one (chunked, with progress)
   - Text message sent to eco-taxi.one
   - Order created in Monday.com
4. **Success** → User sees confirmation

### Key Differences from Original

| Original Form | Form v2.0 |
|--------------|-----------|
| Minified bundle | Readable ES6 modules |
| Vault not accessible | Vault integrated |
| External file upload script | Native file upload |
| Network capture workaround | Direct keypair access |
| Hard to maintain | Easy to modify |
| **Proper SECP256K1** | **@noble/secp256k1 library** |

## Usage

### Local Development

```bash
cd /Users/imitationoflife/Downloads/order_form/form_2
python3 -m http.server 8000
```

Open: `http://localhost:8000`

### First Time Setup

1. Click **"Login"** button
2. Browser will prompt for biometric auth (Touch ID, Face ID, etc.)
3. Vault created with keypair
4. You're ready to submit orders with files!

### Submitting an Order

1. Login (if not already)
2. Fill out form fields:
   - Select date(s)
   - Choose area
   - Enter address, email, phone
   - Select quantity, tariff, payment
   - **Upload photos** (optional)
   - Add comment (optional)
3. Click **"Submit Order"**
4. Files upload with progress indicator
5. Success message appears

## Configuration

Edit `config.js` to change:

- EcoTaxi.one API endpoints
- Monday.com board ID & API key
- Google Maps API key
- File upload chunk size

## API Integration

### EcoTaxi.one

**File Upload Flow**:
1. `uploadKey` mutation → Get upload key
2. PUT `/upload_chunk/:key` → Upload file in 10MB chunks
3. `chatSendFile` mutation → Send file to dialog

**Text Message**:
- `chatSendText` mutation → Send order details

### Monday.com

- `create_item` mutation → Create order in board
- Text data only (no file attachments)

## Security

### Vault System

- Uses WebAuthn for authentication
- Keypair stored encrypted in localStorage
- Only accessible after biometric auth
- No keypair = no submissions

### File Upload

- Files sent directly to eco-taxi.one
- Encrypted with user's keypair
- Chunked upload for large files
- Progress tracking

## Extending

### Adding New Languages

Edit `i18n.js`:

```javascript
this.translations.ru = {
    'title': 'Эко-такси...',
    // ... more translations
};
```

### Adding Form Fields

1. Add to `index.html`:
```html
<input type="text" name="newField" />
```

2. Update Monday.com payload in `mondayAPI.js`:
```javascript
columnVals: JSON.stringify({
    // ... existing fields
    newColumn: formData.get('newField')
})
```

3. Include in text message generation

### Custom File Types

Edit `index.html`:

```html
<input type="file" accept="image/*,application/pdf" />
```

## Testing

### Test Checklist

- [  ] Login/Register works
- [  ] Form validation
- [  ] File selection & preview
- [  ] File upload with progress
- [  ] Text message sent
- [  ] Monday.com item created
- [  ] Success message shown
- [  ] Logout works

### Debug Mode

Open browser console for detailed logs:

```
🚀 Initializing Form v2.0...
✅ Vault found: BDb2Fgr1laIrGlif
🔓 Unlocking vault...
✅ Vault unlocked!
📝 Form submitted
📤 Uploading 2 file(s)...
✅ All files uploaded
📤 Sending order to eco-taxi.one...
✅ Order sent to eco-taxi.one
📤 Creating Monday.com item...
✅ Monday.com item created
```

## Deployment

1. Copy `form_2/` folder to your web server
2. Update `config.js` with production URLs
3. Ensure HTTPS (required for WebAuthn)
4. Test thoroughly

## Comparison with Original

### Pros of Form v2.0

✅ Clean, maintainable code  
✅ Easy to debug  
✅ No build process needed  
✅ Native file upload (no hacks)  
✅ Well documented  
✅ Easy to extend  

### Cons of Form v2.0

❌ Requires modern browser (ES6 modules)  
❌ Simplified vault (not as secure as full Local-Vault)  
❌ No Google Maps integration yet  
❌ Missing some UI polish  

## Roadmap

- [ ] Add Google Maps location picker
- [ ] Implement full Local-Vault library
- [ ] Add orders history functionality
- [ ] Image compression before upload
- [ ] Drag & drop file upload
- [ ] Better error handling & retry logic
- [ ] Unit tests

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify you're using HTTPS (required for WebAuthn)
3. Try clearing localStorage and re-registering
4. Check network tab for API errors

## License

Same as parent project

---

**Built with ❤️ for Eco-Taxi**  
*v2.0 - 2026-02-02*
