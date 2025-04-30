
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Home, PlusCircle, List, LogIn, Plane } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push('/auth/signin'); // Redirect to sign-in page after logout
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign Out Error",
        description: "Could not sign you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "?";
    const parts = email.split('@')[0].split('.');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return email[0].toUpperCase();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" collapsible="icon" variant="inset">
        <SidebarHeader className="items-center justify-between">
           <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-primary hover:text-primary/90 group-data-[collapsible=icon]:hidden">
            <Plane className="h-6 w-6 " />
            <span>WanderWise</span>
          </Link>
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
             {/* Show trigger only when sidebar is visible and collapsed */}
            <SidebarTrigger className="group-data-[state=expanded]:hidden" />
          </div>
           <Link href="/" className="flex items-center justify-center gap-2 font-semibold text-lg text-primary hover:text-primary/90 group-data-[state=expanded]:hidden">
              <Plane className="h-6 w-6" />
          </Link>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/" legacyBehavior passHref>
                <SidebarMenuButton tooltip="Home">
                  <Home />
                  <span>Home</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             {user && (
                <>
                  <SidebarMenuItem>
                    <Link href="/itinerary/new" legacyBehavior passHref>
                      <SidebarMenuButton tooltip="New Itinerary">
                        <PlusCircle />
                        <span>New Itinerary</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/itinerary/saved" legacyBehavior passHref>
                      <SidebarMenuButton tooltip="My Itineraries">
                        <List />
                        <span>My Itineraries</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </>
              )}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-2 border-t border-sidebar-border">
           {!loading && (
             user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="justify-start gap-2 w-full px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:w-8">
                        <Avatar className="h-8 w-8">
                            {/* Add AvatarImage if you store user profile pics */}
                            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate group-data-[collapsible=icon]:hidden">{user.email || "User"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start">
                    <DropdownMenuLabel>{user.email || "My Account"}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem> */}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
             ) : (
                 <Link href="/auth/signin" legacyBehavior passHref>
                   <SidebarMenuButton tooltip="Sign In / Sign Up">
                      <LogIn />
                      <span className="group-data-[collapsible=icon]:hidden">Sign In / Sign Up</span>
                   </SidebarMenuButton>
                 </Link>
             )
           )}
           {loading && (
             <div className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:w-8">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24 group-data-[collapsible=icon]:hidden" />
             </div>
           )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          {/* Mobile Header */}
          <SidebarTrigger />
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-primary hover:text-primary/90">
             <Plane className="h-6 w-6" />
             <span>WanderWise</span>
           </Link>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
         <footer className="mt-auto border-t bg-background p-4 text-center text-sm text-muted-foreground">
           © {new Date().getFullYear()} WanderWise. Plan your next adventure.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
