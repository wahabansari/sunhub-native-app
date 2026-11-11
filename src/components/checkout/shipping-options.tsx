import { Pressable, Text, View } from 'react-native';

import { ProductImage } from '@/components/catalog/product-image';
import type { CartItem, FedexRate, ShippingChoice } from '@/types/cart';
import { formatMoney } from '@/utils/home-format';

const LABELS: Record<ShippingChoice, string> = {
  FREE_SHIPPING: 'Free shipping',
  LOCAL_PICKUP: 'Local pickup (free)',
  CALCULATED: 'Estimated shipping',
  FEDEX: 'FedEx',
};

type Props = {
  items: CartItem[];
  choices: Record<string, ShippingChoice | undefined>;
  fedexRates: Record<string, FedexRate | undefined>;
  hasAddress: boolean;
  onChoose: (uuid: string, choice: ShippingChoice) => void;
};

function detailFor(
  item: CartItem,
  choice: ShippingChoice,
  rate: FedexRate | undefined,
  hasAddress: boolean,
) {
  if (choice === 'CALCULATED') return formatMoney(item.shippingCost);
  if (choice === 'FEDEX') {
    if (!hasAddress) return 'Enter your address to see the rate';
    return rate
      ? `${formatMoney(rate.price)} · ${rate.service.replace(/_/g, ' ').toLowerCase()}`
      : 'Getting rate…';
  }
  return null;
}

/** One block per item listing the ways it can be delivered; single-option items are chosen for the buyer. */
export function ShippingOptions({ items, choices, fedexRates, hasAddress, onChoose }: Props) {
  return (
    <View className="gap-[14px]">
      {items.map((item) => (
        <View
          key={item.uuid}
          className="gap-[10px] rounded-[16px] border border-[#EEF0F3] p-[12px]"
        >
          <View className="flex-row items-center gap-[10px]">
            <View
              className="h-[44px] w-[44px] overflow-hidden rounded-[10px] bg-chip"
              style={{ isolation: 'isolate' }}
            >
              <ProductImage
                uri={item.imageUrl}
                label={item.name}
                inset={{ top: 3, x: 3, bottom: 3 }}
              />
            </View>
            <View className="flex-1">
              <Text className="font-poppins-medium text-[13px] text-ink" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="font-inter text-[12px] text-muted">Qty {item.qty}</Text>
            </View>
          </View>
          {item.shippingOptions.length === 0 ? (
            <Text className="font-inter text-[12.5px] text-danger">
              Delivery is not available for this item.
            </Text>
          ) : null}
          {item.shippingOptions.map((option) => {
            const selected = choices[item.uuid] === option;
            const detail = detailFor(item, option, fedexRates[item.uuid], hasAddress);
            return (
              <Pressable
                key={option}
                onPress={() => onChoose(item.uuid, option)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                className={`flex-row items-center gap-[10px] rounded-[12px] border px-[12px] py-[10px] ${
                  selected ? 'border-primary bg-primary-light' : 'border-[#D9DDE3] bg-white'
                }`}
              >
                <View
                  className={`h-[18px] w-[18px] items-center justify-center rounded-full border-2 ${
                    selected ? 'border-primary' : 'border-[#C5CBD3]'
                  }`}
                >
                  {selected ? <View className="h-[8px] w-[8px] rounded-full bg-primary" /> : null}
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-inter-medium text-[13.5px] ${selected ? 'text-primary' : 'text-ink'}`}
                  >
                    {LABELS[option]}
                  </Text>
                  {detail ? (
                    <Text className="font-inter text-[12px] text-muted">{detail}</Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
