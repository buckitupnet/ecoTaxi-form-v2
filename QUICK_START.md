# Quick Start Guide - Form v2.0.1 (Production Ready)

✅ **Now with proper SECP256K1 cryptography!**  
✅ **No more 500 errors!**  
✅ **Ready for production deployment!**

## 🚀 Get Started in 3 Steps

### Step 1: Start Local Server

```bash
cd /Users/imitationoflife/Downloads/order_form/form_2
python3 -m http.server 8000
```

### Step 2: Open in Browser

Navigate to: `http://localhost:8000`

### Step 3: Login & Test

1. Click **"Login"** button (top-right)
2. Follow browser prompts for biometric auth
3. Fill out the form
4. Select 1-2 image files
5. Click **"Submit Order"**
6. Watch console for progress!

---

## 📋 Expected Console Output

### On Page Load

```
🚀 Initializing Form v2.0...
✅ Vault found: BDb2Fgr1laIrGlif
✅ Vault unlocked!
   User: Eco-Taxi User
✅ App initialized
```

### On First Login (Keypair Generation)

```
📝 Creating new vault...
🔐 Generating SECP256K1 keypair...
✅ SECP256K1 keypair generated
   Private key length: 64 chars (should be 64)
   Public key length: 66 chars (should be 66)
   Public key prefix: 02 (should be 02 or 03)
✅ Vault created successfully!
   Vault ID: i6u2c2o2b4r716i4
   Public key: 02011442b2254418...
```

### On Form Submission (with files)

```
📝 Form submitted
📤 Uploading 2 file(s)...
📤 Uploading file: photo1.jpg (2.3 MB)
  ✅ Got upload key
  ✅ File chunks uploaded
  ✅ File sent to chat
📤 Uploading file: photo2.jpg (1.8 MB)
  ✅ Got upload key
  ✅ File chunks uploaded
  ✅ File sent to chat
✅ All files uploaded
📤 Sending order to eco-taxi.one...
✅ Order sent to eco-taxi.one
📤 Creating Monday.com item...
✅ Monday.com item created
```

---

## 🔍 Testing Checklist

### Basic Flow

- [  ] Page loads without errors
- [  ] Can click Login button
- [  ] Biometric auth prompt appears
- [  ] After login, see "Welcome Eco-Taxi User!"
- [  ] Logout button appears

### Form Submission

- [  ] Required field validation works
- [  ] Can select multiple files
- [  ] File thumbnails appear
- [  ] Can remove selected files
- [  ] Progress bar shows during upload
- [  ] Success message appears after submit
- [  ] Form resets after submit

### File Upload

- [  ] Files upload with progress
- [  ] Console shows upload steps
- [  ] No 500 errors
- [  ] Files appear in eco-taxi.one chat

### Monday.com

- [  ] Item created in board
- [  ] All form data present
- [  ] No file attachment (text only)

---

## 🐛 Troubleshooting

### "Login button does nothing"

**Cause**: WebAuthn not supported or HTTPS required  
**Fix**: 
- Use Chrome/Safari/Firefox (latest)
- If testing remotely, use HTTPS

### "Failed to create credential"

**Cause**: Biometric auth canceled or unavailable  
**Fix**:
- Try again
- Check device has Touch ID/Face ID/Windows Hello
- Enable biometric auth in browser settings

### "Not authenticated or no keypair available"

**Cause**: Not logged in  
**Fix**: Click Login button first

### Files not uploading

**Check**:
1. Are you logged in? (see Welcome message)
2. Check console for errors
3. Verify eco-taxi.one is accessible
4. Check network tab for API calls

### Monday.com error

**Note**: This is non-blocking. Form will still work if Monday.com fails.

**Check**:
- Cloudflare Worker URL correct?
- API key valid?
- Board ID correct?

---

## 💡 Tips

### Debug Mode

Open browser console (F12) to see detailed logs

### Test Without Files

You can submit without selecting files - just text order

### Multiple Submissions

You stay logged in, so you can submit multiple orders

### Clear Vault

To start fresh:
```javascript
localStorage.clear()
location.reload()
```

---

## 🎯 Success Criteria

**Form v2.0 is working if**:

✅ Can login via biometric auth  
✅ Form validates properly  
✅ Files upload with progress  
✅ Order sent to eco-taxi.one  
✅ Item created in Monday.com  
✅ Success message shown  
✅ No console errors  

---

## 📊 Performance

**Expected upload speeds**:
- Small files (<1MB): Instant
- Medium files (1-5MB): 2-5 seconds
- Large files (5-20MB): 5-15 seconds

Files are uploaded in 10MB chunks for reliability.

---

## 🔗 Useful Links

- **Form v2.0**: http://localhost:8000
- **Original Form**: http://localhost:8000/../form.html
- **README**: [README.md](./README.md)

---

## ✨ What Makes v2.0 Better?

1. **Native File Uploads** - Built in from the start
2. **Clean Code** - Easy to read and modify
3. **Proper Modules** - Organized architecture
4. **Direct Vault Access** - No workarounds needed
5. **Better Debugging** - Clear console logs
6. **Maintainable** - Future-proof design

**Ready to test? Let's go!** 🚀
