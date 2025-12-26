'use client';

import { useEffect } from 'react';
import "../index.css";
import "../App.css";

// Create a client component that wraps the children
function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Remove any attributes added by extensions
    const removeExtensionAttributes = () => {
      document.documentElement.removeAttribute('crxlauncher');
    };
    
    // Run once on mount
    removeExtensionAttributes();
    
    // Set up a mutation observer to handle dynamic changes
    const observer = new MutationObserver(removeExtensionAttributes);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['crxlauncher']
    });
    
    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
