import { sans, display } from "./fonts";
import "./globals.css";

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
        className={`${sans.variable} ${display.variable} font-sans antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
