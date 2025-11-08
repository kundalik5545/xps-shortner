"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, MousePointerClick, Monitor, Smartphone, Tablet, Globe } from "lucide-react";
import { getBaseUrl } from "@/lib/utils/url";
import { formatDistanceToNow } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  totalClicks: number;
  uniqueIPs: number;
  deviceStats: Record<string, number>;
  browserStats: Record<string, number>;
  timeSeries: Record<string, number>;
  clicks: Array<{
    id: string;
    timestamp: string;
    ipAddress: string | null;
    userAgent: string | null;
    referer: string | null;
    device: string | null;
    browser: string | null;
  }>;
}

interface LinkData {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [link, setLink] = useState<LinkData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLink();
      fetchAnalytics();
    }
  }, [id]);

  const fetchLink = async () => {
    try {
      const response = await fetch(`/api/links/${id}`, {
        credentials: "include",
      });
      if (response.status === 401) {
        router.push("/sign-in");
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch link");
      }
      const data = await response.json();
      setLink(data);
    } catch (error) {
      toast.error("Failed to fetch link");
      router.push("/links");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/links/${id}/analytics`, {
        credentials: "include",
      });
      if (response.status === 401) {
        router.push("/sign-in");
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      toast.error("Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const baseUrl = getBaseUrl();

  // Prepare data for charts
  const timeSeriesData = analytics
    ? Object.entries(analytics.timeSeries)
        .map(([date, clicks]) => ({ date, clicks }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const deviceData = analytics
    ? Object.entries(analytics.deviceStats).map(([name, value]) => ({ name, value }))
    : [];

  const browserData = analytics
    ? Object.entries(analytics.browserStats).map(([name, value]) => ({ name, value }))
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!link || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Link not found</p>
            <Link href="/links">
              <Button className="mt-4">Back to Links</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Header */}
        <div className="mb-8">
          <Link href="/links">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Links
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Link Analytics</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <a
                  href={`${baseUrl}/${link.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {baseUrl}/{link.shortCode}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span>•</span>
                <span>Created {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 truncate max-w-2xl" title={link.originalUrl}>
                {link.originalUrl}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalClicks}</div>
              <p className="text-xs text-muted-foreground">All-time clicks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.uniqueIPs}</div>
              <p className="text-xs text-muted-foreground">Based on IP addresses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Link Age</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDistanceToNow(new Date(link.createdAt), { addSuffix: false })}
              </div>
              <p className="text-xs text-muted-foreground">Since creation</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Time Series Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Clicks Over Time</CardTitle>
              <CardDescription>Daily click distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="clicks" stroke="#0088FE" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Device Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Device Distribution</CardTitle>
              <CardDescription>Clicks by device type</CardDescription>
            </CardHeader>
            <CardContent>
              {deviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Browser Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Browser Distribution</CardTitle>
            <CardDescription>Clicks by browser</CardDescription>
          </CardHeader>
          <CardContent>
            {browserData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={browserData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Clicks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Clicks</CardTitle>
            <CardDescription>Last 100 clicks on this link</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.clicks.length > 0 ? (
              <div className="space-y-4">
                {analytics.clicks.slice(0, 20).map((click) => (
                  <div
                    key={click.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">
                          {formatDistanceToNow(new Date(click.timestamp), { addSuffix: true })}
                        </span>
                        {click.device && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{click.device}</span>
                          </>
                        )}
                        {click.browser && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{click.browser}</span>
                          </>
                        )}
                      </div>
                      {click.referer && (
                        <p className="text-xs text-muted-foreground mt-1 truncate" title={click.referer}>
                          From: {click.referer}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {analytics.clicks.length > 20 && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Showing 20 of {analytics.clicks.length} clicks
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No clicks yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

