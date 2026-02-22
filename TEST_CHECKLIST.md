# Test Checklist - Form v2.0.1

## ✅ Pre-Deployment Testing

### Environment Setup

- [ ] Local server running (`python3 -m http.server 8000`)
- [ ] Browser DevTools open (F12)
- [ ] Network tab monitoring
- [ ] Console tab visible

---

## Test 1: Page Load

### Steps
1. Navigate to `http://localhost:8000`
2. Wait for page to load completely

### Expected Results
- [ ] Page loads without errors
- [ ] Version badge shows "Form v2.0 - Production"
- [ ] Console shows: `🚀 Initializing Form v2.0...`
- [ ] Console shows: `✅ App initialized`
- [ ] No red errors in console
- [ ] Tailwind CSS loaded (styling present)

---

## Test 2: Keypair Generation (CRITICAL!)

### Steps
1. Click **"Login"** button
2. Follow biometric auth prompts
3. Watch console output

### Expected Results
- [ ] Biometric prompt appears
- [ ] Console shows: `🔐 Generating SECP256K1 keypair...`
- [ ] Console shows: `✅ SECP256K1 keypair generated`
- [ ] Private key length: **64 chars**
- [ ] Public key length: **66 chars**
- [ ] Public key prefix: **02** or **03**
- [ ] Console shows: `✅ Vault created successfully!`
- [ ] "Welcome Eco-Taxi User!" appears
- [ ] Logout button visible
- [ ] Login button hidden

### Validation Commands
```javascript
// In console:
const vaultId = localStorage.getItem('vault-id');
const vault = JSON.parse(localStorage.getItem(`local-vault-${vaultId}`));
const data = JSON.parse(vault.data);
console.log('Public key:', data.userKeipair.publicKey);
console.log('Private key:', data.userKeipair.privateKey);
console.log('Public length:', data.userKeipair.publicKey.length); // Should be 66
console.log('Private length:', data.userKeipair.privateKey.length); // Should be 64
```

---

## Test 3: Form Validation

### Steps
1. Click **"Submit Order"** without filling form

### Expected Results
- [ ] Error message appears
- [ ] Console shows validation error
- [ ] Form does not submit

---

## Test 4: File Selection

### Steps
1. Click file input
2. Select 2-3 image files

### Expected Results
- [ ] File input opens
- [ ] Files selected
- [ ] Thumbnails appear below input
- [ ] File names visible
- [ ] Remove (×) buttons on each thumbnail

---

## Test 5: File Upload (CRITICAL!)

### Steps
1. Fill out form completely:
   - Select at least one date
   - Choose area
   - Enter address
   - Enter email
   - Enter phone
   - Select tariff
   - Select payment method
2. Select 2 image files
3. Click **"Submit Order"**
4. Watch console AND network tab

### Expected Results
- [ ] Progress bar appears
- [ ] Console shows: `📤 Uploading 2 file(s)...`
- [ ] Console shows: `📤 Uploading file: filename.jpg`
- [ ] Console shows: `✅ Got upload key`
- [ ] Console shows: `✅ File chunks uploaded`
- [ ] Console shows: `✅ File sent to chat`
- [ ] **NO 500 errors in network tab!** ⭐
- [ ] Console shows: `✅ All files uploaded`
- [ ] Console shows: `📤 Sending order to eco-taxi.one...`
- [ ] Console shows: `✅ Order sent to eco-taxi.one`
- [ ] Success message appears
- [ ] Form resets

### Critical Check - Network Tab
Look for POST to `https://eco-taxi.one/naive_api`:
- [ ] Status: **200 OK** (NOT 500!)
- [ ] Response has `data` object
- [ ] No error messages

---

## Test 6: Monday.com Integration

### Steps
(Happens automatically during form submission)

### Expected Results
- [ ] Console shows: `📤 Creating Monday.com item...`
- [ ] Console shows: `✅ Monday.com item created` OR
- [ ] Console shows: `⚠️ Continuing without Monday.com...` (non-blocking)

---

## Test 7: Multiple Submissions

### Steps
1. Submit form with files (test 5)
2. Wait for success
3. Fill form again with different files
4. Submit again

### Expected Results
- [ ] Second submission works
- [ ] Files upload successfully
- [ ] Keypair still valid
- [ ] No need to login again

---

## Test 8: Logout/Login

### Steps
1. Click **"Logout"** button
2. Click **"Login"** button again
3. Complete biometric auth

### Expected Results
- [ ] Logout works
- [ ] Welcome message hidden
- [ ] Login button shows
- [ ] Can login again
- [ ] Vault unlocks
- [ ] Same keypair retrieved
- [ ] Can submit form after re-login

---

## Test 9: Browser Compatibility

### Browsers to Test
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

### Expected Results
- [ ] Works in all browsers
- [ ] WebAuthn supported
- [ ] File uploads work
- [ ] No console errors

---

## Test 10: Error Scenarios

### Test A: Submit Without Login
**Steps**: Logout, then try to submit form with files  
**Expected**: Error "Please login first to submit the order"

### Test B: Invalid File Type
**Steps**: Try to upload .txt file  
**Expected**: Accepts (no restriction yet) OR shows validation

### Test C: Large Files
**Steps**: Upload 20MB+ image  
**Expected**: Uploads in chunks, progress shows

### Test D: Network Error
**Steps**: Disable network mid-upload  
**Expected**: Error message, can retry

---

## 🎯 Success Criteria

**ALL of these must pass**:

✅ Page loads without errors  
✅ Keypair generates correctly (64/66 chars, valid prefix)  
✅ File upload returns **200 OK** (NOT 500!)  
✅ Files appear in eco-taxi.one  
✅ Order created in Monday.com  
✅ Success message shows  
✅ No console errors  
✅ Works in major browsers  

---

## 🐛 If Tests Fail

### Failure: 500 Error on File Upload

**Check**:
```javascript
// In console after upload attempt:
const vaultId = localStorage.getItem('vault-id');
const vault = JSON.parse(localStorage.getItem(`local-vault-${vaultId}`));
const data = JSON.parse(vault.data);
const kp = data.userKeipair;

console.log('Public key valid?', kp.publicKey.length === 66);
console.log('Private key valid?', kp.privateKey.length === 64);
console.log('Prefix valid?', ['02', '03'].includes(kp.publicKey.substring(0, 2)));
```

If any are false, keypair generation failed!

### Failure: Keypair Not Generated

**Check**: 
- Is `window.secp256k1` defined?
- Did CDN load? (Network tab)
- Any console errors?

### Failure: WebAuthn Error

**Check**:
- Using HTTPS or localhost?
- Browser supports WebAuthn?
- Biometric auth available?

---

## 📊 Test Results Template

```
=== Form v2.0.1 Test Results ===

Date: [DATE]
Tester: [NAME]
Browser: [BROWSER VERSION]

Test 1: Page Load - PASS/FAIL
Test 2: Keypair Gen - PASS/FAIL ⭐
Test 3: Validation - PASS/FAIL
Test 4: File Select - PASS/FAIL
Test 5: File Upload - PASS/FAIL ⭐
Test 6: Monday.com - PASS/FAIL
Test 7: Multiple Subs - PASS/FAIL
Test 8: Logout/Login - PASS/FAIL
Test 9: Cross-Browser - PASS/FAIL
Test 10: Error Cases - PASS/FAIL

Overall: PASS/FAIL
Notes: [ANY ISSUES]
```

---

**Most Critical Tests**: #2 (Keypair) and #5 (File Upload)

If these two pass with 200 OK responses, the form is working correctly! 🎉
