import { ScrollViewStyleReset } from 'expo-router/html';
import { type ReactNode } from 'react';


// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children, metadata }: { children: ReactNode, metadata?: { description?: string; title?: string; keywords?: string; author?: string; viewport?: string; } }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>{metadata?.title || "Calendar App"}</title>
        <meta name="viewport" content={metadata?.viewport || "width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"} />
        <meta name="description" content={metadata?.description || "Calendar App"} />
        <meta name="keywords" content={metadata?.keywords || "calendar, appointment, booking, time, slot, date, time, slot, appointment, booking, calendar"} />
        <meta name="author" content="LSTech Solutions" />
        <meta name="publisher" content="LSTech Solutions" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={metadata?.title || "Calendar App"} />
        <meta property="og:description" content={metadata?.description || "Calendar App"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://calendar.lstech.solutions" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata?.title || "Calendar App"} />
        <meta name="twitter:description" content={metadata?.description || "Calendar App"} />
        <meta name="twitter:image" content="/og-image.png" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />


        {/* Bootstrap the service worker. */}
        <script dangerouslySetInnerHTML={{ __html: sw }} />

        {/**
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

      </head>
      <body>{children}</body>
    </html>
  );
}


const sw = `
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch(error => {
            console.error('Service Worker registration failed:', error);
        });
    });
}
`;