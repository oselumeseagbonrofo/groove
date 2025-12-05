import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from './components';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Groove - Vinyl Spotify Player",
  description: "Experience your music collection with a nostalgic vinyl record player interface",
  icons: {
    icon: '/groove.png',
  },
};

/**
 * RootLayout - Main application layout with providers
 * Requirements: 7.2, 7.5
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://sdk.scdn.co/spotify-player.js" async></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
