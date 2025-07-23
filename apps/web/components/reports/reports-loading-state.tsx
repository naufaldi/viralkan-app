import { Card, CardContent } from "@repo/ui/components/ui/card";

export function ReportsLoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="overflow-hidden animate-pulse">
          <div className="aspect-[4/3] bg-muted" />
          <CardContent className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 