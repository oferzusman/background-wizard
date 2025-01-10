import { Providers } from "./providers";

export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return <Providers>{children}</Providers>;
};