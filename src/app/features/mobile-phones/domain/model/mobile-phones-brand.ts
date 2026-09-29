export const MobilePhonesBrand = {
  Apple: 'Apple',
  Motorola: 'Motorola',
  Samsung: 'Samsung',
  Xiaomi: 'Xiaomi',
} as const;

export type MobilePhonesBrand = (typeof MobilePhonesBrand)[keyof typeof MobilePhonesBrand];
