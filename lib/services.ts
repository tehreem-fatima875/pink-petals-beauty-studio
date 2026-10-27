export type ServiceCategory = "Hair" | "Color" | "Nails" | "Skin" | "Beauty";

export type SalonService = {
  id: string;
  name: string;
  category: ServiceCategory;
  duration: number;
  price: number;
  description: string;
  image: string;
  featured: boolean;
  active: boolean;
};

export const services: SalonService[] = [
  {
    id: "signature-cut",
    name: "Signature Haircut",
    category: "Hair",
    duration: 60,
    price: 65,
    description: "A thoughtful cut, wash and finish tailored to you.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=82",
    featured: true,
    active: true,
  },
  {
    id: "blowout",
    name: "Petal Blowout",
    category: "Hair",
    duration: 45,
    price: 48,
    description: "Soft, lasting volume with a glossy salon finish.",
    image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=900&q=82",
    featured: false,
    active: true,
  },
  {
    id: "color-refresh",
    name: "Color Refresh",
    category: "Color",
    duration: 120,
    price: 145,
    description: "Dimensional color and a nourishing gloss treatment.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=82",
    featured: true,
    active: true,
  },
  {
    id: "balayage",
    name: "Lived-in Balayage",
    category: "Color",
    duration: 180,
    price: 245,
    description: "Beautifully blended, sun-kissed color made for you.",
    image: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=900&q=82",
    featured: false,
    active: true,
  },
  {
    id: "classic-manicure",
    name: "Classic Manicure",
    category: "Nails",
    duration: 45,
    price: 38,
    description: "Shape, cuticle care and your favorite polished finish.",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=82",
    featured: false,
    active: true,
  },
  {
    id: "gel-manicure",
    name: "Petal Gel Manicure",
    category: "Nails",
    duration: 60,
    price: 52,
    description: "A detail-perfect manicure with long-wear gel color.",
    image: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=900&q=82",
    featured: true,
    active: true,
  },
  {
    id: "glow-facial",
    name: "The Glow Facial",
    category: "Skin",
    duration: 60,
    price: 95,
    description: "A restorative facial to leave skin calm and luminous.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=82",
    featured: true,
    active: true,
  },
  {
    id: "brow-shape",
    name: "Brow Shape & Tint",
    category: "Beauty",
    duration: 30,
    price: 42,
    description: "A custom shape and soft tint to frame your features.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=82",
    featured: false,
    active: true,
  },
];

export function findService(id: unknown) {
  return typeof id === "string" ? services.find((service) => service.id === id && service.active) : undefined;
}
