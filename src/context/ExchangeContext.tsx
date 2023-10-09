"use client";

import { ExchangeSDK } from "@ledgerhq/exchange-sdk";
import { WalletAPIClient } from "@ledgerhq/wallet-api-client";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import { ExchangeSchema } from "../schemas/ExchangeSchema";

type ExchangeContextType =
  | {
      instantiated: true;
      swap(): void;
      walletAPI: WalletAPIClient;
    }
  | { instantiated: false };

type Props = PropsWithChildren;

const ExchangeContext = createContext<ExchangeContextType>({
  instantiated: false,
});

export function useExchangeContext() {
  const ctx = useContext(ExchangeContext);
  return ctx;
}

export function ExchangeProvider({ children }: Props) {
  const [contextValue, setContextValue] = useState<ExchangeContextType>({
    instantiated: false,
  });

  useEffect(() => {
    // for testing purposes this is hardcoded.
    const safeParams = ExchangeSchema.safeParse({
      fromAccountId: "1",
      fromAmount: "1",
      initFeeTotalValue: "1",
      provider: "test",
      quoteId: "1",
      rate: "1",
      toAccountId: "1",
      feeStrategy: "SLOW",
      customFeeConfig: null,
    });

    if (safeParams.success) {
      const sdk = new ExchangeSDK(safeParams.data.provider);
      setContextValue({
        instantiated: true,
        swap: () =>
          sdk.swap({
            quoteId: safeParams.data.quoteId ?? "123",
            fromAccountId: safeParams.data.fromAccountId,
            toAccountId: safeParams.data.toAccountId,
            fromAmount: safeParams.data.fromAmount,
            feeStrategy: safeParams.data.feeStrategy,
            rate: safeParams.data.rate ?? 0,
          }),
        walletAPI: sdk.walletAPI,
      });

      return () => sdk.disconnect();
    }
  }, [setContextValue]);

  return (
    <ExchangeContext.Provider value={contextValue}>
      {children}
    </ExchangeContext.Provider>
  );
}
