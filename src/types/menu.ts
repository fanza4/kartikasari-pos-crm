export type MenuCategory = 'all' | 'mie_kuah' | 'yamin_manis' | 'yamin_asin' | 'topping' | 'minuman';

export interface ToppingItem {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  composition: string | string[];
  defaultVariants?: ('Mie Kuah' | 'Yamin Manis' | 'Yamin Asin')[];
  isNoodlePortion: boolean; // qualifying item for Digital Stamp
  givesStamp?: boolean; // synonym for isNoodlePortion
  portionType?: 'seporsi' | 'setengah' | 'komplit' | 'komplit_khusus' | 'setengah_baso' | 'setengah_siomay' | 'setengah_tahu' | 'addon' | 'beverage';
  isAvailable: boolean;
  image: string;
  description: string;
  allowPriceOverride?: boolean; // For Aneka Jus
  isCustomPrice?: boolean; // synonym for allowPriceOverride
}
