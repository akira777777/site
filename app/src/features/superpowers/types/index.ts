/**
 * Superpower Interface
 */
export interface Superpower {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: string;
  color: string;
}

/**
 * Superpowers API Response
 */
export interface SuperpowersResponse {
  data: Superpower[];
}
