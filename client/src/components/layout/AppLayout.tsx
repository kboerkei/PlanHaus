import { ReactNode } from "react";
import Sidebar from "./sidebar-enhanced";
import Header from "./header";
import Footer from "./footer";
import MobileNav from "./mobile-nav-enhanced";
import FloatingActions from "./floating-actions";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header />
        <main className="flex-1 overflow-auto pb-20 lg:pb-0 px-4 lg:px-0 touch-manipulation">
          <div className="min-h-full flex flex-col max-w-full">
            <div className="flex-1 w-full">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>
      <MobileNav />
      <FloatingActions />
    </div>
  );
}