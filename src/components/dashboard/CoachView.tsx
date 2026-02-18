
import {
  Brain,
  Zap,
  Target,
  BarChart,
  Lightbulb,
  ArrowRight,
  TrendingDown,
  ChevronRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  Legend
} from "recharts";
import { motion } from "framer-motion";

interface CoachViewProps {
  handle: string;
  currentRating: number;
}

interface CoachData {
  tagCounts: Record<string, number>;
  weakTags: string[];
  recommendations: any[]; // Replace with specific interface
  aiAdvice: string;
}

export function CoachView({ handle, currentRating }: CoachViewProps) {
  const [data, setData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/codeforces/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, goal: currentRating + 200 }),
      });
      
      const result = await res.json();
      if (result.error) {
        throw new Error(result.error);
      }
      setData(result);
      setAnalyzed(true);
    } catch (err: any) {
      setError(err.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  if (!analyzed) {
    return (
      <Card className="col-span-12 border-dashed border-2 bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">AI Performance Coach</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Analyze your solving history, detect weak topics, and generate a personalized training plan with AI.
            </p>
          </div>
          <Button size="lg" onClick={handleGeneratePlan} disabled={loading} className="mt-4">
            {loading ? (
              <>
                <Zap className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" /> Generate Training Plan
              </>
            )}
          </Button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  // Transform tagCounts for chart
  const chartData = data?.tagCounts ? Object.entries(data.tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count })) : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 via-background to-background">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" /> Goal Rating
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-indigo-500">{currentRating + 200}</div>
                <p className="text-xs text-muted-foreground mt-1">Next milestone</p>
            </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500/10 via-background to-background">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" /> Weakest Topic
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-xl font-bold text-red-500 capitalize">{data?.weakTags[0] || "None"}</div>
                <p className="text-xs text-muted-foreground mt-1">Focus area</p>
            </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 via-background to-background">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" /> Recommended
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-emerald-500">{data?.recommendations.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Problems identified</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main AI Advice Section */}
        <Card className="lg:col-span-2 border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" /> 
                    AI Coach Analysis
                </CardTitle>
                <CardDescription> personalized strategy based on your recent performance</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {data?.aiAdvice}
                </div>
            </CardContent>
        </Card>

        {/* Problem Recommendations List */}
        <Card className="lg:col-span-1 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-500" />
                Training Set
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
             <ScrollArea className="h-[300px] pr-4">
                 <div className="space-y-3">
                    {data?.recommendations.map((prob, i) => (
                        <a 
                            key={i} 
                            href={`https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group"
                        >
                            <div className="p-3 rounded-lg border bg-card hover:bg-accent hover:border-accent-foreground/50 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                                        {prob.index}. {prob.name}
                                    </span>
                                    <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                                        {prob.rating}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {prob.tags.slice(0, 3).map((t: string) => (
                                        <span key={t} className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </a>
                    ))}
                 </div>
             </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-muted-foreground" />
                  Skill Distribution (Solved)
              </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                        <XAxis type="number" hide />
                        <YAxis 
                            dataKey="tag" 
                            type="category" 
                            width={100} 
                            tick={{ fontSize: 12, fill: '#888' }} 
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                        />
                        <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20}>
                             {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={data?.weakTags.includes(entry.tag) ? '#ef4444' : '#3b82f6'} />
                             ))}
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
