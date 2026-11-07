/**
 * Payment rails of the store. The original storefront only accepts crypto, so the
 * addresses come from the environment: set VITE_CRYPTO_<COIN> in .env (or in the Lovable
 * Secrets) and they show up on the checkout screen. Empty addresses fall back to
 * "ask support", which is how the original shop worked as well.
 */
export type PaymentMethod = {
  key: string;
  label: string;
  address: string;
};

const COINS: Array<{ key: string; label: string }> = [
  { key: "MONERO", label: "Monero (XMR)" },
  { key: "BITCOIN", label: "Bitcoin (BTC)" },
  { key: "ETHEREUM", label: "Ethereum (ETH)" },
  { key: "LITECOIN", label: "Litecoin (LTC)" },
  { key: "SOLANA", label: "Solana (SOL)" },
  { key: "TRON", label: "TRON (TRC-20)" },
  { key: "USDT", label: "USDT (TRC-20)" },
];

/** Reads the addresses at call time so the environment can change between renders. */
export function getPaymentMethods(): PaymentMethod[] {
  return COINS.map((coin) => {
    const value = import.meta.env[`VITE_CRYPTO_${coin.key}`];
    return {
      key: coin.key,
      label: coin.label,
      address: typeof value === "string" ? value.trim() : "",
    };
  });
}

export function hasPaymentAddresses(): boolean {
  return getPaymentMethods().some((method) => method.address.length > 0);
}
