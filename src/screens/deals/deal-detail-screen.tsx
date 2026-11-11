import { Pressable, ScrollView, Text, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import {
  BottomBar,
  DetailCard,
  DocumentRow,
  ImageGallery,
  SpecTable,
} from '@/components/listing/detail-parts';
import { EmptyState, LoadingState } from '@/components/listing/empty-state';
import { ListingHeader } from '@/components/listing/listing-header';
import { useDealDetail } from '@/hooks/use-deal-detail';
import { useGoBack } from '@/hooks/use-go-back';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { colors } from '@/theme/tokens';
import type { DealDetail } from '@/types/listing';
import { formatMoney, formatPerWatt } from '@/utils/home-format';

const STEPS = [
  { title: 'Make an offer', body: 'Pick pallets and an optional price per watt.' },
  { title: 'Negotiate in chat', body: 'The seller replies anonymously via Sunhub.' },
  { title: 'Accept the contract', body: 'The agreed price goes straight to your cart.' },
] as const;

function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View className="w-[48%] gap-px rounded-[12px] bg-chip px-[12px] py-[10px]">
      <Text className="font-inter text-[11px] text-muted">{label}</Text>
      <Text className="font-inter-semibold text-[13px] text-ink" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function DealBody({ deal }: { deal: DealDetail }) {
  const requireAuth = useRequireAuth();
  const money = (value: number) => (deal.perWatt ? formatPerWatt(value) : formatMoney(value));
  const pills = [
    { label: 'NEGOTIABLE', tone: 'orange' as const },
    ...deal.badges.map((label) => ({ label, tone: 'blue' as const })),
    ...(deal.sponsored ? [{ label: 'Sponsored', tone: 'amber' as const }] : []),
  ];

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageGallery urls={deal.imageUrls} label={deal.name} pills={pills} />
        <DetailCard>
          <Text className="font-inter text-[13px] text-muted">
            {[deal.brand, deal.subCategory ?? deal.category].filter(Boolean).join(' · ')}
          </Text>
          <Text className="font-poppins-semibold text-[20px] leading-[26px] text-ink">
            {deal.name}
          </Text>
          <View className="mt-sm gap-[2px]">
            <Text className="font-inter-semibold text-[10.5px] tracking-[0.5px] text-muted">
              {deal.perWatt ? 'ASKING PRICE PER WATT' : 'ASKING PRICE PER UNIT'}
            </Text>
            <View className="flex-row flex-wrap items-baseline gap-sm">
              <Text className="font-inter-bold text-[30px] text-ink">{money(deal.price)}</Text>
              {deal.compareAt ? (
                <Text className="font-inter text-[13px] text-faint line-through">
                  {money(deal.compareAt)}
                </Text>
              ) : null}
              {deal.discountPercent && deal.discountPercent > 0 ? (
                <View className="h-[20px] justify-center rounded-full bg-[#E6F6EC] px-[8px]">
                  <Text className="font-inter-semibold text-[11px] text-success-ink">
                    {deal.discountPercent}% off
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <View className="mt-sm flex-row flex-wrap justify-between gap-y-[10px]">
            <Fact label="Available" value={deal.available} />
            <Fact label="MOQ" value={deal.moq} />
            <Fact label="Location" value={deal.location} />
            <Fact label="Terms" value={deal.shipping?.split(' - ')[0]} />
          </View>
          {deal.estimateAtMoq ? (
            <View className="mt-sm flex-row items-center justify-between rounded-[14px] border border-[#FFD9B8] bg-[#FFF8F2] p-[14px]">
              <View>
                <Text className="font-inter text-[12px] text-muted">Estimated at MOQ</Text>
                <Text className="font-inter-bold text-[22px] text-primary">
                  {formatMoney(deal.estimateAtMoq.total)}
                </Text>
              </View>
              <View className="h-[22px] justify-center rounded-full bg-[#FFF1E6] px-[10px]">
                <Text className="font-inter-medium text-[11px] text-[#C2410C]">
                  {deal.estimateAtMoq.panels.toLocaleString('en-US')} panels
                </Text>
              </View>
            </View>
          ) : null}
        </DetailCard>
        <DetailCard title="How it works">
          <View className="gap-[12px]">
            {STEPS.map((step, index) => (
              <View key={step.title} className="flex-row items-start gap-[12px]">
                <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-[#FFF1E6]">
                  <Text className="font-inter-bold text-[12px] text-primary">{index + 1}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-inter-semibold text-[13px] text-ink">{step.title}</Text>
                  <Text className="font-inter text-[12.5px] leading-[18px] text-ink-soft">
                    {step.body}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </DetailCard>
        {deal.specs.length ? (
          <DetailCard title="Specifications">
            <SpecTable specs={deal.specs} />
          </DetailCard>
        ) : null}
        {deal.paymentTerms ? (
          <DetailCard title="Payment terms">
            <Text className="font-inter text-[13px] leading-[19px] text-ink-soft">
              {deal.paymentTerms}
            </Text>
          </DetailCard>
        ) : null}
        {deal.documents.length ? (
          <DetailCard title="Supporting docs">
            <View className="gap-sm">
              {deal.documents.map((document) => (
                <DocumentRow key={document.url} document={document} />
              ))}
            </View>
          </DetailCard>
        ) : null}
      </ScrollView>
      <BottomBar>
        <Pressable
          onPress={() => requireAuth('Chat')}
          accessibilityRole="button"
          accessibilityLabel="Chat now"
          className="h-[46px] w-[46px] items-center justify-center rounded-full border border-[#D1D5DB] bg-white active:bg-chip"
        >
          <Icon name="chat" size={20} color={colors.ink} />
        </Pressable>
        <Pressable
          onPress={() => requireAuth('Offers')}
          accessibilityRole="button"
          className="h-[46px] flex-1 items-center justify-center rounded-full bg-primary active:bg-primary-pressed"
        >
          <Text className="font-poppins-semibold text-[14px] text-white">Make an offer</Text>
        </Pressable>
      </BottomBar>
    </>
  );
}

export function DealDetailScreen({ listingId }: { listingId: string }) {
  const goBack = useGoBack();
  const { deal, isLoading, error, retry } = useDealDetail(listingId);

  return (
    <View className="flex-1 bg-white">
      <ListingHeader title="Deal" onBack={goBack} />
      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? (
        <EmptyState
          icon="bell"
          title="Could not load this deal"
          message={error}
          actionLabel="Try again"
          onAction={retry}
        />
      ) : null}
      {!isLoading && !error && !deal ? (
        <EmptyState
          title="Deal not found"
          message="It may have been sold or taken down."
          actionLabel="Back to deals"
          onAction={goBack}
        />
      ) : null}
      {deal ? <DealBody key={deal.id} deal={deal} /> : null}
    </View>
  );
}
