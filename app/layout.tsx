// e-connecto/frontend/app/layout.tsx
import "./globals.css"; // keep your original global CSS import
import { AuthProvider } from "../lib/auth";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "e-connecto",
  description: "E-Cycle frontend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
