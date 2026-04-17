/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevents clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prevents MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Forces HTTPS for 1 year
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Removes legacy XSS filter (CSP is better)
          { key: 'X-XSS-Protection', value: '0' },
          // Controls referrer info sent on navigation
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restricts browser features (camera, mic, geolocation)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com",
              "font-src 'self' https://fonts.gstatic.com https://api.fontshare.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://firebasestorage.googleapis.com https://images.unsplash.com",
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://api.cloudinary.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
              "frame-src https://*.firebaseapp.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
