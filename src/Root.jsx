import { useEffect } from "react";
import App from "./App";
import Shop from "./components/Shop";
import { PRODUCTS } from "./products";
import { usePath } from "./lib/nav";

export default function Root() {
  const path = usePath();
  const shop = path.startsWith("/produtos");
  const ok = shop && PRODUCTS.length > 0;
  useEffect(() => { if (shop && !ok) history.replaceState({}, "", "/"); }, [shop, ok]);
  useEffect(() => { window.scrollTo(0, 0); }, [path]);
  return ok ? <Shop path={path} /> : <App />;
}
