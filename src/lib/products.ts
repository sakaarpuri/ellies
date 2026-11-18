export const arohini = {
  id: "arohini",
  name: "Arohini",
  subtitle: "Women's wellness, 40+",
  description:
    "A sugar-free Ayurvedic botanical elixir with seven botanicals for women aged 40 and beyond, including perimenopause and the years after menopause.",
  price: 270,
  size: "200 ml",
  image: "/images/arohini.webp",
  path: "/products/arohini",
  deliveryEstimate: "Typically delivered in 7 days within India.",
  updatedAt: "2026-11-18",
};

export const arohiniBundle = { quantity: 3, discountPercent: 10 } as const;

export function getArohiniPrice(quantity: number) {
  const subtotal = quantity * arohini.price;
  const bundles = Math.floor(quantity / arohiniBundle.quantity);
  const discount =
    (bundles * arohiniBundle.quantity * arohini.price * arohiniBundle.discountPercent) / 100;
  return { subtotal, discount, total: subtotal - discount };
}

export const arohiniQualityStatement =
  "Every batch of every ingredient is quality-approved before it goes into Arohini.";

export const arohiniPhotos = [
  { src: "/images/arohini-arch.webp", alt: "Arohini women's wellness 40+ elixir, 200 ml bottle and box", width: 1036, height: 1518 },
  { src: "/images/arohini-morning.webp", alt: "Woman holding an Arohini bottle at a bright breakfast table", width: 900, height: 1200 },
] as const;

export const arohiniFaqs = [
  {
    question: "What is Arohini?",
    answer: `${arohini.description} It comes in a 200 ml bottle and contains no artificial sweeteners.`,
  },
  {
    question: "Which ingredients are in Arohini?",
    answer: "Arohini combines Shatavari, Moringa, Ashoka, Guduchi, Amalaki, Brahmi and Ashwagandha. Follow the full ingredient information and directions on your bottle.",
  },
  {
    question: "How is ingredient quality checked?",
    answer: `${arohiniQualityStatement} For questions about the ingredients or your bottle's batch, contact support@elliesbotanics.com with the batch number.`,
  },
  {
    question: "How should I use Arohini?",
    answer: "Follow the directions and warnings on your bottle, or the advice of your qualified practitioner. Do not exceed the labelled dose. If you take medication or have a health condition, check with your practitioner before use.",
  },
  {
    question: "What happens after I order?",
    answer: "After successful payment, you will see your order confirmation and reference. A confirmation email is sent to the address you provide. Please keep your order reference for any questions.",
  },
  {
    question: "How much does Arohini cost, and where do you deliver?",
    answer: `Arohini costs Rs.${arohini.price} for a 200 ml bottle, with free delivery within India. ${arohini.deliveryEstimate}`,
  },
] as const;

export const arohiniPackHighlights = [
  "Hormonal harmony",
  "Energy & vitality",
  "Bone & joint health",
  "Emotional wellbeing",
  "Cognitive wellness",
] as const;

export const arohiniBotanicals = [
  {
    name: "Shatavari",
    latin: "Asparagus racemosus",
    alt: "Shatavari roots and fine green foliage",
    use: "Nourishment in women’s wellness routines.",
  },
  {
    name: "Moringa",
    latin: "Moringa oleifera",
    alt: "A moringa cutting with clusters of small oval green leaves",
    use: "Leafy greens for everyday nourishment.",
  },
  {
    name: "Ashoka",
    latin: "Saraca asoca",
    alt: "A cluster of orange and yellow ashoka flowers",
    use: "Bark used in Ayurvedic women’s care.",
  },
  {
    name: "Guduchi",
    latin: "Tinospora cordifolia",
    alt: "Heart-shaped green leaves of the guduchi vine",
    use: "Included in Ayurvedic tonics for vitality.",
  },
  {
    name: "Amalaki",
    latin: "Phyllanthus emblica",
    alt: "Pale green amalaki fruits with faint ridges",
    use: "Indian gooseberry used for digestive wellbeing.",
  },
  {
    name: "Brahmi",
    latin: "Bacopa monnieri",
    alt: "Brahmi stems with small green leaves and white flowers",
    use: "Used in Ayurvedic routines for memory.",
  },
  {
    name: "Ashwagandha",
    latin: "Withania somnifera",
    alt: "Ashwagandha roots, broad green leaves and orange berries",
    use: "Used for stress support and restful sleep.",
  },
] as const;
