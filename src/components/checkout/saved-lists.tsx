import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { SavedAddress, SavedCard } from '@/types/cart';

function Option({
  selected,
  onPress,
  children,
}: {
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      className={`flex-row items-start gap-[10px] rounded-[14px] border px-[14px] py-[12px] ${
        selected ? 'border-primary bg-primary-light' : 'border-[#D9DDE3] bg-white'
      }`}
    >
      <View
        className={`mt-[2px] h-[18px] w-[18px] items-center justify-center rounded-full border-2 ${
          selected ? 'border-primary' : 'border-[#C5CBD3]'
        }`}
      >
        {selected ? <View className="h-[8px] w-[8px] rounded-full bg-primary" /> : null}
      </View>
      <View className="flex-1 gap-[2px]">{children}</View>
    </Pressable>
  );
}

type AddressProps = {
  addresses: SavedAddress[];
  selectedId: string | null;
  onSelect: (address: SavedAddress) => void;
};

export function SavedAddressList({ addresses, selectedId, onSelect }: AddressProps) {
  return (
    <View accessibilityRole="radiogroup" className="gap-[10px]">
      {addresses.map((address) => (
        <Option
          key={address.id}
          selected={address.id === selectedId}
          onPress={() => onSelect(address)}
        >
          {address.name ? (
            <Text className="font-poppins-medium text-[13.5px] text-ink">{address.name}</Text>
          ) : null}
          <Text className="font-inter text-[13px] leading-[18px] text-ink-soft">
            {address.address}, {address.city}, {address.state} {address.zip}
          </Text>
        </Option>
      ))}
    </View>
  );
}

type CardProps = {
  cards: SavedCard[];
  selectedId: string | null;
  onSelect: (card: SavedCard) => void;
};

export function SavedCardList({ cards, selectedId, onSelect }: CardProps) {
  return (
    <View accessibilityRole="radiogroup" className="gap-[10px]">
      {cards.map((card) => (
        <Option key={card.id} selected={card.id === selectedId} onPress={() => onSelect(card)}>
          <Text className="font-poppins-medium text-[13.5px] text-ink">
            {card.brand} ending in {card.last4}
          </Text>
          <Text className="font-inter text-[12.5px] text-muted">
            {[card.holder, card.expiration ? `Expires ${card.expiration}` : '']
              .filter(Boolean)
              .join(' · ')}
          </Text>
          {card.billingSummary ? (
            <Text className="font-inter text-[12px] text-muted">{card.billingSummary}</Text>
          ) : null}
        </Option>
      ))}
    </View>
  );
}
