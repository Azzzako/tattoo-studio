import { defineCloudflareEnv } from '@opennextjs/cloudflare';

declare module '@opennextjs/cloudflare' {
  interface CloudflareEnv {
    ASSETS: Fetcher;
  }
}

declare global {
  type CloudflareEnv = ReturnType<typeof getCloudflareEnv>;
}

function getCloudflareEnv() {
  return defineCloudflareEnv({});
}

export {};
