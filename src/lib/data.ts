export type Service = {
  id: string | number;
  title: string;
  name: string;
  city: string;
  cat: number;
  price: number;
  image: number;
  imageUrl?: string;
  desc: string;
  rating: string;
};

export type CategoryInfo = {
  index: number;
  name: string;
  tone: string;
  icon: string;
  imageUrl?: string;
  id?: string;
};

export const CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
] as const;

export const CATEGORY_META = [
  { name: "Stitching & Tailoring", tone: "violet", icon: "scissors" },
  { name: "Home Cooking", tone: "peach", icon: "cooking-pot" },
  { name: "Baking", tone: "pink", icon: "cake-slice" },
  { name: "Tutoring", tone: "mint", icon: "book-open" },
  { name: "Arts & Crafts", tone: "yellow", icon: "palette" },
  { name: "Beauty & Care", tone: "blue", icon: "sparkles" },
] as const;

export const SERVICES: Service[] = [
  {
    id: 1,
    title: "Hand-embroidered suits",
    name: "Ayesha Khan",
    city: "Lahore",
    cat: 0,
    price: 2500,
    image: 0,
    desc: "Personalised floral embroidery and custom stitching for everyday wear and special occasions. Discuss your design and fabric before the work begins.",
    rating: "New",
  },
  {
    id: 2,
    title: "Homestyle chicken biryani",
    name: "Sana Ahmed",
    city: "Karachi",
    cat: 1,
    price: 650,
    image: 1,
    desc: "A freshly prepared family recipe with fragrant basmati rice, tender chicken and whole spices. Ask about portion sizes and food allergies before booking.",
    rating: "New",
  },
  {
    id: 3,
    title: "Custom celebration cakes",
    name: "Hira Malik",
    city: "Islamabad",
    cat: 2,
    price: 2200,
    image: 2,
    desc: "Small-batch buttercream cakes for birthdays and intimate celebrations. Choose a flavour, colour palette and personal message.",
    rating: "New",
  },
  {
    id: 4,
    title: "One-to-one maths tutoring",
    name: "Maryam Ali",
    city: "Lahore",
    cat: 3,
    price: 800,
    image: 3,
    desc: "Patient, individual maths tuition with practice exercises tailored to your school year and learning goals.",
    rating: "New",
  },
  {
    id: 5,
    title: "Personalised embroidery hoops",
    name: "Zoya Noor",
    city: "Rawalpindi",
    cat: 4,
    price: 1400,
    image: 0,
    desc: "A personalised floral hoop, hand-embroidered for your home or as a thoughtful gift.",
    rating: "New",
  },
  {
    id: 6,
    title: "Occasion henna designs",
    name: "Amna Iqbal",
    city: "Faisalabad",
    cat: 5,
    price: 1000,
    image: 5,
    desc: "Intricate traditional henna patterns for celebrations. Discuss design and ingredient sensitivities in advance.",
    rating: "New",
  },
];

export function formatPrice(price: number) {
  return `PKR ${price.toLocaleString("en-PK")}`;
}
