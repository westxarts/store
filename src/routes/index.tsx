import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ProductSection } from "@/components/ProductSection";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "One Emporium — Premium Fashion Bags for Nigerian Women" },
      {
        name: "description",
        content:
          "Shop premium fashion bags online. Handcrafted leather totes, crossbody bags, and clutches with nationwide delivery across Nigeria.",
      },
      { property: "og:title", content: "One Emporium — Premium Fashion Bags" },
      {
        property: "og:description",
        content:
          "Discover our curated collection of premium fashion bags for the modern Nigerian woman.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <ProductSection />
      <WhyChooseUs />
      <Testimonials />
      <Footer />
    </div>
  );
}
