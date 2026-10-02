"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkStyle = (path: string): React.CSSProperties => ({
    color: pathname === path ? "#fff" : "rgba(255,255,255,0.55)",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: pathname === path ? 600 : 500,
    padding: "0.4rem 0.9rem",
    borderRadius: 999,
    background: pathname === path ? "rgba(44,123,229,0.2)" : "transparent",
    transition: "all 0.15s ease",
  });

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 1.5rem",
        borderBottom: "1px solid #22252c",
        background: "rgba(15,17,21,0.85)",
        backdropFilter: "blur(8px)",
      }}
    >
      <span style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
        🎙️ Voice Command Recognition
      </span>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Link href="/" style={linkStyle("/")}>
          Home
        </Link>
        <Link href="/about" style={linkStyle("/about")}>
          About
        </Link>
      </div>
    </nav>
  );
}
