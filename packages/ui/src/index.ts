// CSS imports (need to be imported where used)
import "./globals.css";

// Legacy components (keep existing exports)
export { Button as LegacyButton } from "./button";
export { Card as LegacyCard } from "./card";
export { Code } from "./code";

// shadcn/ui components
export { Button, buttonVariants } from "./components/ui/button";
export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "./components/ui/card";

// Utilities
export { cn } from "./lib/utils"; 