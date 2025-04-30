
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import type { Itinerary } from "@/types/itinerary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Share2, Calendar, Users, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
// Optionally add a summary generation button/display
// import { summarizeItinerary } from "@/ai/flows/summarize-itinerary";
// import { Badge } from "@/components/ui/badge";

// Helper function to format Firestore Timestamps
const formatDate = (timestamp: Timestamp | Date | undefined): string => {
  if (!timestamp) return 'N/A';
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return date.toLocaleDateString();
};

export default function ItineraryDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [itinerary, setItinerary] = React.useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  // const [isSummarizing, setIsSummarizing] = React.useState(false);
  // const [summary, setSummary] = React.useState<string | null>(null);

  const itineraryId = params?.id as string | undefined;

  React.useEffect(() => {
    if (authLoading) return; // Wait for auth check

    if (!user) {
       toast({
         title: "Authentication Required",
         description: "Please sign in to view this itinerary.",
         variant: "destructive",
       });
      router.push("/auth/signin");
      return;
    }

    if (!itineraryId) {
        toast({ title: "Error", description: "Itinerary ID not found.", variant: "destructive" });
        router.push("/itinerary/saved"); // Redirect if no ID
        return;
    }

    const fetchItinerary = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, "itineraries", itineraryId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Itinerary;
          // Security Check: Ensure the logged-in user owns this itinerary
          if (data.userId !== user.uid) {
             toast({ title: "Access Denied", description: "You do not have permission to view this itinerary.", variant: "destructive" });
             router.push("/itinerary/saved");
             return;
          }
          setItinerary({ id: docSnap.id, ...data });
          // setSummary(data.summary || null); // Load existing summary if present
        } else {
          toast({ title: "Not Found", description: "This itinerary does not exist.", variant: "destructive" });
          router.push("/itinerary/saved");
        }
      } catch (error) {
        console.error("Error fetching itinerary:", error);
        toast({
          title: "Error",
          description: "Could not load the itinerary details.",
          variant: "destructive",
        });
         router.push("/itinerary/saved");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItinerary();
  }, [itineraryId, user, authLoading, router, toast]);

   const handleShare = () => {
    if (!itinerary) return;
    const shareUrl = window.location.href; // Simple URL share
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link Copied!",
        description: "Itinerary URL copied to clipboard.",
      });
    }).catch(err => {
       toast({
        title: "Copy Failed",
        description: "Could not copy URL.",
        variant: "destructive",
      });
      console.error('Failed to copy URL: ', err);
    });
     // Add more advanced sharing options later if needed (e.g., specific share APIs)
  };

  // Optional: Summary Generation Functionality
  // const handleGenerateSummary = async () => {
  //   if (!itinerary || !itinerary.itinerary) return;
  //   setIsSummarizing(true);
  //   try {
  //     const result = await summarizeItinerary({ itinerary: itinerary.itinerary });
  //     if (result.summary) {
  //       setSummary(result.summary);
  //       // Optional: Update the summary in Firestore
  //       // const docRef = doc(db, "itineraries", itinerary.id!);
  //       // await updateDoc(docRef, { summary: result.summary, updatedAt: serverTimestamp() });
  //       toast({ title: "Summary Generated!", description: "A brief overview is now available." });
  //     } else {
  //       throw new Error("AI did not return a summary.");
  //     }
  //   } catch (error: any) {
  //     console.error("Error generating summary:", error);
  //     toast({ title: "Summary Failed", description: error.message || "Could not generate summary.", variant: "destructive" });
  //   } finally {
  //     setIsSummarizing(false);
  //   }
  // };


  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <span className="ml-2 text-muted-foreground">Loading itinerary details...</span>
      </div>
    );
  }

  if (!itinerary) {
    // This case should ideally be handled by the redirects in useEffect,
    // but it's good practice to have a fallback.
    return (
       <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <p className="text-lg text-muted-foreground mb-4">Itinerary not found or access denied.</p>
          <Link href="/itinerary/saved" passHref legacyBehavior>
              <Button variant="outline">Back to My Trips</Button>
          </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
       <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">{itinerary.title}</CardTitle>
           <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
               <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {itinerary.destination}</span>
               <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4"/> {itinerary.travelDates} ({itinerary.tripLength} days)</span>
               <span className="flex items-center gap-1.5"><Users className="h-4 w-4"/> {itinerary.groupSize} ({itinerary.groupType})</span>
           </div>
            <CardDescription className="pt-2">
             Created on {formatDate(itinerary.createdAt)}
           </CardDescription>
        </CardHeader>

        {/* Optional Summary Section */}
        {/* {summary && (
          <CardContent className="border-t pt-4">
            <h3 className="font-semibold mb-2 text-lg flex items-center gap-2">
                <Badge variant="secondary">AI</Badge> Summary
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
          </CardContent>
        )} */}

        <CardContent className="border-t pt-6">
           <h3 className="font-semibold mb-3 text-xl">Detailed Itinerary</h3>
           <div className="prose max-w-none dark:prose-invert whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-md">
             {/* Use whitespace-pre-wrap to respect newlines from AI */}
             {itinerary.itinerary}
           </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-4">
           {/* Optional Summary Button */}
           {/* {!summary && (
              <Button variant="outline" onClick={handleGenerateSummary} disabled={isSummarizing}>
               {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
               Generate Summary
             </Button>
           )} */}
           {/* Spacer if summary button exists and is shown */}
           {/* {summary && <div className="hidden sm:block sm:flex-1"></div>}  */}

           {/* Always show share button */}
           <div className="flex-1"></div> {/* Pushes share button right when no summary button */}

           <Button variant="secondary" onClick={handleShare}>
             <Share2 className="mr-2 h-4 w-4" /> Share
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
