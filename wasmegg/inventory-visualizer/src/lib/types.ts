//
export interface Orderable  {
  id:           string
  name:         string
  weight:       number
  img:          string
  glyph?:       string
  rarity?:      string
  grain?:       number
  area?:        OrderableArea
  desc?:        string
}
export interface Orderables { [key: string]: Orderable }

export type OrderableArea = 'fam' | 'lvl' | 'rar' | 'stg' | 'stl' | 'typ'

export interface LayoutOrderables {
  artifacts:    Orderables
  stones:       Orderables
  aspects:      Orderables
}

export type LayoutAxis = keyof LayoutOrderables

export interface PlayerDataOptions {
  transpose:    boolean
  sillySizes:   boolean
  showTicks:    boolean
  smushStoned:  boolean
  fancy:        boolean
}

export interface VisualizerConfig extends LayoutOrderables {
  options:      PlayerDataOptions
}

export type VisualizerConfigAxis = keyof VisualizerConfig
