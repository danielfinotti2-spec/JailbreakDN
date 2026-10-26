import { useEffect, useState } from "react";

export const navigate = (to) => {
  history.pushState({}, "", to);
  window.dispatchEvent(new Event("pathchange"));
};

export const usePath = () => {
  const [p, setP] = useState(location.pathname);
  useEffect(() => {
    const f = () => setP(location.pathname);
    window.addEventListener("popstate", f);
    window.addEventListener("pathchange", f);
    return () => { window.removeEventListener("popstate", f); window.removeEventListener("pathchange", f); };
  }, []);
  return p;
};

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

// "#id" rola até a seção sem mexer na URL; "/caminho" troca de página sem recarregar
export const onNav = (e, to) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
  e.preventDefault();
  if (to.startsWith("#")) {
    if (location.pathname !== "/") { navigate("/"); setTimeout(() => scrollTo(to.slice(1)), 120); }
    else scrollTo(to.slice(1));
  } else navigate(to);
};

export const hrefOf = (to) => (to.startsWith("#") ? "/" : to);
