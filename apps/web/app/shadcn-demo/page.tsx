"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui/components/ui/card";

export default function ShadcnDemo() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">shadcn/ui Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>
              Different button styles available in our UI library
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default Size</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card Component</CardTitle>
            <CardDescription>
              This is a card component built with shadcn/ui and Tailwind CSS v4
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cards are perfect for displaying content in a clean, organized way.
              They support headers, content, and footers.
            </p>
            <Button className="mt-4" variant="outline">
              Learn More
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Success!</CardTitle>
          <CardDescription>
            shadcn/ui has been successfully integrated into your monorepo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✅ Tailwind CSS v4 configured</li>
            <li>✅ shadcn/ui components ready</li>
            <li>✅ Utility functions available</li>
            <li>✅ Monorepo exports configured</li>
          </ul>
          <Button className="w-full mt-4">
            Start Building
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 