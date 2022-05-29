//
export interface Orderable  {
  id: string, name: string, weight: number, img: string, glyph?: string, rarity?: string,
}
export interface Orderables { [key: string]: Orderable }

export interface LayoutOrderables {
  artifacts:  Orderables
  stones:     Orderables
  aspects:    Orderables
}

export type LayoutAxis = keyof LayoutOrderables
