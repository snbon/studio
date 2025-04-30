
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Plane, PlusCircle, List } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center space-y-8 py-12 md:py-20">
      <Plane className="h-16 w-16 text-primary" />
      <h1 className="text-4xl font-bold tracking-tight text-center md:text-5xl">
        Welcome to WanderWise
      </h1>
      <p className="text-lg text-muted-foreground text-center max-w-2xl">
        Your personal AI travel assistant. Describe your dream trip, and let WanderWise craft the perfect itinerary for you. Save, share, and explore with ease.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Create New Itinerary
            </CardTitle>
            <CardDescription>
              Tell us about your trip details and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Specify your destination, dates, group size, activity interests, and let our AI generate a detailed plan.</p>
          </CardContent>
          <CardFooter>
            <Link href="/itinerary/new" passHref legacyBehavior>
              <Button className="w-full">
                Start Planning
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5 text-primary" />
              View Saved Itineraries
            </CardTitle>
            <CardDescription>
              Access your previously created and saved trips.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Review, edit, or share your personalized travel plans anytime.</p>
          </CardContent>
          <CardFooter>
             <Link href="/itinerary/saved" passHref legacyBehavior>
              <Button variant="outline" className="w-full">
                My Trips
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
        <p className="text-sm text-muted-foreground text-center">
        Sign up or log in to save your itineraries.
      </p>
    </div>
  );
}
