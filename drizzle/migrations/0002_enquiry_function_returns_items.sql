DROP FUNCTION public.submit_store_enquiry(uuid, text, text, text, text, text, jsonb);

CREATE FUNCTION public.submit_store_enquiry(p_idempotency_key uuid, p_customer_name text, p_phone text, p_fulfillment text, p_delivery_address text, p_notes text, p_items jsonb)
 RETURNS TABLE(reference_code text, subtotal numeric, items jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  clean_name text := btrim(p_customer_name);
  clean_phone text := regexp_replace(coalesce(p_phone, ''), '[[:space:]().-]', '', 'g');
  item_count integer;
  resolved_items jsonb;
  resolved_total numeric(12,2);
  new_reference text;
BEGIN
  IF clean_name IS NULL OR length(clean_name) < 2 OR length(clean_name) > 100 THEN
    RAISE EXCEPTION 'Please enter a name between 2 and 100 characters.' USING ERRCODE = '22023';
  END IF;
  IF clean_phone !~ '^\+?[0-9]{10,15}$' THEN
    RAISE EXCEPTION 'Please enter a valid mobile number.' USING ERRCODE = '22023';
  END IF;
  IF p_fulfillment NOT IN ('delivery', 'collection') THEN
    RAISE EXCEPTION 'Please choose delivery or collection.' USING ERRCODE = '22023';
  END IF;
  IF p_fulfillment = 'delivery' AND (p_delivery_address IS NULL OR length(btrim(p_delivery_address)) < 5 OR length(btrim(p_delivery_address)) > 500) THEN
    RAISE EXCEPTION 'Please enter a delivery address between 5 and 500 characters.' USING ERRCODE = '22023';
  END IF;
  IF p_notes IS NOT NULL AND length(p_notes) > 1000 THEN
    RAISE EXCEPTION 'Order notes must be 1000 characters or fewer.' USING ERRCODE = '22023';
  END IF;
  IF p_idempotency_key IS NULL OR p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'Please review your cart and try again.' USING ERRCODE = '22023';
  END IF;
  item_count := jsonb_array_length(p_items);
  IF item_count < 1 OR item_count > 30 THEN
    RAISE EXCEPTION 'Your enquiry must contain between 1 and 30 products.' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_items) AS item
    WHERE (item->>'id') IS NULL
      OR (item->>'id') !~* '^[0-9a-f-]{36}$'
      OR (item->>'quantity') IS NULL
      OR (item->>'quantity') !~ '^[0-9]{1,4}$'
      OR (item->>'quantity')::integer < 1
      OR (item->>'quantity')::integer > 999
  ) THEN
    RAISE EXCEPTION 'One or more product quantities are invalid.' USING ERRCODE = '22023';
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
      'id', p.id,
      'sku', p.sku,
      'name', p.name,
      'unit', p.unit,
      'quantity', requested.quantity,
      'unit_price', COALESCE(p.discount_price, p.price),
      'line_total', COALESCE(p.discount_price, p.price) * requested.quantity
    ) ORDER BY p.name),
    sum(COALESCE(p.discount_price, p.price) * requested.quantity)::numeric(12,2)
  INTO resolved_items, resolved_total
  FROM (
    SELECT (item->>'id')::uuid AS product_id, (item->>'quantity')::integer AS quantity
    FROM jsonb_array_elements(p_items) AS item
  ) AS requested
  JOIN public.store_products AS p ON p.id = requested.product_id AND p.is_available = true
  JOIN public.store_categories AS c ON c.id = p.category_id AND c.is_active = true;

  IF jsonb_array_length(resolved_items) <> item_count THEN
    RAISE EXCEPTION 'A product is no longer available. Please refresh your cart.' USING ERRCODE = '22023';
  END IF;

  SELECT e.reference_code, e.subtotal, e.items INTO reference_code, subtotal, items
  FROM public.store_enquiries e WHERE e.idempotency_key = p_idempotency_key;
  IF FOUND THEN
    RETURN NEXT;
    RETURN;
  END IF;

  new_reference := 'AMM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  INSERT INTO public.store_enquiries (
    reference_code, idempotency_key, customer_name, phone, fulfillment,
    delivery_address, notes, items, subtotal
  ) VALUES (
    new_reference, p_idempotency_key, clean_name, clean_phone, p_fulfillment,
    CASE WHEN p_fulfillment = 'delivery' THEN btrim(p_delivery_address) ELSE NULL END,
    coalesce(btrim(p_notes), ''), resolved_items, resolved_total
  ) ON CONFLICT (idempotency_key) DO NOTHING;

  SELECT e.reference_code, e.subtotal, e.items INTO reference_code, subtotal, items
  FROM public.store_enquiries e WHERE e.idempotency_key = p_idempotency_key;
  RETURN NEXT;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.submit_store_enquiry(uuid, text, text, text, text, text, jsonb) TO anon, authenticated;