# Security Documentation

## Environment Variables Required

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Gemini API (for Supabase Edge Functions)
GEMINI_API_KEY=your-gemini-api-key-here

# CORS Configuration (for production)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Security Measures Implemented

### 1. Input Validation
- All user inputs are validated before processing
- Message length is limited to 1000 characters
- Type checking for all input parameters

### 2. CORS Security
- Configurable allowed origins via environment variables
- Only POST and OPTIONS methods allowed
- Specific headers allowed

### 3. Error Handling
- Generic error messages to prevent information leakage
- Reduced logging in production
- No sensitive data in error responses

### 4. Authentication
- Supabase Row Level Security (RLS) enabled
- User-specific data access policies
- JWT tokens handled securely by Supabase

### 5. API Security
- Environment variables for sensitive configuration
- No hardcoded secrets in client code
- Rate limiting should be implemented at the infrastructure level

## Security Checklist

- [ ] Set up environment variables
- [ ] Configure CORS for production domains
- [ ] Set up Supabase RLS policies
- [ ] Implement rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Known Vulnerabilities Fixed

1. ✅ Hardcoded API keys moved to environment variables
2. ✅ Input validation added
3. ✅ CORS configuration improved
4. ✅ Excessive logging reduced
5. ✅ Error messages sanitized

## Recommendations

1. Use HTTPS in production
2. Implement rate limiting
3. Set up security monitoring
4. Regular dependency updates
5. Security audits
6. Consider implementing Content Security Policy (CSP) 