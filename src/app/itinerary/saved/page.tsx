
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, Timestamp } from "firebase/firestore";
import type { Itinerary } from "@/types/itinerary";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Eye, Calendar, Users, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Helper function to format Firestore Timestamps
const formatDate = (timestamp: Timestamp | Date | undefined): string => {
  if (!timestamp) return 'N/A';
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return date.toLocaleDateString();
};


export default function SavedItinerariesPage() {
  const { user, loading: authLoading } = useAuth();
  const [itineraries, setItineraries] = React.useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    // Redirect if user is not logged in and auth is no longer loading
    if (!authLoading && !user) {
       toast({
         title: "Authentication Required",
         description: "Please sign in to view your saved itineraries.",
         variant: "destructive",
       });
      router.push("/auth/signin");
      return; // Stop further execution in this effect
    }

    if (user) {
      const fetchItineraries = async () => {
        setIsLoading(true);
        try {
          const q = query(
            collection(db, "itineraries"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc") // Show newest first
          );
          const querySnapshot = await getDocs(q);
          const fetchedItineraries: Itinerary[] = [];
          querySnapshot.forEach((doc) => {
            fetchedItineraries.push({ id: doc.id, ...doc.data() } as Itinerary);
          });
          setItineraries(fetchedItineraries);
        } catch (error) {
          console.error("Error fetching itineraries:", error);
          toast({
            title: "Error Fetching Trips",
            description: "Could not load your saved itineraries. Please try again later.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchItineraries();
    } else if (!authLoading) {
        // If auth is done loading and there's still no user
        setIsLoading(false);
    }
  }, [user, authLoading, router, toast]);

   const handleDelete = async (itineraryId: string) => {
    setDeletingId(itineraryId);
    try {
      await deleteDoc(doc(db, "itineraries", itineraryId));
      setItineraries((prev) => prev.filter((it) => it.id !== itineraryId));
      toast({
        title: "Itinerary Deleted",
        description: "Your trip has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting itinerary:", error);
      toast({
        title: "Deletion Failed",
        description: "Could not delete the itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
        setDeletingId(null);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <span className="ml-2 text-muted-foreground">Loading your trips...</span>
      </div>
    );
  }

   // If user is definitely not logged in (and auth is done loading), show message
  if (!user) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <p className="text-lg text-muted-foreground mb-4">Please sign in to view your saved itineraries.</p>
            <Link href="/auth/signin" passHref legacyBehavior>
                <Button>Sign In</Button>
            </Link>
        </div>
    );
  }


  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Saved Itineraries</h1>
          <Link href="/itinerary/new" passHref legacyBehavior>
             <Button>Create New</Button>
          </Link>
      </div>


      {itineraries.length === 0 ? (
        <Card className="text-center py-12">
           <CardHeader>
                <CardTitle>No Trips Yet!</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-muted-foreground mb-4">You haven't saved any itineraries. Start planning your next adventure!</p>
              <Link href="/itinerary/new" passHref legacyBehavior>
                 <Button>Create Your First Itinerary</Button>
             </Link>
           </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((itinerary) => (
            <Card key={itinerary.id} className="flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="truncate">{itinerary.title || "Untitled Trip"}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3"/> {itinerary.destination}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
                 <p className="flex items-center gap-1.5"><Calendar className="h-4 w-4"/> Dates: {itinerary.travelDates} ({itinerary.tripLength} days)</p>
                 <p className="flex items-center gap-1.5"><Users className="h-4 w-4"/> Group: {itinerary.groupSize} ({itinerary.groupType})</p>
                 <p className="truncate"><span className="font-medium text-foreground">Activities:</span> {itinerary.activityPreferences}</p>
                 <p className="text-xs mt-2">Created: {formatDate(itinerary.createdAt)}</p>

              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Link href={`/itinerary/${itinerary.id}`} passHref legacyBehavior>
                  <Button variant="outline" size="sm">
                     <Eye className="mr-1 h-4 w-4" /> View Details
                  </Button>
                </Link>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={deletingId === itinerary.id}>
                      {deletingId === itinerary.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                     {/* <span className="ml-1 hidden sm:inline">Delete</span> */}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the itinerary titled "{itinerary.title || 'Untitled Trip'}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(itinerary.id!)}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={deletingId === itinerary.id}
                      >
                        {deletingId === itinerary.id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
