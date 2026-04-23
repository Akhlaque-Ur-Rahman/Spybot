export const CARD_DESIGN_VARIANTS = ['carddesign1', 'carddesign2', 'carddesign3'] as const;

export type CardDesignVariant = (typeof CARD_DESIGN_VARIANTS)[number];

export function resolveCardDesignClass(variant?: string | null): CardDesignVariant {
  if (!variant) return 'carddesign2';
  return (CARD_DESIGN_VARIANTS as readonly string[]).includes(variant)
    ? (variant as CardDesignVariant)
    : 'carddesign2';
}
