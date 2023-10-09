import { FeeStrategy } from "@ledgerhq/exchange-sdk";
import BigNumber from "bignumber.js";
import { z } from "zod";

const ZBigNumber = () =>
  z.preprocess(
    (arg: unknown) => {
      if (arg instanceof BigNumber) {
        return arg;
      }

      const num = new BigNumber(arg as BigNumber.Value);
      if (num.isNaN()) {
        return arg;
      }
      return num;
    },
    z.custom<BigNumber>((arg: unknown) => arg instanceof BigNumber)
  );

const ExchangeSchemaBase = z.object({
  fromAccountId: z.string(),
  fromAmount: ZBigNumber(),
  initFeeTotalValue: ZBigNumber(),
  provider: z.string(),
  quoteId: z.string().nullable(),
  rate: z.preprocess((arg: unknown) => Number(arg), z.number()),
  toAccountId: z.string(),
});

const ExchangeSchemaCustomFee = z
  .object({
    feeStrategy: z.literal<FeeStrategy>("CUSTOM"),
    customFeeConfig: z.preprocess((arg: unknown) => {
      if (typeof arg === "string") {
        return JSON.parse(arg);
      }
      return null;
    }, z.record(z.string(), ZBigNumber())),
  })
  .merge(ExchangeSchemaBase);

const ExchangeSchemaNormalFee = (fee: FeeStrategy) =>
  z
    .object({
      feeStrategy: z.literal<FeeStrategy>(fee),
    })
    .merge(ExchangeSchemaBase);

export const ExchangeSchema = z.discriminatedUnion("feeStrategy", [
  ExchangeSchemaCustomFee,
  ExchangeSchemaNormalFee("FAST"),
  ExchangeSchemaNormalFee("MEDIUM"),
  ExchangeSchemaNormalFee("SLOW"),
]);

export type ExchangeSwapType = z.infer<typeof ExchangeSchema>;
