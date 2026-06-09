import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2026-05-27.dahlia' as any,
    })
  }
  return _stripe
}

export const PLANS = {
  essentiel: {
    id: 'essentiel',
    name: 'Essentiel',
    price: 19,
    priceId: process.env.STRIPE_PRICE_ESSENTIEL || '',
    features: ['Chat 1h/jour', 'Onboarding unique', 'IA personnalisée'],
    timer: true,
    photos: false,
    onboardingEveryConv: false,
  },
  illimite: {
    id: 'illimite',
    name: 'Illimité',
    price: 39,
    priceId: process.env.STRIPE_PRICE_ILLIMITE || '',
    features: ['Chat illimité', 'Onboarding unique', 'IA personnalisée'],
    timer: false,
    photos: false,
    onboardingEveryConv: false,
    popular: true,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 79,
    priceId: process.env.STRIPE_PRICE_PREMIUM || '',
    features: ['Chat 1h/jour', 'Photos IA incluses', 'Onboarding personnalisé'],
    timer: true,
    photos: true,
    onboardingEveryConv: true,
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    price: 199,
    priceId: process.env.STRIPE_PRICE_ELITE || '',
    features: ['Chat illimité', 'Photos illimitées', 'Expérience totale'],
    timer: false,
    photos: true,
    onboardingEveryConv: true,
  },
}
