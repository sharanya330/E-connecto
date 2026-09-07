import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
