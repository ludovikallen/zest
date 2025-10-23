import * as signalR from "@microsoft/signalr";
import {
  getHubProxyFactory,
  getReceiverRegister,
  HubProxyFactoryProvider,
  ReceiverRegisterProvider,
  type HubProxyFactory,
  type ReceiverRegister,
} from "./TypedSignalR.Client";
import { useEffect, useRef, useState } from "react";

export interface UseSignalRHubOptions {
  /**
   * The base URL for the SignalR hub
   */
  baseUrl: string;
  /**
   * The hub endpoint path (e.g., '/chathub')
   */
  hubPath: string;
}

export interface UseSignalRHubResult<THub extends AvailableHubs> {
  /**
   * The hub proxy for sending messages
   */
  hub: THub | null;
  /**
   * Any connection error that occurred
   */
  error: Error | null;

  /**
   * Whether the hub connection is in progress
   */
  isConnecting: boolean;

  /**
   * Whether the hub connection is established
   */
  isConnected: boolean;
}

type HubNames = Parameters<HubProxyFactoryProvider>[0];
type ReceiverNames = Parameters<ReceiverRegisterProvider>[0];
type ExtractReceivers<T> = T extends ReceiverRegister<infer R> ? R : never;
type AvailableReceivers = ExtractReceivers<
  ReturnType<ReceiverRegisterProvider>
>;
type ExtractHubs<T> = T extends HubProxyFactory<infer R> ? R : never;
type AvailableHubs = ExtractHubs<ReturnType<HubProxyFactoryProvider>>;

/**
 * Generic hook for TypedSignalR hubs with type safety
 *
 * @example
 * ```typescript
 * // For a custom hub
 * const { hub, isConnected, isConnecting, error } = useSignalRHub(
 *   "IMyHub",
 *   "IMyReceiver",
 *   {
 *     // receiver implementation
 *     onMessageReceived: (message: string) => {
 *       console.log('Received:', message);
 *     }
 *   },
 *   {
 *     baseUrl: 'https://localhost:7138',
 *     hubPath: '/myhub'
 *   }
 * );
 * ```
 *
 * @param hubName - Name of the hub to connect to
 * @param receiverName - Name of the receiver to register
 * @param receiver - Receiver implementation for handling incoming messages
 * @param options - Configuration options
 * @returns Hub connection utilities and state
 */
export function useSignalRHub<THub extends AvailableHubs>(
  hubName: HubNames,
  receiverName: ReceiverNames,
  receiver: AvailableReceivers,
  options: UseSignalRHubOptions
): UseSignalRHubResult<THub> {
  const [hub, setHub] = useState<THub | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // keep stable receiver reference
  const receiverRef = useRef(receiver);
  receiverRef.current = receiver;

  useEffect(() => {
    setIsConnecting(true);
    setIsConnected(false);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(options.baseUrl + options.hubPath)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None)
      .build();

    const hubProxy = getHubProxyFactory(hubName).createHubProxy(connection);
    const subscription = getReceiverRegister(receiverName).register(
      connection,
      receiverRef.current
    );

    setHub(hubProxy as THub);

    connection
      .start()
      .then(() => {
        setIsConnected(true);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsConnecting(false);
      });

    return () => {
      subscription.dispose();
      connection.stop();
    };
  }, [options.baseUrl, options.hubPath, hubName, receiverName]);

  return { hub, error, isConnecting, isConnected };
}
