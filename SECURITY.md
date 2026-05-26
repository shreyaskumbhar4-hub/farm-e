# Security Policy

Farm-E takes security seriously. This document outlines our security practices, supported versions, and how to report vulnerabilities.

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          | Until       |
| ------- | ------------------ | ----------- |
| 1.x.x   | :white_check_mark: | TBD         |
| < 1.0   | :x:                | Not Supported |

## Security Best Practices

### 1. Environment Variables & Secrets

**NEVER commit sensitive data** to the repository:

- API keys (Firebase, Weather API, OpenRouter)
- Authentication tokens
- Private credentials
- Database credentials

**Always use**:
- `.env` file (local development only, not committed)
- `.env.example` with placeholder values for documentation
- Environment variables in production deployments (CI/CD, hosting platforms)
- `.gitignore` to exclude `.env` files

### 2. Firebase Security

Farm-E uses Firebase for authentication and data management:

- **Authentication**: Email/password authentication with secure session management
- **Firestore Rules**: Configure Firestore security rules to restrict data access
- **API Keys**: Keep Firebase API keys restricted in production
  - Enable key restrictions in Google Cloud Console
  - Restrict API key usage by HTTP referer and API methods
- **Email Verification**: Users should verify their email addresses
- **Password Policy**: Encourage strong passwords (minimum 6 characters enforced by Firebase)

### 3. API Key Security

All third-party API keys are securely managed:

- **Weather API**: Restrict to HTTPS requests only
- **OpenRouter API**: Use API key restrictions at the provider level
- **Frontend Exposure**: VITE_ prefixed variables are exposed to the frontend
  - These should only be used for public/semi-public APIs with proper rate limiting
  - Never include server-side secrets with VITE_ prefix

### 4. Authentication & Authorization

- Sessions are managed by Firebase Authentication
- All sensitive operations should be authenticated
- Implement proper authorization checks on the backend
- Use secure HTTP-only cookies for session management (when applicable)
- Implement account lockout mechanisms for failed login attempts

### 5. Data Privacy

- User location data (farm location) should be handled with care
- Only collect and store necessary agricultural data
- Implement data retention policies
- Comply with local privacy regulations (GDPR, CCPA, etc.)
- Provide users with data access and deletion options

### 6. HTTPS & Transport Security

- **Always use HTTPS** in production
- Use Secure (secure, httponly) cookies
- Implement HSTS (HTTP Strict-Transport-Security) headers
- Enforce HTTPS redirects from HTTP

### 7. Content Security Policy (CSP)

Implement CSP headers to prevent XSS attacks:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:
```

### 8. Input Validation & Output Encoding

- Validate all user input on both client and server
- Sanitize data before storing or displaying
- Encode output to prevent XSS attacks
- Use parameterized queries for database operations
- Validate file uploads (size, type, content)

### 9. CORS & Cross-Site Requests

- Configure CORS carefully in production
- Only allow trusted origins
- Use SameSite cookie attribute to prevent CSRF attacks
- Implement CSRF tokens for state-changing operations

### 10. Dependency Security

- Keep dependencies updated regularly
- Monitor dependencies for known vulnerabilities
  ```bash
  npm audit
  npm audit fix
  ```
- Use lock files (package-lock.json) for reproducible builds
- Review dependency updates before deploying

### 11. Mobile Security (Capacitor/Android)

- Use secure storage for sensitive data on mobile devices
- Don't store credentials locally; use Firebase auth tokens
- Implement certificate pinning for API communications
- Use ProGuard/R8 for code obfuscation in production builds
- Test on multiple Android versions

### 12. Logging & Monitoring

- Don't log sensitive data (passwords, tokens, API keys)
- Implement application monitoring and error tracking
- Monitor for suspicious authentication attempts
- Keep audit logs of critical operations
- Set up alerts for unusual activity

### 13. Error Handling

- Don't expose sensitive information in error messages
- Log detailed errors server-side for debugging
- Show generic error messages to users
- Handle exceptions gracefully

### 14. Code Review

- All code changes should be reviewed before merging
- Security-focused code reviews for sensitive areas
- Use static analysis tools (ESLint configured)
- Keep code quality standards high

## Reporting a Vulnerability

If you discover a security vulnerability in Farm-E, **please do NOT open a public GitHub issue**. Instead:

### Disclosure Process

1. **Email the maintainers** with the vulnerability details:
   - Subject: `[SECURITY] Vulnerability Report - Farm-E`
   - Include a clear description of the vulnerability
   - Provide steps to reproduce (if applicable)
   - Suggest a fix if you have one

2. **Allow reasonable time** for the maintainers to respond and fix the issue (typically 7-30 days depending on severity)

3. **Coordinated disclosure**: Once a fix is released, the vulnerability details may be disclosed publicly

### Vulnerability Severity

We prioritize based on severity:
- **Critical**: Affects data confidentiality/integrity, authentication bypass, RCE
- **High**: Significant security impact, affects multiple users
- **Medium**: Limited impact or requires specific conditions
- **Low**: Minor security issue with minimal impact

### Response Timeline

- **Critical**: Response within 24-48 hours
- **High**: Response within 3-5 days
- **Medium/Low**: Response within 1-2 weeks

## Security Considerations for Users

### For Farmers Using Farm-E

- Use a strong, unique password for your account
- Enable two-factor authentication if available
- Don't share your account credentials with others
- Log out from shared devices
- Keep your device's OS and browser updated
- Be cautious of phishing emails
- Report suspicious activity immediately

### For Developers

- Review security guidelines before contributing
- Report security issues through proper channels
- Follow secure coding practices
- Test security-sensitive features thoroughly
- Keep development dependencies updated

## Additional Resources

- [OWASP Top 10 Web Application Security Risks](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://react.dev/learn)
- [Firebase Security Best Practices](https://firebase.google.com/docs/database/security)
- [Web Security Academy](https://portswigger.net/web-security)

## Change Log

- **v1.0** (2026): Initial security policy for Farm-E

---

For questions about security practices, please reach out to the project maintainers through appropriate channels.
