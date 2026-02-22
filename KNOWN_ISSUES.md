# Known Issues - Form v2.0.2

## 🐛 Critical Issue: File Upload Not Working

### Problem

`uploadKey` mutation returns **500 Internal Server Error**

### What Works

- ✅ `userSignUp` mutation (200 OK)
- ✅ `chatSendText` mutation (200 OK)
- ✅ Keypair generation (base64 format, verified)
- ✅ Base64→Hex conversion (66/64 chars, correct)

### What Fails

- ❌ `uploadKey` mutation (500 error)

### Request Details

```json
{
  "myKeypair": {
    "publicKey": "02364fc2e8eeab9eb51c8853a96fa21ad2af2aafee10d1cca664e453c5d249e079",
    "privateKey": "17a89a63f03b70348b3eb1c999187afe2a9e16315d73109dca57c998da608cb1"
  },
  "destination": {
    "type": "DIALOG",
    "keypair": {
      "publicKey": "028f6245d765045c4a8cfe3b44d5e3b4d3dc1d969e4d4d19220b56ac3f77ce19bf",
      "privateKey": ""
    }
  },
  "entry": {
    "clientName": "Screenshot.png",
    "clientType": "image/png",
    "clientSize": 1292592,
    "clientRelativePath": "/",
    "clientLastModified": 1766726361
  },
  "timestamp": 1771776420
}
```

### Investigation Notes

1. **Architecture matches source**: Keys stored as base64, converted to hex for API (verified)
2. **User registration works**: Same keypair format accepted by `userSignUp`
3. **Text messages work**: Same keypair format accepted by `chatSendText`
4. **File uploads in original**: Original code does NOT upload files to eco-taxi.one (only to Monday.com)
5. **New functionality**: File upload to eco-taxi.one is NEW per PLAN.md

### Possible Causes

1. **Server-side issue**: `uploadKey` mutation may have a bug
2. **Missing field**: May require additional field not in documentation
3. **Not implemented**: File upload to dialogs may not be implemented on server
4. **Timestamp wrong**: May not accept timestamp parameter
5. **Destination structure**: May require different structure

### Next Steps

- [ ] Contact backend team for server logs
- [ ] Test `uploadKey` directly via GraphiQL at `/naive_api_console`
- [ ] Verify server-side implementation exists
- [ ] Check if `timestamp` should be removed
- [ ] Try alternative destination structures

### Workaround Options

If `uploadKey` is not available:

1. **Monday.com only**: Re-enable Monday.com file uploads (already working in v1)
2. **Direct upload**: Use different upload mechanism if available
3. **Wait for backend**: Server team may need to implement/fix `uploadKey`

---

**Date**: 2026-02-22  
**Tested with**: User registered successfully, keys verified correct  
**Server**: https://eco-taxi.one/naive_api
