import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Menu, Phone, ShoppingBag, Trees, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoreCart } from "@/hooks/use-store-cart";
import { businessPhone, shopAddress } from "@/lib/store.types";

const navigation = [
  { label: "All products", to: "/products" as const },
  { label: "Timber & plywood", to: "/timber" as const },
  { label: "Doors & frames", to: "/doors" as const },
  { label: "Hardware", to: "/hardware" as const },
  { label: "Paints & tools", to: "/paints-tools" as const },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, signedIn } = useStoreCart();
  return (
    <>
      <div className="announcement-bar"><span>Timber, plywood, doors & everyday hardware</span><a href={`https://wa.me/${businessPhone}`} target="_blank" rel="noreferrer">Ask us on WhatsApp <ArrowUpRight size={14} /></a></div>
      <header className="site-header">
        <div className="header-main shell-width">
          <Link to="/" className="brand-lockup" aria-label="Sri Amman and Senthivelan Hardwares home">
            <span className="brand-symbol"><Trees size={22} strokeWidth={1.6} /></span>
            <span className="brand-type"><strong>Sri Amman</strong><small>Marailaipagam</small><span>&</span><strong>Senthivelan Hardwares</strong></span>
          </Link>
          <form className="header-search" action="/products" method="get">
            <label className="sr-only" htmlFor="store-search">Search products</label>
            <input id="store-search" name="q" placeholder="Search timber, tools, fittings…" />
            <button type="submit" aria-label="Search products"><span className="search-mark" /></button>
          </form>
          <div className="header-actions">
            <Link to={signedIn ? "/admin" : "/admin-login"} className="owner-link">{signedIn ? "Owner desk" : "Owner sign in"}</Link>
            <Link to="/cart" className="cart-icon-link" aria-label={`Shopping cart, ${itemCount} items`}>
              <ShoppingBag size={20} strokeWidth={1.8} /><span className="cart-count">{itemCount}</span>
            </Link>
            <Button variant="ghost" size="icon" className="menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        <nav className={`category-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          <div className="shell-width category-nav-inner">
            {navigation.map((item) => <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
            <div className="nav-extra"><Link to="/about">About</Link><Link to="/contact">Contact</Link></div>
          </div>
        </nav>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell-width footer-main">
        <div className="footer-brand"><div className="footer-brand-title"><Trees size={21} /><span>Sri Amman <em>&</em> Senthivelan</span></div><p>Timber, plywood, doors and hardware supplies.</p></div>
        <div className="footer-column"><h3>Explore</h3><Link to="/products">All products</Link><Link to="/timber">Timber & plywood</Link><Link to="/doors">Doors & frames</Link><Link to="/hardware">Hardware</Link><Link to="/paints-tools">Paints & tools</Link></div>
        <div className="footer-column"><h3>Information</h3><Link to="/about">About us</Link><Link to="/contact">Contact</Link><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms & conditions</Link><Link to="/admin-login">Owner sign in</Link></div>
        <div className="footer-column footer-contact"><h3>Visit or call</h3><p>{shopAddress}</p><a href={`tel:+${businessPhone}`}><Phone size={15} /> +91 63857 43172</a><a className="footer-whatsapp" href={`https://wa.me/${businessPhone}`} target="_blank" rel="noreferrer">WhatsApp the shop <ArrowUpRight size={14} /></a></div>
      </div>
      <div className="footer-bottom shell-width"><span>© {new Date().getFullYear()} Sri Amman Marailaipagam & Senthivelan Hardwares</span><span>Preview storefront · Prices marked DEMO are illustrative only</span></div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className="store-site"><SiteHeader /><main>{children}</main><SiteFooter /></div>;
}