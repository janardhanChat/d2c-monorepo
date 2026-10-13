"use client";

import { Badge, Button, Container } from "@ap/ui";
import Link from "next/link";
import { useState } from "react";

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-border/70 bg-bg/80 sticky top-0 z-50 border-b backdrop-blur-xl transition-all">
      <Container size="xl">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="from-primary to-accent shadow-primary/20 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr shadow-md transition-transform group-hover:scale-105">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-fg group-hover:text-primary font-bold tracking-tight transition-colors">
                  D2C Business OS
                </span>
                <Badge tone="brand" className="hidden px-1.5 py-0 text-[10px] sm:inline-flex">
                  v1.0
                </Badge>
              </div>
              <span className="text-muted hidden text-[11px] md:inline">
                Autonomous Commerce & Social
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="text-muted hidden items-center gap-7 text-sm font-medium lg:flex">
            <a href="#features" className="hover:text-fg transition-colors">
              Features
            </a>
            <a href="#products" className="hover:text-fg transition-colors">
              Pillars
            </a>
            <a href="#simulator" className="hover:text-fg transition-colors">
              Interactive Sandbox
            </a>
            <a href="#architecture" className="hover:text-fg transition-colors">
              Architecture
            </a>
            <a href="#pricing" className="hover:text-fg transition-colors">
              Plans
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign in
              </Button>
            </Link>
            <Link href="/demo/demo-brand">
              <Button variant="glow" size="sm">
                Live Demo
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="text-muted hover:text-fg border-border bg-surface-2 rounded-lg border p-1.5 lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-border/60 bg-surface/95 space-y-2 border-t px-2 py-4 backdrop-blur-xl lg:hidden">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted hover:bg-surface-2 hover:text-fg block rounded-lg px-3 py-2 text-sm"
            >
              Features
            </a>
            <a
              href="#products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted hover:bg-surface-2 hover:text-fg block rounded-lg px-3 py-2 text-sm"
            >
              Pillars
            </a>
            <a
              href="#simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted hover:bg-surface-2 hover:text-fg block rounded-lg px-3 py-2 text-sm"
            >
              Interactive Sandbox
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted hover:bg-surface-2 hover:text-fg block rounded-lg px-3 py-2 text-sm"
            >
              Architecture
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted hover:bg-surface-2 hover:text-fg block rounded-lg px-3 py-2 text-sm"
            >
              Plans
            </a>
            <div className="border-border flex gap-2 border-t pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link href="/demo/demo-brand" className="flex-1">
                <Button variant="primary" size="sm" className="w-full">
                  Demo
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
