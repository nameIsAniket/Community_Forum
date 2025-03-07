import type { NextConfig } from "next";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();


const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com"],
  }
};

export default nextConfig;
