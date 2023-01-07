declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
      EMAIL_ADDRESS: string;
      EMAIL_PASSWORD: string;
      DATABASE_URL: string;
      REDIS_URL: string;
      SESSION_SECRET: string;
      CORS_ORIGIN: string;
      PORT: string;
    }
  }
}

export {}
