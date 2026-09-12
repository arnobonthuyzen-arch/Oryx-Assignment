import { Space_Grotesk, Poppins } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Salt Within Reach — Oryx Desert Salt",
  description:
    "You just tapped a grinder that travelled 15 000 km from a salt pan in the middle of nowhere. Here is the rest of the story.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
