
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateItinerary } from "@/ai/flows/generate-itinerary";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ItineraryInput, Itinerary } from "@/types/itinerary";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  destination: z.string().min(2, { message: "Destination must be at least 2 characters." }),
  travelDates: z.string().min(5, { message: "Please provide travel dates (e.g., 'July 10-17, 2024')." }),
  groupSize: z.coerce.number().int().positive({ message: "Group size must be a positive number." }),
  activityPreferences: z.string().min(10, { message: "Describe your preferred activities (at least 10 characters)." }),
  groupType: z.enum(['family', 'friends', 'colleagues', 'solo', 'couple', 'other'], { required_error: "Please select a group type." }),
  tripLength: z.coerce.number().int().positive({ message: "Trip length must be a positive number of days." }),
  title: z.string().min(3, { message: "Please provide a title for your trip (e.g., 'Paris Summer Trip')." })
});

type FormData = z.infer<typeof formSchema>;

export default function NewItineraryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedItineraryContent, setGeneratedItineraryContent] = React.useState<string | null>(null);
   const [formDataUsed, setFormDataUsed] = React.useState<FormData | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset, // Add reset function
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        groupSize: 1,
        tripLength: 1,
        groupType: undefined, // Ensure select has no initial default shown in trigger
    }
  });

  React.useEffect(() => {
    // Redirect if user is not logged in and auth is no longer loading
    if (!authLoading && !user) {
       toast({
         title: "Authentication Required",
         description: "Please sign in to create an itinerary.",
         variant: "destructive",
       });
      router.push("/auth/signin");
    }
  }, [user, authLoading, router, toast]);

  const handleGenerateItinerary = async (data: FormData) => {
    if (!user) {
      toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setGeneratedItineraryContent(null); // Clear previous results
    setFormDataUsed(data); // Store form data used for generation

    const input: ItineraryInput = {
      destination: data.destination,
      travelDates: data.travelDates,
      groupSize: data.groupSize,
      activityPreferences: data.activityPreferences,
      groupType: data.groupType,
      tripLength: data.tripLength,
    };

    try {
      console.log("Generating itinerary with input:", input);
      const result = await generateItinerary(input);
      console.log("AI Result:", result);
      if (result?.itinerary) {
         setGeneratedItineraryContent(result.itinerary);
         toast({
            title: "Itinerary Generated!",
            description: "Review the itinerary below and save it if you like.",
         });
      } else {
         throw new Error("AI did not return a valid itinerary.");
      }

    } catch (error: any) {
      console.error("Error generating itinerary:", error);
      toast({
        title: "Generation Failed",
        description: `Could not generate itinerary: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
       setFormDataUsed(null); // Clear stored data on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveItinerary = async () => {
     if (!user || !generatedItineraryContent || !formDataUsed) {
       toast({ title: "Error", description: "Cannot save itinerary. Missing data or user not logged in.", variant: "destructive" });
       return;
     }
     setIsLoading(true);
     try {
        const newItinerary: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'> = {
          ...formDataUsed,
          itinerary: generatedItineraryContent,
          userId: user.uid,
          // title is already in formDataUsed
          // Optional: Add summary generation here if implemented
        };

       const docRef = await addDoc(collection(db, "itineraries"), {
         ...newItinerary,
         createdAt: serverTimestamp(),
         updatedAt: serverTimestamp(),
       });

       toast({
         title: "Itinerary Saved!",
         description: `Your trip "${formDataUsed.title}" has been saved successfully.`,
       });
       // Optionally redirect to the saved itinerary page or the list
       router.push(`/itinerary/saved`);
       reset(); // Reset form fields
       setGeneratedItineraryContent(null); // Clear generated content
       setFormDataUsed(null);

     } catch (error: any) {
       console.error("Error saving itinerary:", error);
       toast({
         title: "Save Failed",
         description: `Could not save itinerary: ${error.message || 'Unknown error'}`,
         variant: "destructive",
       });
     } finally {
       setIsLoading(false);
     }
  }

  const handleGenerateNew = () => {
    reset(); // Reset form fields
    setGeneratedItineraryContent(null); // Clear generated content
    setFormDataUsed(null); // Clear stored form data
  }

  // Show loading indicator while auth is checking
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is definitely not logged in (and auth is done loading), show message
  if (!user) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <p className="text-lg text-muted-foreground mb-4">You need to be logged in to create an itinerary.</p>
            <Link href="/auth/signin" passHref legacyBehavior>
                <Button>Sign In</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <h1 className="text-3xl font-bold mb-6">Create New Itinerary</h1>

     {!generatedItineraryContent ? (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>Fill in the details below to generate your personalized itinerary.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleGenerateItinerary)} className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Trip Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  placeholder="e.g., Paris Summer Adventure"
                  {...register("title")}
                  aria-invalid={errors.title ? "true" : "false"}
                />
                {errors.title && <p className="text-sm font-medium text-destructive">{errors.title.message}</p>}
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destination">Destination <span className="text-destructive">*</span></Label>
                <Input
                  id="destination"
                  placeholder="e.g., Paris, France"
                  {...register("destination")}
                  aria-invalid={errors.destination ? "true" : "false"}
                />
                {errors.destination && <p className="text-sm font-medium text-destructive">{errors.destination.message}</p>}
              </div>

              {/* Travel Dates */}
              <div className="space-y-2">
                <Label htmlFor="travelDates">Travel Dates <span className="text-destructive">*</span></Label>
                <Input
                  id="travelDates"
                  placeholder="e.g., July 10 - July 17, 2024"
                  {...register("travelDates")}
                   aria-invalid={errors.travelDates ? "true" : "false"}
                />
                 {errors.travelDates && <p className="text-sm font-medium text-destructive">{errors.travelDates.message}</p>}
              </div>

              {/* Grid for Group Size, Trip Length, Group Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Group Size */}
                <div className="space-y-2">
                  <Label htmlFor="groupSize">Group Size <span className="text-destructive">*</span></Label>
                  <Input
                    id="groupSize"
                    type="number"
                    min="1"
                    placeholder="e.g., 2"
                    {...register("groupSize")}
                    aria-invalid={errors.groupSize ? "true" : "false"}
                  />
                  {errors.groupSize && <p className="text-sm font-medium text-destructive">{errors.groupSize.message}</p>}
                </div>

                 {/* Trip Length */}
                <div className="space-y-2">
                  <Label htmlFor="tripLength">Trip Length (Days) <span className="text-destructive">*</span></Label>
                  <Input
                    id="tripLength"
                    type="number"
                    min="1"
                    placeholder="e.g., 7"
                    {...register("tripLength")}
                     aria-invalid={errors.tripLength ? "true" : "false"}
                  />
                   {errors.tripLength && <p className="text-sm font-medium text-destructive">{errors.tripLength.message}</p>}
                </div>

                {/* Group Type */}
                 <div className="space-y-2">
                    <Label htmlFor="groupType">Group Type <span className="text-destructive">*</span></Label>
                     <Select
                        onValueChange={(value) => control._setValue('groupType', value as any)} // Use control._setValue for shadcn Select with RHF
                        {...register("groupType")} // Still register for validation
                    >
                        <SelectTrigger id="groupType" aria-invalid={errors.groupType ? "true" : "false"}>
                            <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="friends">Friends</SelectItem>
                            <SelectItem value="colleagues">Colleagues</SelectItem>
                            <SelectItem value="solo">Solo</SelectItem>
                            <SelectItem value="couple">Couple</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                     {errors.groupType && <p className="text-sm font-medium text-destructive">{errors.groupType.message}</p>}
                </div>
              </div>


              {/* Activity Preferences */}
              <div className="space-y-2">
                <Label htmlFor="activityPreferences">Activity Preferences <span className="text-destructive">*</span></Label>
                <Textarea
                  id="activityPreferences"
                  placeholder="e.g., Interested in museums, local cuisine, light hiking, relaxing evenings..."
                  {...register("activityPreferences")}
                  rows={4}
                   aria-invalid={errors.activityPreferences ? "true" : "false"}
                />
                 {errors.activityPreferences && <p className="text-sm font-medium text-destructive">{errors.activityPreferences.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate Itinerary"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
         // Display Generated Itinerary
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>{formDataUsed?.title || "Generated Itinerary"}</CardTitle>
              <CardDescription>
                For {formDataUsed?.destination}, {formDataUsed?.travelDates} ({formDataUsed?.tripLength} days, {formDataUsed?.groupSize} people, {formDataUsed?.groupType})
              </CardDescription>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert whitespace-pre-wrap text-sm">
               {/* Use whitespace-pre-wrap to respect newlines from AI */}
               {generatedItineraryContent}
            </CardContent>
             <CardFooter className="flex justify-between gap-4">
                <Button variant="outline" onClick={handleGenerateNew} disabled={isLoading}>
                    Generate New
                </Button>
                <Button onClick={handleSaveItinerary} disabled={isLoading}>
                     {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Itinerary"}
                </Button>
            </CardFooter>
          </Card>
      )}
    </div>
  );
}
