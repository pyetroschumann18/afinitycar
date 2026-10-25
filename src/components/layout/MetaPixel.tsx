import Script from "next/script";

export function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!pixelId) return null;

  return (
    // lazyOnload: the ~800 KB Meta bundle loads after the page is interactive, so it
    // never competes with the form. PageView still fires; Lead is also sent server-side (CAPI).
    <Script id="meta-pixel" strategy="lazyOnload">{`
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', ${JSON.stringify(pixelId)});
      fbq('track', 'PageView');
    `}</Script>
  );
}
