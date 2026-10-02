import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Voice Command Recognition",
  description: "Record a command and see the model predict it",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
