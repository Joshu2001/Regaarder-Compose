import { useEffect, useState } from 'react';
import { PricingTiers } from '../constants/pricing-tier';

export function usePaddlePrices(paddle, country) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!paddle) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const items = PricingTiers.flatMap((tier) => [
      { priceId: tier.priceId.month, quantity: 1 },
      { priceId: tier.priceId.year, quantity: 1 },
    ]);

    const params = {
      items,
      ...(country && country.trim().length === 2 ? { address: { countryCode: country.trim().toUpperCase() } } : {}),
    };

    paddle
      .PricePreview(params)
      .then((response) => {
        if (!isMounted) return;
        const lineItems = response?.data?.details?.lineItems || [];
        const mappedPrices = {};
        lineItems.forEach((item) => {
          if (item?.price?.id && item?.formattedTotals?.total) {
            mappedPrices[item.price.id] = item.formattedTotals.total;
          }
        });
        setPrices(mappedPrices);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[Paddle.PricePreview Error]', err);
        setError(err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [paddle, country]);

  return { prices, loading, error };
}
