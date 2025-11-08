"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Copy, Check, ExternalLink, QrCode, Trash2, Search } from "lucide-react";
import { getBaseUrl } from "@/lib/utils/url";
import { formatDistanceToNow } from "date-fns";
import { QRCodeModal } from "@/components/QRCodeModal";

interface LinkData {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  _count: {
    clicks: number;
  };
}

export default function LinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<LinkData[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<LinkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkData | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLinks(links);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredLinks(
        links.filter(
          (link) =>
            link.originalUrl.toLowerCase().includes(query) ||
            link.shortCode.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, links]);

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
      setFilteredLinks(data);
    } catch (error) {
      toast.error("Failed to fetch links");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (shortCode: string, id: string) => {
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/${shortCode}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) {
      return;
    }

    try {
      const response = await fetch(`/api/links/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete link");
      }

      toast.success("Link deleted successfully");
      fetchLinks();
    } catch (error) {
      toast.error("Failed to delete link");
    }
  };

  const handleOpenQR = (link: LinkData) => {
    const baseUrl = getBaseUrl();
    setSelectedLink({
      ...link,
      originalUrl: `${baseUrl}/${link.shortCode}`,
    });
    setQrModalOpen(true);
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
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Links</h1>
          <p className="text-muted-foreground">Manage all your shortened links</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search links by URL or short code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Links Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Links</CardTitle>
            <CardDescription>
              {filteredLinks.length} {filteredLinks.length === 1 ? "link" : "links"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredLinks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No links found matching your search." : "No links yet. Create your first one!"}
                </p>
                {!searchQuery && (
                  <Link href="/">
                    <Button>Create Link</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Short URL</TableHead>
                      <TableHead>Original URL</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <a
                              href={`${baseUrl}/${link.shortCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {baseUrl}/{link.shortCode}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={link.originalUrl}>
                          {link.originalUrl}
                        </TableCell>
                        <TableCell>{link._count.clicks}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopy(link.shortCode, link.id)}
                              title="Copy URL"
                            >
                              {copiedId === link.id ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenQR(link)}
                              title="Show QR Code"
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Link href={`/links/${link.id}`}>
                              <Button variant="ghost" size="sm">
                                Analytics
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(link.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedLink && (
        <QRCodeModal
          open={qrModalOpen}
          onOpenChange={setQrModalOpen}
          url={`${baseUrl}/${selectedLink.shortCode}`}
          shortCode={selectedLink.shortCode}
        />
      )}
    </div>
  );
}

