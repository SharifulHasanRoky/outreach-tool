import "./globals.css";

export const metadata = {
  title: "AI Outreach Tool - Dashboard",
  description: "AI-powered client acquisition system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
