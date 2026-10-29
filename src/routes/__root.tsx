import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { StoreProvider } from "@/components/store";
import appCss from "../styles.css?url";

const THEME_BOOT = `try{if(localStorage.getItem("tsikst-theme")==="light")document.documentElement.classList.add("light")}catch(e){}`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Т-СИКС-Т Помічник" },
      {
        name: "description",
        content: "Оцінка об'єкта, прайс і три ціни для підрядника. Київ і область.",
      },
      { name: "theme-color", content: "#13150f" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <StoreProvider>
            <Outlet />
          </StoreProvider>
        </AuthProvider>
        <Analytics />
        <Scripts />
      </body>
    </html>
  ),
});
