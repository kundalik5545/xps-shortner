"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ExternalLink, Plus, TrendingUp, Link2, MousePointerClick } from "lucide-react";
import { getBaseUrl } from "@/lib/utils/url";
import { formatDistanceToNow } from "date-fns";

interface LinkData {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  _count: {
    clicks: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [links, setLinks] = useState<LinkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/links", {
        credentials: "include",
      });
      if (response.status === 401) {
        router.push("/sign-in");
        return;
      }
      const data = await response.json();
      setLinks(data);
      
      const totalClicks = data.reduce((sum: number, link: LinkData) => sum + link._count.clicks, 0);
      setStats({
        totalLinks: data.length,
        totalClicks,
      });
    } catch (error) {
      toast.error("Failed to fetch links");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const baseUrl = getBaseUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            URL Shortener
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/links">
              <Button variant="ghost">My Links</Button>
            </Link>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your shortened links</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Links</CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLinks}</div>
              <p className="text-xs text-muted-foreground">Links you've created</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks}</div>
              <p className="text-xs text-muted-foreground">All-time clicks</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Links */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Links</CardTitle>
                <CardDescription>Your most recently created shortened links</CardDescription>
              </div>
              <Link href="/">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : links.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No links yet. Create your first one!</p>
                <Link href="/">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Link
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Short URL</TableHead>
                    <TableHead>Original URL</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.slice(0, 10).map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <a
                          href={`${baseUrl}/${link.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          {baseUrl}/{link.shortCode}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {link.originalUrl}
                      </TableCell>
                      <TableCell>{link._count.clicks}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Link href={`/links/${link.id}`}>
                          <Button variant="ghost" size="sm">
                            View Analytics
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

