"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Check, ExternalLink } from "lucide-react";
import { getBaseUrl } from "@/lib/utils/url";

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    authClient.getSession().then((session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ url }),
      });

      if (response.status === 401) {
        toast.error("Please sign in to shorten URLs");
        router.push("/sign-in");
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to shorten URL");
        return;
      }

      const data = await response.json();
      const baseUrl = getBaseUrl();
      const fullShortUrl = `${baseUrl}/${data.shortCode}`;
      setShortUrl(fullShortUrl);
      setUrl("");
      toast.success("URL shortened successfully!");
    } catch (error) {
      toast.error("Failed to shorten URL");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;

    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            URL Shortener
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await authClient.signOut();
                    setIsAuthenticated(false);
                    router.push("/");
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Shorten Your Links
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Create short, memorable links and track their performance with detailed analytics
          </p>
        </div>

        {/* URL Shortener Card */}
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Paste your long URL</CardTitle>
            <CardDescription>Enter a URL to shorten it instantly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-2">
              <Input
                type="url"
                placeholder="https://example.com/very/long/url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "Shortening..." : "Shorten"}
              </Button>
            </form>

            {shortUrl && (
              <div className="mt-4 p-4 bg-muted rounded-lg flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">Shortened URL:</p>
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all flex items-center gap-2"
                  >
                    {shortUrl}
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                  </a>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fast & Simple</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Shorten your URLs in seconds with our simple interface
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track clicks, devices, browsers, and more with detailed analytics
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate QR codes for your shortened links instantly
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
