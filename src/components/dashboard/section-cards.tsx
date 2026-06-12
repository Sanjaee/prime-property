"use client"

import * as React from "react"
import { IconTrendingDown, IconTrendingUp, IconLoader } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/dashboard/visitors");
        const json = await res.json();
        if (json.status === "success") {
          // Calculate stats from the generated data
          // We assume the data is sorted by date descending (from today backwards) 
          // or we can sort it just in case.
          const visitors = json.data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          // Last 30 days
          const current30 = visitors.slice(0, 30);
          // Previous 30 days
          const previous30 = visitors.slice(30, 60);

          const currentTotal = current30.reduce((acc: number, val: any) => acc + val.desktop + val.mobile, 0);
          const currentDesktop = current30.reduce((acc: number, val: any) => acc + val.desktop, 0);
          const currentMobile = current30.reduce((acc: number, val: any) => acc + val.mobile, 0);

          const previousTotal = previous30.reduce((acc: number, val: any) => acc + val.desktop + val.mobile, 0);
          
          let growthRate = 0;
          if (previousTotal > 0) {
            growthRate = ((currentTotal - previousTotal) / previousTotal) * 100;
          }

          setData({
            total: currentTotal,
            desktop: currentDesktop,
            mobile: currentMobile,
            growth: growthRate.toFixed(1)
          });
        }
      } catch (error) {
        console.error("Failed to fetch visitors data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-32 w-full">
        <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isGrowthPositive = Number(data.growth) >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Visitors</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.total.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={isGrowthPositive ? "text-emerald-500" : "text-rose-500"}>
              {isGrowthPositive ? <IconTrendingUp className="mr-1 size-3" /> : <IconTrendingDown className="mr-1 size-3" />}
              {isGrowthPositive ? "+" : ""}{data.growth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Total visitors for the last 30 days
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Desktop Visitors</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.desktop.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {Math.round((data.desktop / data.total) * 100)}% of total traffic
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Mobile Visitors</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.mobile.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {Math.round((data.mobile / data.total) * 100)}% of total traffic
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isGrowthPositive ? "+" : ""}{data.growth}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={isGrowthPositive ? "text-emerald-500" : "text-rose-500"}>
              {isGrowthPositive ? <IconTrendingUp className="mr-1 size-3" /> : <IconTrendingDown className="mr-1 size-3" />}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Compared to previous 30 days
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
