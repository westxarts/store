import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  fullDescription: string;
  image: string;
  images: string[];
  category: string;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Noir Executive Tote",
    price: 85000,
    description: "Structured black leather tote with gold hardware",
    fullDescription:
      "A statement piece for the modern professional. Crafted from premium Italian-grade leather with an elegant gold clasp and reinforced handles. Features multiple interior compartments and a detachable organiser pouch. Perfect for the boardroom and beyond.",
    image: product1,
    images: [product1],
    category: "Totes",
    inStock: true,
  },
  {
    id: "2",
    name: "Burgundy Chain Crossbody",
    price: 52000,
    description: "Deep burgundy crossbody with silver chain strap",
    fullDescription:
      "Effortlessly chic, this crossbody bag in rich burgundy leather features a delicate silver chain strap that transitions seamlessly from day to evening. Compact yet surprisingly spacious with a zip-top closure for security.",
    image: product2,
    images: [product2],
    category: "Crossbody",
    inStock: true,
  },
  {
    id: "3",
    name: "Pearl Quilted Tote",
    price: 95000,
    description: "Cream quilted leather tote with gold accents",
    fullDescription:
      "Timeless elegance meets everyday luxury. This quilted cream tote features diamond-pattern stitching, gold-tone studs, and reinforced leather handles. The spacious interior comfortably holds your laptop, planner, and essentials.",
    image: product3,
    images: [product3],
    category: "Totes",
    inStock: true,
  },
  {
    id: "4",
    name: "Emerald Envelope Clutch",
    price: 38000,
    description: "Elegant green leather clutch with gold clasp",
    fullDescription:
      "Make a statement at any occasion with this stunning emerald envelope clutch. Crafted from pebbled leather with a magnetic gold-tone clasp. Includes a detachable wrist strap and interior card slots.",
    image: product4,
    images: [product4],
    category: "Clutches",
    inStock: true,
  },
  {
    id: "5",
    name: "Caramel Bucket Bag",
    price: 68000,
    description: "Tan leather bucket bag with braided handles",
    fullDescription:
      "Relaxed sophistication at its finest. This bucket bag in warm caramel leather features hand-braided handles and a drawstring closure. The soft, unstructured silhouette makes it the perfect companion for weekend outings.",
    image: product5,
    images: [product5],
    category: "Bucket Bags",
    inStock: true,
  },
  {
    id: "6",
    name: "Lavender Day Bag",
    price: 72000,
    description: "Lavender leather shoulder bag with gold buckle",
    fullDescription:
      "A fresh take on the classic shoulder bag. This lavender beauty features a polished gold buckle, adjustable strap, and spacious main compartment. The soft pastel tone adds a touch of playfulness to any outfit.",
    image: product6,
    images: [product6],
    category: "Shoulder Bags",
    inStock: true,
  },
];

export function formatPrice(price: number): string {
  return `₦${price.toLocaleString("en-NG")}`;
}
