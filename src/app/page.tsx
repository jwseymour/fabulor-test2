import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Feather, Users, Sparkles } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-900">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="flex flex-col items-center space-y-4 text-center text-white">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Welcome to Fabulor
                </h1>
                <p className="mx-auto max-w-[700px] text-lg sm:text-xl">
                  Unleash your imagination and connect with storytellers from around the world.
                </p>
              </div>
              <div className="space-x-4">
                <Button variant="secondary">Start Reading</Button>
                <Button variant="outline">Start Writing</Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              Why Choose Fabulor?
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <Feather className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-bold">Creative Freedom</h3>
                <p className="text-sm text-muted-foreground">Write and share stories in any genre or format.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Users className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-bold">Vibrant Community</h3>
                <p className="text-sm text-muted-foreground">Connect with readers and writers from diverse backgrounds.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Sparkles className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-bold">Discover New Worlds</h3>
                <p className="text-sm text-muted-foreground">Explore a vast library of original stories and fanfiction.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Join Our Storytelling Community
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Sign up now and start your journey as a reader or writer on Fabulor.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-4">
                <Link href="/register" className="block">
                  <Button className="w-full py-6 text-lg bg-white font-semibold shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
                    Sign Up
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <Link className="underline underline-offset-2" href="#">
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
