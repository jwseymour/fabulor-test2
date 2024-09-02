import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { NavBar } from '@/components/NavBar';
import { Footer } from "@/components/Footer";
import { auth } from '@/lib/auth';

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

  const navItems: NavItem[] = [
    { label: "Explore", href: "#" },
    { label: "Write", href: "#" },
    { label: "Community", href: "#" },
    { label: "About", href: "#" },
  ];
  
  if (session?.user) {
    navItems.push({ label: "Log Out", action: 'logout' });
  } else {
    navItems.push({ label: "Log In", action: 'login' });
  }

  return (
    <html lang="en">
      <body className={GeistSans.variable}>
        <NavBar navItems={navItems} />
        {children}
        <Footer />
      </body>
    </html>
  );
}