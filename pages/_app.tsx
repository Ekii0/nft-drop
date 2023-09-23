import { ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      activeChain={"binance"}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_API}
    >
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
