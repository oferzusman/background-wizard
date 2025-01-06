import { BrowserRouter } from "react-router-dom";
import { Providers } from "./providers";

export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Providers>
      <BrowserRouter>{children}</BrowserRouter>
    </Providers>
  );
};