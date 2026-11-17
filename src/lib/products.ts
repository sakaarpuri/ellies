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
  updatedAt: "2026-11-13",
};

export const arohiniQualityStatement =
  "Every batch of every ingredient is quality-approved before it goes into Arohini.";

export const arohiniPhotos = [
  { src: "/images/arohini-arch.webp", alt: "Arohini women's wellness 40+ elixir, 200 ml bottle and box", width: 1036, height: 1518 },
  { src: "/images/arohini-morning.webp", alt: "Woman holding an Arohini bottle at a bright breakfast table", width: 900, height: 1200 },
  { src: "/images/arohini-wellness-poster-arch.webp", alt: "Arohini women's wellness 40+ poster with the bottle and box", width: 1037, height: 1517 },
] as const;

export const arohiniHerbPhotos = [
  {
    name: "Shatavari",
    src: "/images/arohini-herb-shatavari.webp",
    alt: "Shatavari roots and fine green foliage on pale pink stone",
    benefit: "Traditionally used to nourish women's wellbeing.",
    source: "https://cb.imsc.res.in/imppat/therapeutics/Asparagus%20racemosus",
  },
  {
    name: "Ashwagandha",
    src: "/images/arohini-herb-ashwagandha.webp",
    alt: "Ashwagandha roots, leaves and orange berries on sage-green stone",
    benefit: "Traditionally used for stress support and restful sleep.",
    source: "https://ods.od.nih.gov/factsheets/Ashwagandha-HealthProfessional/",
  },
  {
    name: "Brahmi",
    src: "/images/arohini-herb-brahmi.webp",
    alt: "Fresh Brahmi stems with small green leaves and white flowers on blue-grey stone",
    benefit: "Traditionally used to support memory and mental wellbeing.",
    source: "https://www.ncbi.nlm.nih.gov/books/NBK603563/",
  },
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
    answer: `Arohini costs Rs.${arohini.price} for a 200 ml bottle, with free delivery within India. ${arohini.deliveryEstimate} For international orders, email support@elliesbotanics.com.`,
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
  [
    "Shatavari",
    "Asparagus racemosus",
    "A nourishing herb with a long history in Ayurvedic women's wellness traditions.",
  ],
  [
    "Moringa",
    "Moringa oleifera",
    "A leafy botanical traditionally used as part of everyday nourishment.",
  ],
  [
    "Ashoka",
    "Saraca asoca",
    "A botanical associated with women's care in classical Ayurvedic practice.",
  ],
  [
    "Guduchi",
    "Tinospora cordifolia",
    "Traditionally included in Ayurvedic rejuvenative preparations.",
  ],
  [
    "Amalaki",
    "Emblica officinalis",
    "Indian gooseberry, a familiar fruit in Ayurvedic food and wellness traditions.",
  ],
  [
    "Brahmi",
    "Bacopa monnieri",
    "An herb with a history of use in traditional approaches to mental wellbeing.",
  ],
  [
    "Ashwagandha",
    "Withania somnifera",
    "Traditionally used in Ayurvedic routines centred on vitality and resilience.",
  ],
] as const;
