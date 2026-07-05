"use client";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Users, Eye, Clock, Activity, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track your storefront performance and visitor traffic in real-time.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/40 backdrop-blur-sm border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Live Visitors
              <Activity className="h-4 w-4 text-green-500 animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-foreground">Tracked</div>
            <p className="text-xs text-muted-foreground mt-1">via Vercel Analytics</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-sm border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total Page Views
              <Eye className="h-4 w-4 text-dustyRose" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-foreground">Live</div>
            <p className="text-xs text-muted-foreground mt-1">See dashboard</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-sm border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Unique Visitors
              <Users className="h-4 w-4 text-goldBeige" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-foreground">Live</div>
            <p className="text-xs text-muted-foreground mt-1">See dashboard</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-sm border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Avg Session Time
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-foreground">Live</div>
            <p className="text-xs text-muted-foreground mt-1">See dashboard</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-md border-border/60 border shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-[var(--gradient-spotlight)] pointer-events-none opacity-50" />
        <CardHeader>
          <CardTitle className="text-xl font-display flex items-center gap-2">
            <LineChart className="h-5 w-5 text-dustyRose" />
            Vercel Web Analytics
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed max-w-2xl">
            Real-time traffic, page views, and visitor demographics are automatically tracked using Vercel Analytics. 
            Because Vercel protects this data securely, it can only be viewed from your Vercel Project Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="bg-background/50 rounded-xl p-5 border border-border/60">
            <h3 className="font-medium text-sm text-foreground mb-3 uppercase tracking-wider">How to view your traffic</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Click the button below to open your Vercel Dashboard.</li>
              <li>Log in with your GitHub or Vercel account.</li>
              <li>Click on the <strong>Analytics</strong> tab.</li>
              <li>View your live visitors, top pages, and referrers!</li>
            </ol>
          </div>
          
          <div className="flex gap-4">
            <Button asChild className="rounded-full bg-[var(--gradient-rose)] text-white hover:opacity-90 transition-opacity border-none shadow-md">
              <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
                Open Vercel Dashboard <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            
            <Button variant="outline" asChild className="rounded-full bg-card/40 backdrop-blur-sm border-border/60 hover:bg-secondary transition-colors">
              <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">
                Open Google Analytics <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
