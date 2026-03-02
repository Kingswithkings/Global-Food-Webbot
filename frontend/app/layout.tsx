import "./globals.css";

export const metadata = {
  title: "Global Food Market Doncaster — Chat Order",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}