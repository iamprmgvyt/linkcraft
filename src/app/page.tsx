import UrlShortener from "@/components/url-shortener";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Edit3, Link2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <section className="w-full max-w-4xl text-center py-20 md:py-32">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent pb-4">
          Shorten, Share, and Track
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mb-8">
          LinkCraft is the simplest way to create clean, memorable links.
          Perfect for social media, marketing campaigns, and more.
        </p>
        <UrlShortener />
      </section>

      <section className="w-full max-w-5xl py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <FeatureCard
            icon={<Link2 className="h-10 w-10 text-primary" />}
            title="Powerful Shortening"
            description="Create short, unique links from any URL. Add custom aliases to make your links stand out."
          />
          <FeatureCard
            icon={<BarChart2 className="h-10 w-10 text-primary" />}
            title="Simple Analytics"
            description="Track every click and measure your link's performance with our straightforward analytics."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string; }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm transform hover:scale-105 transition-transform duration-300">
      <CardHeader className="items-center">
        {icon}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
