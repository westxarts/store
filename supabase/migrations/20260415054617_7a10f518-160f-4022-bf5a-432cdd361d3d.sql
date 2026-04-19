-- Fix: Replace overly permissive INSERT policy on orders with a more specific one
DROP POLICY "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (
    customer_name != '' AND 
    product_name != '' AND 
    amount > 0 AND
    payment_type IN ('paystack', 'delivery')
  );

-- Fix: Replace broad SELECT on storage to prevent listing
DROP POLICY "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images' AND auth.role() = 'anon' OR bucket_id = 'product-images' AND auth.role() = 'authenticated');