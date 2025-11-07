
import Link from 'next/link';
import { Construction } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-6 left-6">
             <Link href="/" className="flex items-center space-x-2 text-foreground">
                <Construction className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline">OrderFlow Construct</span>
              </Link>
        </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
