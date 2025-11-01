// components/simple-connect-button.tsx
import { ConnectButton, darkTheme } from "thirdweb/react";
import { client as sharedClient } from "@/lib/thirdweb";
import { createWallet } from "thirdweb/wallets";

// Use shared client configured via env (no insecure fallbacks)
const client = sharedClient;

// Define available wallets
const wallets = [
  createWallet("com.coinbase.wallet"),
  createWallet("io.metamask"),
  createWallet("walletConnect"),
  createWallet("com.trustwallet.app"),
];

// Main ConnectButton component with SIWE authentication
export default function SimpleConnectButton() {
  return (
    <ConnectButton
      client={client}
      auth={{
        async getLoginPayload({ address }) {
          // Call backend to get SIWE message payload
          // Address is extracted from params per Thirdweb docs
          try {
            if (!address) {
              throw new Error('Wallet address is required');
            }

            const response = await fetch(
              `/api/auth/siwe?address=${encodeURIComponent(address)}`
            );
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              const errorMessage = errorData.error || `Failed to get login payload: ${response.status}`;
              console.error('API error:', errorMessage, { status: response.status, address });
              throw new Error(errorMessage);
            }
            
            const data = await response.json();
            
            if (!data || !data.payload) {
              console.error('Invalid API response:', data);
              throw new Error('Invalid response: payload is missing');
            }
            
            return data.payload;
          } catch (error) {
            console.error('Error getting login payload:', error);
            throw error;
          }
        },
        async doLogin(params) {
          // Thirdweb provides payload and signature - pass directly to backend
          // Address is extracted from signature by backend
          try {
            if (!params.payload || !params.signature) {
              throw new Error('Missing payload or signature from wallet');
            }

            const response = await fetch('/api/auth/siwe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: params.payload,
                signature: params.signature,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || `Login failed: ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
              throw new Error(data.error || 'Login failed');
            }
          } catch (error) {
            console.error('Error during login:', error);
            throw error;
          }
        },
        async isLoggedIn() {
          // Check if user has valid session
          try {
            const response = await fetch('/api/auth/session', {
              credentials: 'include', // Include cookies
            });
            
            if (!response.ok) {
              return false;
            }
            
            const data = await response.json();
            return data?.isLoggedIn === true;
          } catch (error) {
            console.error('Error checking session:', error);
            return false;
          }
        },
        async doLogout() {
          // Clear session on logout
          await fetch('/api/auth/session', { method: 'DELETE' });
        },
      }}
      connectButton={{ label: "CONNECT" }}
      connectModal={{
        privacyPolicyUrl: "https://retinaldelights.io/privacy",
        size: "compact",
        termsOfServiceUrl: "https://retinaldelights.io/terms",
      }}
      theme={darkTheme({
        colors: {
          accentText: "hsl(324, 100%, 50%)",
          accentButtonBg: "hsl(324, 100%, 50%)",
          danger: "hsl(0, 100%, 55%)",
          success: "hsl(142, 92%, 53%)",
          tooltipText: "hsl(48, 100%, 96%)",
          primaryText: "hsl(48, 100%, 96%)",
          selectedTextBg: "hsl(48, 100%, 96%)",
          primaryButtonBg: "hsl(324, 100%, 50%)",
          secondaryButtonText: "hsl(48, 100%, 96%)",
          accentButtonText: "hsl(48, 100%, 96%)",
          secondaryIconHoverColor: "hsl(48, 100%, 96%)",
          modalBg: "hsl(0, 0%, 2%)",
          borderColor: "hsl(324, 100%, 50%)",
          separatorLine: "hsl(0, 0%, 15%)",
          tertiaryBg: "hsl(0, 0%, 4%)",
          skeletonBg: "hsl(0, 0%, 15%)",
          secondaryText: "hsl(48, 100%, 96%)",
          secondaryButtonBg: "hsl(0, 0%, 9%)",
          secondaryButtonHoverBg: "hsl(0, 0%, 9%)",
          connectedButtonBg: "hsl(0, 0%, 4%)",
          connectedButtonBgHover: "hsl(0, 0%, 9%)",
          secondaryIconColor: "hsl(218, 11%, 65%)",
          scrollbarBg: "hsl(0, 0%, 9%)",
          inputAutofillBg: "hsl(0, 0%, 9%)",
          tooltipBg: "hsl(0, 0%, 9%)",
          secondaryIconHoverBg: "hsl(0, 0%, 9%)",
          primaryButtonText: "hsl(48, 100%, 96%)",
        },
      })}
      wallets={wallets}
    />
  );
}
