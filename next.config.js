     /** @type {import('next').NextConfig} */
     const nextConfig = {
       // Add your Next.js configuration options here if you have any
       // For example:
       // reactStrictMode: true,
        experimental: {
        turbopack: {
          root: 'C:/Users/MSI/Desktop/next project/nextjs-dashboard', // Use forward slashes
        },
      },
     };

     module.exports = nextConfig;