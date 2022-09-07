import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { FC, ReactNode } from 'react';

require('@solana/wallet-adapter-react-ui/styles.css')

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const endpoint = 'http://localhost:8899'
    const wallets = [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
    ]

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

export default WalletContextProvider