import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { SignInButton } from "@clerk/nextjs";
import { LockKeyhole, ArrowRight } from "lucide-react"; 

export const UnauthenticatedView = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />

      {/* Card Wrapper with Entry Animation */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        {/* Glassmorphism Container */}
        <div className="rounded-3xl border border-white/10 bg-background/60 p-2 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-zinc-950/50">
          <Item 
            variant="outline" 
            className="flex flex-col items-center border-none bg-transparent p-8 text-center"
          >
            
            {/* Premium Layered Icon Presentation */}
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
              <ItemMedia 
                variant="icon" 
                className="relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent shadow-inner"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
                  <LockKeyhole className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
              </ItemMedia>
            </div>
            
            {/* Typography with Gradient & Adjusted Tracking */}
            <ItemContent className="space-y-3">
              <ItemTitle className="bg-linear-to-br w-full from-foreground to-foreground/60 bg-clip-text text-2xl font-bold tracking-tight text-transparent flex justify-center">
                Access Restricted
              </ItemTitle>
              <ItemDescription className="mx-auto max-w-[280px] text-base leading-relaxed text-muted-foreground/80">
                Unlock your personalized experience. Please sign in to securely access this space.
              </ItemDescription>
            </ItemContent>
            
            {/* Call to Action with Micro-interactions */}
            <ItemActions className="mt-8 w-full">
              <SignInButton mode="modal">
                <Button 
                  variant="default" 
                  size="lg" 
                  className="group relative w-full overflow-hidden rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-primary/25"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Sign In to Continue
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  {/* Button 'shine' effect on hover */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                </Button>
              </SignInButton>
            </ItemActions>
            
          </Item>
        </div>
      </div>
    </div>
  );
};