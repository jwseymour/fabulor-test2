import '@/styles/globals.css';
import { GeistSans } from 'geist/font/sans';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from "@/components/layout/Footer";
import { auth } from '@/lib/auth/auth';

let title = 'Fabulor - Unleash Your Imagination';
let description =
  'Fabulor is a platform for storytellers to share their creativity and connect with readers from around the world.';

export const metadata = {
  title,
  description,
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  metadataBase: new URL('https://fabulor.vercel.app'),
};

type NavItem = 
  | { label: string; href: string }
  | { label: string; action: 'login' | 'logout' };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const homeLink = session?.user ? '/dashboard' : '/';

  const navItems: NavItem[] = session?.user 
  ? [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Files", href: "/files" },
      { label: "Stories", href: "#" },
      { label: "Profile", href: "#" },
      { label: "Log Out", action: 'logout' }
    ]
  : [
      { label: "Features", href: "#features" },
      { label: "About", href: "#about" },
      { label: "Community", href: "#community" },
      { label: "Log In", action: 'login' }
    ];

  return (
    <html lang="en">
      <body className={GeistSans.variable}>
        <NavBar navItems={navItems} homeLink={homeLink}/>
        {children}
        <Footer />
      </body>
    </html>
  );
}