import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Side, OrderType } from "@polymarket/clob-client";
import type { ClobClient, UserOrder, UserMarketOrder } from "@polymarket/clob-client";

export type OrderParams = {
  tokenId: string;
  size: number;
  price?: number;
  side: "BUY" | "SELL";
  negRisk?: boolean;
  isMarketOrder?: boolean;
};

export default function useClobOrder(
  clobClient: ClobClient | null,
  walletAddress: string | undefined
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const submitOrder = useCallback(
    async (params: OrderParams) => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      if (!clobClient) {
        throw new Error("CLOB client not initialized");
      }

      setIsSubmitting(true);
      setError(null);
      setOrderId(null);

      try {
        const side = params.side === "BUY" ? Side.BUY : Side.SELL;
        let response;

        if (params.isMarketOrder) {
          let marketAmount: number;

          if (side === Side.BUY) {
            const priceResponse = await clobClient.getPrice(
              params.tokenId,
              Side.SELL
            );
            const askPrice = parseFloat(priceResponse.price);

            if (isNaN(askPrice) || askPrice <= 0 || askPrice >= 1) {
              throw new Error("Unable to get valid market price");
            }

            marketAmount = params.size * askPrice;
          } else {
            marketAmount = params.size;
          }

          const marketOrder: UserMarketOrder = {
            tokenID: params.tokenId,
            amount: marketAmount,
            side,
            feeRateBps: 0,
          };

          response = await clobClient.createAndPostMarketOrder(
            marketOrder,
            { negRisk: params.negRisk },
            OrderType.FOK
          );
        } else {
          if (!params.price) {
            throw new Error("Price required for limit orders");
          }

          const limitOrder: UserOrder = {
            tokenID: params.tokenId,
            price: params.price,
            size: params.size,
            side,
            feeRateBps: 0,
            expiration: 0,
            taker: "0x0000000000000000000000000000000000000000",
          };

          response = await clobClient.createAndPostOrder(
            limitOrder,
            { negRisk: params.negRisk },
            OrderType.GTC
          );
        }

        if (response.orderID) {
          setOrderId(response.orderID);
          queryClient.invalidateQueries({ queryKey: ["active-orders"] });
          queryClient.invalidateQueries({ queryKey: ["open-orders"] });
          queryClient.invalidateQueries({ queryKey: ["trade-history"] });
          queryClient.invalidateQueries({ queryKey: ["portfolio-value"] });
          return { success: true, orderId: response.orderID };
        } else {
          throw new Error("Order submission failed");
        }
      } catch (err: unknown) {
        const error =
          err instanceof Error ? err : new Error("Failed to submit order");
        setError(error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [clobClient, walletAddress, queryClient]
  );

  const cancelOrder = useCallback(
    async (orderIdToCancel: string) => {
      if (!clobClient) {
        throw new Error("CLOB client not initialized");
      }

      setIsSubmitting(true);
      setError(null);

      try {
        await clobClient.cancelOrder({ orderID: orderIdToCancel });
        queryClient.invalidateQueries({ queryKey: ["active-orders"] });
        queryClient.invalidateQueries({ queryKey: ["open-orders"] });
        return { success: true };
      } catch (err: unknown) {
        const error =
          err instanceof Error ? err : new Error("Failed to cancel order");
        setError(error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [clobClient, queryClient]
  );

  const cancelMultipleOrders = useCallback(
    async (orderIds: string[]) => {
      if (!clobClient) {
        throw new Error("CLOB client not initialized");
      }

      setIsSubmitting(true);
      setError(null);

      try {
        await clobClient.cancelOrders(orderIds);
        queryClient.invalidateQueries({ queryKey: ["active-orders"] });
        queryClient.invalidateQueries({ queryKey: ["open-orders"] });
        return { success: true };
      } catch (err: unknown) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to cancel orders");
        setError(error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [clobClient, queryClient]
  );

  const cancelAllOrders = useCallback(async () => {
    if (!clobClient) {
      throw new Error("CLOB client not initialized");
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await clobClient.cancelAll();
      queryClient.invalidateQueries({ queryKey: ["active-orders"] });
      queryClient.invalidateQueries({ queryKey: ["open-orders"] });
      return { success: true };
    } catch (err: unknown) {
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to cancel all orders");
      setError(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [clobClient, queryClient]);

  return {
    submitOrder,
    cancelOrder,
    cancelMultipleOrders,
    cancelAllOrders,
    isSubmitting,
    error,
    orderId,
  };
}
