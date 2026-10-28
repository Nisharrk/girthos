import { sans, display } from "./fonts";
import "./globals.css";
import { THEME_STYLE } from "@/lib/theme.mjs";

export const metadata = {
  title: "girthos",
  description: "Track your girth",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={THEME_STYLE}
        className={`${sans.variable} ${display.variable} font-sans antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
