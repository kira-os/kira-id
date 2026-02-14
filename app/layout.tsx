import WalletProvider from './WalletProvider';
import './globals.css';

export const metadata = {
  title: 'KIRA ID - Connect',
  description: 'Universal identity for the KIRA ecosystem',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
