export interface MenuItem {
  key: string
}

export interface MenuSection {
  title: string
  key?: string
  matchRole?: string
  menuItems: MenuItem[]
}

export type MenuConfig = MenuSection[]
