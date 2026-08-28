-- Zehn Zonen im 6x3-Raster des Deckels. Das Apple-Logo liegt auf Zeile 2,
-- Spalte 3-4 und wird nicht verkauft.

insert into settings (id, auction_ends_at, device_specs, device_note)
values (
  1,
  now() + interval '14 days',
  '[["Chip","Apple M5 — 10-core CPU, 10-core GPU, 16-core Neural Engine"],
    ["Memory","32 GB unified"],
    ["Storage","1 TB SSD"],
    ["Display","14.2” Liquid Retina XDR, standard glass"],
    ["Keyboard","Backlit Magic Keyboard with Touch ID"],
    ["In the box","No power adapter"]]'::jsonb,
  'Anything raised past the goal pays for the trips the Mac goes on.'
)
on conflict (id) do nothing;

insert into spots (id, label, size, dims, grid_area, start_price_cents, sort_order) values
  (1,  'Top left banner',              'L', '9.5 × 5.5 cm', '1 / 1 / auto / span 2', 40000, 1),
  (2,  'Marquee — above the logo',     'L', '9.5 × 5.5 cm', '1 / 3 / auto / span 2', 60000, 2),
  (3,  'Top right banner',             'L', '9.5 × 5.5 cm', '1 / 5 / auto / span 2', 40000, 3),
  (4,  'Middle left',                  'S', '4.5 × 4.5 cm', '2 / 1 / auto / span 1', 12500, 4),
  (5,  'Inner left — beside the logo', 'S', '4.5 × 4.5 cm', '2 / 2 / auto / span 1', 20000, 5),
  (6,  'Inner right — beside the logo','S', '4.5 × 4.5 cm', '2 / 5 / auto / span 1', 20000, 6),
  (7,  'Middle right',                 'S', '4.5 × 4.5 cm', '2 / 6 / auto / span 1', 12500, 7),
  (8,  'Bottom left strip',            'M', '9.5 × 4 cm',   '3 / 1 / auto / span 2', 20000, 8),
  (9,  'Bottom center — under the logo','M','9.5 × 4 cm',   '3 / 3 / auto / span 2', 30000, 9),
  (10, 'Bottom right strip',           'M', '9.5 × 4 cm',   '3 / 5 / auto / span 2', 20000, 10)
on conflict (id) do nothing;
