//
export interface Orderable  { name: string, weight: number, img: string, glyph: string }
export interface Orderables { [key: string]: Orderable }

export interface LayoutOrderables {
  kinds:      Orderables
  artifacts:  Orderables
  stones:     Orderables
  aspects:    Orderables
}

export type LayoutAxis = keyof LayoutOrderables
