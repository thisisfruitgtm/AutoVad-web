/**
 * AutoVad Web App - Security Configuration
 * 
 * This file contains comprehensive security settings and recommendations
 * for the AutoVad car marketplace web application.
 */

module.exports = {
  // Application Security Settings
  app: {
    // Environment
    environment: process.env.NODE_ENV || 'development',
    
    // Security Headers
    headers: {
      // Content Security Policy
      csp: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://eu.i.posthog.com", "https://eu-assets.i.posthog.com"],
        'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        'font-src': ["'self'", "https://fonts.gstatic.com", "data:"],
        'img-src': ["'self'", "data:", "https:", "blob:", "https://mktfybjfxzhvpmnepshq.supabase.co", "https://images.pexels.com", "https://images.unsplash.com"],
        'media-src': ["'self'", "blob:", "https:", "https://mktfybjfxzhvpmnepshq.supabase.co"],
        'connect-src': ["'self'", "https:", "https://mktfybjfxzhvpmnepshq.supabase.co", "https://eu.i.posthog.com", "https://eu-assets.i.posthog.com"],
        'frame-src': ["'none'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'upgrade-insecure-requests': [],
      },
      
      // Other Security Headers
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
    },
  },

  // API Security Settings
  api: {
    // Rate Limiting
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100, // requests per window
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    
    // Input Validation
    validation: {
      maxQueryLength: 1000,
      maxPathLength: 100,
      maxBodySize: 1024 * 1024, // 1MB
      allowedOrigins: ['https://autovad.vercel.app', 'http://localhost:3000'],
    },
    
    // CORS Settings
    cors: {
      origin: ['https://autovad.vercel.app', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      maxAge: 86400,
    },
  },

  // Database Security (Supabase)
  database: {
    // Row Level Security (RLS) Policies
    rls: {
      enabled: true,
      policies: {
        cars: {
          public: {
            select: "status = 'active'",
            insert: false,
            update: false,
            delete: false,
          },
          authenticated: {
            select: "status = 'active' OR seller_id = auth.uid()",
            insert: "auth.uid() = seller_id",
            update: "auth.uid() = seller_id",
            delete: "auth.uid() = seller_id",
          },
        },
        users: {
          public: {
            select: "id, name, avatar_url, rating, verified, total_listings, total_sold",
            insert: false,
            update: false,
            delete: false,
          },
          authenticated: {
            select: "auth.uid() = id",
            insert: "auth.uid() = id",
            update: "auth.uid() = id",
            delete: false,
          },
        },
        likes: {
          public: {
            select: false,
            insert: false,
            update: false,
            delete: false,
          },
          authenticated: {
            select: "auth.uid() = user_id",
            insert: "auth.uid() = user_id",
            update: "auth.uid() = user_id",
            delete: "auth.uid() = user_id",
          },
        },
      },
    },
    
    // Connection Security
    connection: {
      ssl: true,
      connectionString: process.env.NEXT_PUBLIC_SUPABASE_URL,
      maxConnections: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  },

  // Authentication Security
  auth: {
    // Supabase Auth Settings
    supabase: {
      enableEmailConfirmations: true,
      enablePhoneConfirmations: true,
      enableMFA: true,
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecialChars: true,
      sessionTimeout: 3600, // 1 hour
      refreshTokenRotation: true,
    },
    
    // JWT Settings
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
      refreshExpiresIn: '7d',
      algorithm: 'HS256',
    },
  },

  // File Upload Security
  upload: {
    // Image Upload
    images: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxDimensions: { width: 4096, height: 4096 },
      scanForMalware: true,
    },
    
    // Video Upload
    videos: {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['video/mp4', 'video/quicktime', 'video/avi'],
      maxDuration: 300, // 5 minutes
      scanForMalware: true,
    },
    
    // Storage Security
    storage: {
      bucket: 'car-media',
      public: true,
      cors: {
        allowedOrigins: ['https://autovad.vercel.app'],
        allowedMethods: ['GET', 'POST', 'PUT'],
        allowedHeaders: ['*'],
        maxAgeSeconds: 3600,
      },
    },
  },

  // Monitoring and Logging
  monitoring: {
    // Error Tracking
    errors: {
      enabled: true,
      service: 'sentry', // or 'logrocket', 'bugsnag'
      environment: process.env.NODE_ENV,
      sampleRate: 1.0,
    },
    
    // Performance Monitoring
    performance: {
      enabled: true,
      service: 'posthog', // or 'google-analytics', 'mixpanel'
      trackPageViews: true,
      trackUserActions: true,
      trackErrors: true,
    },
    
    // Security Monitoring
    security: {
      enabled: true,
      logFailedLogins: true,
      logSuspiciousActivity: true,
      alertOnRateLimitExceeded: true,
      alertOnMultipleFailedRequests: true,
    },
  },

  // Production Security Checklist
  production: {
    checklist: [
      '✅ Environment variables properly configured',
      '✅ HTTPS enabled and enforced',
      '✅ Security headers implemented',
      '✅ Rate limiting configured',
      '✅ Input validation active',
      '✅ CORS properly configured',
      '✅ RLS policies enabled',
      '✅ File upload restrictions active',
      '✅ Error handling without sensitive data exposure',
      '✅ Monitoring and logging configured',
      '✅ Dependencies updated and scanned',
      '✅ Backup strategy implemented',
      '✅ SSL/TLS certificates valid',
      '✅ Domain security headers verified',
      '✅ API endpoints secured',
      '✅ Authentication flows tested',
      '✅ Authorization checks implemented',
      '✅ Data encryption at rest and in transit',
      '✅ Regular security audits scheduled',
      '✅ Incident response plan ready',
    ],
  },

  // Security Testing
  testing: {
    // Automated Security Tests
    automated: [
      'npm audit',
      'OWASP ZAP scan',
      'Snyk vulnerability scan',
      'Dependency vulnerability check',
      'Security headers validation',
      'CSP validation',
      'Rate limiting tests',
      'Input validation tests',
      'Authentication flow tests',
      'Authorization tests',
    ],
    
    // Manual Security Tests
    manual: [
      'SQL injection testing',
      'XSS testing',
      'CSRF testing',
      'Authentication bypass testing',
      'Authorization bypass testing',
      'File upload security testing',
      'API endpoint security testing',
      'Session management testing',
      'Error handling testing',
      'Business logic testing',
    ],
  },

  // Incident Response
  incidentResponse: {
    // Contact Information
    contacts: {
      security: 'security@autovad.com',
      technical: 'tech@autovad.com',
      legal: 'legal@autovad.com',
    },
    
    // Response Steps
    steps: [
      '1. Identify and contain the incident',
      '2. Assess the impact and scope',
      '3. Notify relevant stakeholders',
      '4. Investigate root cause',
      '5. Implement immediate fixes',
      '6. Document incident details',
      '7. Review and improve security measures',
      '8. Communicate with users if necessary',
    ],
  },

  // Network Security Configuration
  network: {
    // Allowed origins for API calls
    allowedOrigins: [
      'https://autovad.vercel.app',
      'https://mktfybjfxzhvpmnepshq.supabase.co',
      'https://stream.mux.com',
      'https://commondatastorage.googleapis.com',
      'https://images.unsplash.com',
      'https://images.pexels.com',
      'https://api.mux.com',
    ],
  },
}; 