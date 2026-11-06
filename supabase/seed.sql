INSERT INTO public.ticket_pricing (ticket_type, ticket_name, price, days_description, status)
VALUES
  ('weekday', 'Tiket Weekdays', 35000, 'Selasa–Jumat', 'active'),
  ('weekend', 'Tiket Weekend', 50000, 'Sabtu–Minggu', 'active')
ON CONFLICT (ticket_type) DO UPDATE
  SET ticket_name = EXCLUDED.ticket_name,
      price = EXCLUDED.price,
      days_description = EXCLUDED.days_description,
      status = EXCLUDED.status;

INSERT INTO public.facilities (facility_name, description, icon, display_order, status)
VALUES
  ('Kolam Ombak', 'Rasakan suasana bermain air dengan ombak buatan.', 'lucide:waves', 1, 'active'),
  ('Area Bajak Laut', 'Area bermain air bertema bajak laut untuk keluarga.', 'lucide:ship', 2, 'active'),
  ('Kolam Arus', 'Santai menyusuri kolam arus dan menikmati suasana waterpark.', 'lucide:move-horizontal', 3, 'active'),
  ('Wahana Seluncur', 'Pilihan seluncuran air untuk menambah keseruan bermain.', 'lucide:life-buoy', 4, 'active')
ON CONFLICT (display_order) DO UPDATE
  SET facility_name = EXCLUDED.facility_name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      status = EXCLUDED.status;

INSERT INTO public.promotions (promo_code, discount_type, discount_amount, start_date, end_date, status)
VALUES ('CITRALAND10', 'percentage', 10, CURRENT_DATE, CURRENT_DATE + 30, 'active')
ON CONFLICT (promo_code) DO NOTHING;

UPDATE public.gallery_images AS existing
SET image_url = images.image_url,
    caption = images.caption,
    display_order = images.display_order,
    status = 'published'
FROM images
WHERE existing.caption = images.caption;

WITH images(image_url, caption, display_order) AS (
  VALUES
  ('/images/waterpark-hero.webp', 'Citraland Waterpark Denpasar', 1),
  ('/images/gallery-pirate-pool.jpg', 'Kolam bermain bertema bajak laut', 2),
  ('/images/gallery-water-slide.jpg', 'Area seluncuran air anak', 3),
  ('/images/gallery-entrance.jpg', 'Pintu masuk Citraland Waterpark', 4),
  ('/images/gallery-pirate-statue.jpg', 'Dekorasi bajak laut di area waterpark', 5)
)
INSERT INTO public.gallery_images (image_url, caption, display_order, status)
SELECT images.image_url, images.caption, images.display_order, 'published'
FROM images
WHERE NOT EXISTS (
  SELECT 1 FROM public.gallery_images AS existing
  WHERE existing.image_url = images.image_url
);

INSERT INTO public.admin_users (email, full_name, role)
VALUES ('email-akun-anda@example.com', 'Nama Admin', 'super_admin')
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- Create sample bookings through the application or a trusted service-role
-- workflow so the booking validation trigger and payment flow remain in effect.
