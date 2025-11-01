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
            const response = await fetch(
              `/api/auth/siwe?address=${encodeURIComponent(address)}`
            );
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || `Failed to get login payload: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.payload) {
              throw new Error('Invalid response: payload is missing');
            }
            
            return data.payload;
          } catch (error) {
            console.error('Error getting login payload:', error);
            throw error;
          }
        },
        async doLogin(params) {
          // Call backend to verify signature and create session
          // params contains: payload (the SIWE message) and signature
          // Extract address from the SIWE message payload
          const payload = typeof params.payload === 'string' 
            ? params.payload 
            : String(params.payload);
          const signature = typeof params.signature === 'string'
            ? params.signature
            : String(params.signature);
          
          // Extract address from SIWE message (format: "domain wants...\n0x...\n...")
          // SIWE format: second line contains the Ethereum address
          const lines = payload.split('\n');
          const address = lines.length > 1 && lines[1].trim().startsWith('0x')
            ? lines[1].trim()
            : '';
          
          const response = await fetch('/api/auth/siwe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: payload,
              signature: signature,
              address: address,
            }),
          });
          const data = await response.json();
          if (!data.success) {
            throw new Error(data.error || 'Login failed');
          }
        },
        async isLoggedIn() {
          // Check if user has valid session
          const response = await fetch('/api/auth/session');
          const data = await response.json();
          return data.isLoggedIn || false;
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
