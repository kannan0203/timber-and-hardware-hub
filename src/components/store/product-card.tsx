import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoreCart } from "@/hooks/use-store-cart";
import { formatRupees, productEffectivePrice, type CatalogProduct } from "@/lib/store.types";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { add } = useStoreCart();
  const hasDiscount = product.discount_price != null && product.discount_price < product.price;
  return (
    <article className="product-card">
      <Link to="/products/$id" params={{ id: product.id }} className="product-card-media" aria-label={`View ${product.name}`}>
        <img src={product.image_url} alt={product.name} loading="lazy" />
        {product.is_demo && <span className="product-flag demo">Demo price</span>}
        {hasDiscount && <span className="product-flag discount">Offer</span>}
      </Link>
      <div className="product-card-body">
        <p className="product-card-category">{product.category_name}</p>
        <h3>
          <Link to="/products/$id" params={{ id: product.id }}>{product.name}</Link>
        </h3>
        <div className="price-row">
          <span className="price-current">{formatRupees(productEffectivePrice(product))}</span>
          {hasDiscount && <span className="price-original">{formatRupees(product.price)}</span>}
          <span className="price-unit">/ {product.unit}</span>
        </div>
        <Button size="sm" variant="secondary" className="mt-1 self-start" onClick={() => add(product.id, 1, product.stock_quantity)}>
          <ShoppingBag size={15} /> Add to cart
        </Button>
      </div>
    </article>
  );
}
