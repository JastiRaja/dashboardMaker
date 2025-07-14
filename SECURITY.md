# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within Dashboard Maker, please send an email to [your-email@example.com]. All security vulnerabilities will be promptly addressed.

Please include the following information in your report:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)

## Security Best Practices

When using Dashboard Maker in production:

1. **Change default credentials**: Always change default database passwords and JWT secrets
2. **Use environment variables**: Never commit sensitive configuration to version control
3. **Enable HTTPS**: Use SSL certificates in production environments
4. **Regular updates**: Keep dependencies updated to the latest secure versions
5. **Database security**: Use strong database passwords and restrict database access
6. **CORS configuration**: Restrict allowed origins to your specific domains
7. **Input validation**: Always validate and sanitize user inputs
8. **Rate limiting**: Consider implementing rate limiting for API endpoints

## Security Features

Dashboard Maker includes the following security features:

- JWT-based authentication with configurable expiration
- Password encryption using BCrypt
- CORS configuration for cross-origin requests
- Input validation and sanitization
- SQL injection prevention through JPA/Hibernate
- XSS protection through proper output encoding 