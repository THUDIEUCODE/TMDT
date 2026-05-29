import { createContext, useContext, useState, ReactNode } from "react";

export type Screen =
  | "home"
  | "category"
  | "product"
  | "cart"
  | "checkout-address"
  | "checkout-payment"
  | "order-confirm"
  | "login"
  | "register"
  | "account"
  | "tracking"
  | "return"
  | "blog"
  | "blog-detail"
  | "combo-builder"
  | "staff-dashboard"
  | "staff-orders"
  | "staff-products"
  | "staff-inventory"
  | "staff-reviews"
  | "staff-blog"
  | "staff-returns"
  | "admin-dashboard"
  | "admin-accounts"
  | "admin-vouchers";

export type Role = "customer" | "staff" | "admin";

interface RouterCtx {
  screen: Screen;
  navigate: (s: Screen) => void;
  role: Role;
  setRole: (r: Role) => void;
}

const Ctx = createContext<RouterCtx>({} as RouterCtx);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("home");
  const [role, setRole] = useState<Role>("customer");

  const navigate = (s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  };

  return <Ctx.Provider value={{ screen, navigate, role, setRole }}>{children}</Ctx.Provider>;
}

export const useRouter = () => useContext(Ctx);
