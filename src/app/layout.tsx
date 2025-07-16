import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import 'sweetalert2/dist/sweetalert2.min.css';

import { getConfig } from '@/lib/config';

import { SiteProvider } from '../components/SiteProvider';
import { ThemeProvider } from '../components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

// 在模块内部声明类型扩展
declare global {
  interface Location {
    'm3u8去插播广告'?: boolean;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  let siteName = process.env.SITE_NAME || 'MoonTV';
  if (process.env.NEXT_PUBLIC_STORAGE_TYPE !== 'd1') {
    const config = await getConfig();
    siteName = config.SiteConfig.SiteName;
  }

  return {
    title: siteName,
    description: '影视聚合',
    manifest: '/manifest.json',
  };
}

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let siteName = process.env.SITE_NAME || 'MoonTV';
  let announcement =
    process.env.ANNOUNCEMENT ||
    '本网站仅提供影视信息搜索服务，所有内容均来自第三方网站。本站不存储任何视频资源，不对任何内容的准确性、合法性、完整性负责。';
  let enableRegister = process.env.NEXT_PUBLIC_ENABLE_REGISTER === 'true';
  let imageProxy = process.env.NEXT_PUBLIC_IMAGE_PROXY || '';
  if (process.env.NEXT_PUBLIC_STORAGE_TYPE !== 'd1') {
    const config = await getConfig();
    siteName = config.SiteConfig.SiteName;
    announcement = config.SiteConfig.Announcement;
    enableRegister = config.UserConfig.AllowRegister;
    imageProxy = config.SiteConfig.ImageProxy;
  }

  const runtimeConfig = {
    STORAGE_TYPE: process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage',
    ENABLE_REGISTER: enableRegister,
    IMAGE_PROXY: imageProxy,
  };

  return (
    <html lang='zh-CN' suppressHydrationWarning>
      <head>
        {/* 运行时配置 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.RUNTIME_CONFIG = ${JSON.stringify(runtimeConfig)};`,
          }}
        />
        
        {/* 预加载远程脚本 */}
        <link rel="preload" as="script" href="https://cdn.jsdmirror.cn/gh/963540817/dashu/M3u8.user.js" />
        
        {/* 远程脚本 */}
        <script 
          src="https://cdn.jsdmirror.cn/gh/963540817/dashu/M3u8.user.js" 
          defer 
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function onRemoteScriptLoaded() {
                  console.log('远程脚本加载成功');
                  if (typeof location['m3u8去插播广告'] !== 'undefined') {
                    console.log('m3u8adfilter 功能已生效');
                  } else {
                    console.warn('远程脚本加载但未生效，回退本地脚本');
                    fallbackToLocalScript();
                  }
                }
                
                function fallbackToLocalScript() {
                  console.log('尝试加载本地脚本...');
                  const script = document.createElement('script');
                  script.src = 'https://cdn.jsdmirror.cn/gh/963540817/dashu/M3u8.user.js';
                  script.onload = function() {
                    console.log('本地脚本加载成功');
                    if (typeof location['m3u8去插播广告'] !== 'undefined') {
                      console.log('m3u8adfilter 本地功能生效');
                    } else {
                      console.error('本地脚本也未生效');
                    }
                  };
                  script.onerror = function() {
                    console.error('本地脚本加载失败');
                  };
                  document.head.appendChild(script);
                }
                
                // 设置当前脚本的事件处理器
                var currentScript = document.currentScript || 
                  document.querySelector('script[src="https://cdn.jsdmirror.cn/gh/963540817/dashu/M3u8.user.js"]');
                currentScript.onload = onRemoteScriptLoaded;
                currentScript.onerror = fallbackToLocalScript;
              })();
            `
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-white text-gray-900 dark:bg-black dark:text-gray-200`}>
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
