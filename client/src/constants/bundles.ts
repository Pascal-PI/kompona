import santaImage from '@assets/generated_images/santa_profile_picture.png';
import reindeerImage from '@assets/generated_images/reindeer_rudolph_card.png';
import snowmanImage from '@assets/generated_images/snowman_card_image.png';
import christmasTreeImage from '@assets/generated_images/christmas_tree_card.png';
import elfImage from '@assets/generated_images/christmas_elf_card.png';
import gingerbreadImage from '@assets/generated_images/gingerbread_man_card.png';

export interface Bundle {
  id: string;
  name: string;
  description: string;
  price: number;
  stripeMetadataType: string;
  theme: string;
  previewImages: string[];
  features: string[];
  extraCardCount: number;
  isActive: boolean;
  isSeasonal: boolean;
  seasonEndDate?: string;
  badgeText?: string;
  gradientFrom: string;
  gradientVia?: string;
  gradientTo: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  iconBgColor: string;
}

export const bundles: Bundle[] = [
  {
    id: 'christmas_bundle',
    name: 'Christmas Special Bundle',
    description: 'Celebrate the holiday season with this exclusive bundle!',
    price: 2.00,
    stripeMetadataType: 'christmas_bundle',
    theme: 'santa',
    previewImages: [santaImage, reindeerImage, snowmanImage, christmasTreeImage, elfImage, gingerbreadImage],
    features: [
      '38 unique Christmas cards',
      'Exclusive Santa profile picture',
      'Festive holiday banner',
    ],
    extraCardCount: 32,
    isActive: true,
    isSeasonal: true,
    seasonEndDate: '2025-01-06',
    badgeText: 'Limited Time!',
    gradientFrom: 'from-red-100',
    gradientVia: 'via-green-50',
    gradientTo: 'to-red-100',
    borderColor: 'border-red-300',
    textColor: 'text-red-800',
    accentColor: 'text-red-700',
    iconBgColor: 'bg-red-600',
  },
];

export function getActiveBundle(bundleId: string): Bundle | undefined {
  return bundles.find(b => b.id === bundleId && b.isActive);
}

export function getActiveBundles(): Bundle[] {
  return bundles.filter(b => b.isActive);
}

export function getSeasonalBundles(): Bundle[] {
  const now = new Date();
  return bundles.filter(b => {
    if (!b.isSeasonal || !b.isActive) return false;
    if (b.seasonEndDate) {
      return new Date(b.seasonEndDate) >= now;
    }
    return true;
  });
}
