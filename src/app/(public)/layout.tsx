import Ticker from "@/components/Ticker";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ticker />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
