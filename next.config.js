// next.config.js

const headers = [
    {
      source: "/api/:path*",  // Apply CORS headers to all routes under /api/
      headers: [
        { key: "Access-Control-Allow-Credentials", value: "true" },
        { key: "Access-Control-Allow-Origin", value: "https://www.321niche.com" },  // Specify your domain
        { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
      ],
    },
  ];
  
  module.exports = {
    async headers() {
      return headers;
    },
  };
  