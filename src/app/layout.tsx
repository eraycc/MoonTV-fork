import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import '../lib/cron';

import './globals.css';
import 'sweetalert2/dist/sweetalert2.min.css';

import { getConfig } from '@/lib/config';

import { SiteProvider } from '../components/SiteProvider';
import { ThemeProvider } from '../components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

// Extend the Location interface to include your custom property
declare global {
  interface Location {
    'm3u8去插播广告'?: any;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();

  return {
    title: config.SiteConfig.SiteName,
    description: '影视聚合',
    manifest: '/manifest.json',
  };
}

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getConfig();
  const siteName = config.SiteConfig.SiteName;
  const announcement = config.SiteConfig.Announcement;

  const runtimeConfig = {
    STORAGE_TYPE: process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage',
    ENABLE_REGISTER: config.UserConfig.AllowRegister,
    AGGREGATE_SEARCH_RESULT: config.SiteConfig.SearchResultDefaultAggregate,
  };

  return (
    <html lang='zh-CN' suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.RUNTIME_CONFIG = ${JSON.stringify(runtimeConfig)};`,
          }}
        />
        
        <link rel="preload" as="script" href="https://cdn.jsdmirror.cn/gh/963540817/dashu/M3u8.user.js" />
        
        <Script 
          src="https://cdn.jsdmirror.cn/gh/963540817/dashu/M3u8.user.js"
          strategy="afterInteractive"
          onLoad={() => {
            console.log('远程脚本加载成功');
            if (typeof (location as any)['m3u8去插播广告'] !== 'undefined') {
              console.log('m3u8adfilter 功能已生效');
            } else {
              console.warn('远程脚本加载但未生效，回退本地脚本');
              const fallbackScript = document.createElement('script');
              fallbackScript.src = './m3u8adfilter.js?ver=1.0';
              fallbackScript.onload = () => {
                console.log('本地脚本加载成功');
                if (typeof (location as any)['m3u8去插播广告'] !== 'undefined') {
                  console.log('m3u8adfilter 本地功能生效');
                } else {
                  console.error('本地脚本也未生效');
                }
              };
              fallbackScript.onerror = () => console.error('本地脚本加载失败');
              document.head.appendChild(fallbackScript);
            }
          }}
          onError={() => {
            console.log('尝试加载本地脚本...');
            const fallbackScript = document.createElement('script');
            fallbackScript.src = './m3u8adfilter.js?ver=1.0';
            fallbackScript.onload = () => {
              console.log('本地脚本加载成功');
              if (typeof (location as any)['m3u8去插播广告'] !== 'undefined') {
                console.log('m3u8adfilter 本地功能生效');
              } else {
                console.error('本地脚本也未生效');
              }
            };
            fallbackScript.onerror = () => console.error('本地脚本加载失败');
            document.head.appendChild(fallbackScript);
          }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-white text-gray-900 dark:bg-black dark:text-gray-200`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <SiteProvider siteName={siteName} announcement={announcement}>
            {children}
          </SiteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
