import type { ImageSourcePropType } from 'react-native';

import type { CategoryArtKey } from '@/types/home';

export const CATEGORY_ART: Record<CategoryArtKey, ImageSourcePropType> = {
  panel: require('../../../assets/images/categories/panel.webp'),
  inv: require('../../../assets/images/categories/inv.webp'),
  bat: require('../../../assets/images/categories/bat.webp'),
  rack: require('../../../assets/images/categories/rack.webp'),
  comp: require('../../../assets/images/categories/comp.webp'),
  diy: require('../../../assets/images/categories/diy.webp'),
  ev: require('../../../assets/images/categories/ev.webp'),
};
