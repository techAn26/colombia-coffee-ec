-- ============================================
-- Demo Data: コロンビアのスペシャリティコーヒー豆
-- ============================================

-- カテゴリID取得
DO $$
DECLARE
  coffee_cat_id uuid;
  p1_id uuid;
  p2_id uuid;
  p3_id uuid;
  p4_id uuid;
  p5_id uuid;
BEGIN
  SELECT id INTO coffee_cat_id FROM categories WHERE slug = 'coffee-beans';

  -- 商品1: コロンビア ウィラ エル・パライソ農園
  INSERT INTO products (id, category_id, name, description, origin, farm_name, farm_story, roast_level, process, altitude, flavor_notes, image_url, is_published)
  VALUES (
    gen_random_uuid(), coffee_cat_id,
    'コロンビア ウィラ エル・パライソ農園',
    'コロンビア南部ウィラ県の標高1,800mに位置するエル・パライソ農園から届く、フルーティーで華やかなスペシャリティコーヒー。ダブルアナエロビック製法による独特のフレーバーが特徴です。',
    'コロンビア ウィラ県',
    'エル・パライソ農園',
    'エル・パライソ農園は、ウィラ県ピタリート市の山あいにある家族経営の農園です。農園主のウィルトン・ベニテス氏は、3代目の生産者。「コーヒーは土地の記憶を伝える飲み物だ」という信念のもと、テロワールを最大限に引き出す精製方法を追求しています。近年注目のダブルアナエロビック製法を取り入れ、国際品評会でも高い評価を得ています。',
    'medium',
    'ダブルアナエロビック',
    '1,700-1,900m',
    ARRAY['トロピカルフルーツ', 'ジャスミン', 'ハニー', 'ワイン'],
    NULL,
    true
  ) RETURNING id INTO p1_id;

  -- 商品2: コロンビア ナリーニョ ラ・エスメラルダ農園
  INSERT INTO products (id, category_id, name, description, origin, farm_name, farm_story, roast_level, process, altitude, flavor_notes, image_url, is_published)
  VALUES (
    gen_random_uuid(), coffee_cat_id,
    'コロンビア ナリーニョ ラ・エスメラルダ農園',
    'コロンビア南西部ナリーニョ県の高地で育てられたウォッシュドコーヒー。クリーンな味わいの中に、柑橘系の明るい酸味とチョコレートのような甘さが調和した一杯です。',
    'コロンビア ナリーニョ県',
    'ラ・エスメラルダ農園',
    'ラ・エスメラルダ農園は、エクアドルとの国境近く、標高2,000m級の険しい山岳地帯にあります。農園主のマリア・ルイーサさんは、この地域で初めてスペシャリティコーヒーに取り組んだ女性生産者。「高地の厳しい環境だからこそ、コーヒーチェリーはゆっくり熟し、複雑な風味を蓄える」と語ります。丁寧なウォッシュド製法で、クリーンで透明感のある味わいに仕上げています。',
    'light',
    'ウォッシュド',
    '1,900-2,100m',
    ARRAY['オレンジ', 'ダークチョコレート', 'キャラメル', 'フローラル'],
    NULL,
    true
  ) RETURNING id INTO p2_id;

  -- 商品3: コロンビア ウィラ サン・アグスティン
  INSERT INTO products (id, category_id, name, description, origin, farm_name, farm_story, roast_level, process, altitude, flavor_notes, image_url, is_published)
  VALUES (
    gen_random_uuid(), coffee_cat_id,
    'コロンビア ウィラ サン・アグスティン',
    '世界遺産の街サン・アグスティン近郊の小規模農家グループが作るナチュラルコーヒー。完熟チェリーを天日干しすることで生まれる、ベリー系のジューシーな甘さが魅力です。',
    'コロンビア ウィラ県 サン・アグスティン',
    'サン・アグスティン小農家組合',
    'サン・アグスティンは古代遺跡で知られる世界遺産の街。その周辺の山々で、10家族の小規模農家がコーヒーを栽培しています。彼らは「コーヒーで子どもたちに教育の機会を」を合言葉に、品質向上に取り組んでいます。ナチュラル製法は手間がかかりますが、丁寧に乾燥させることで他にはない果実味豊かなコーヒーに仕上がります。',
    'medium',
    'ナチュラル',
    '1,600-1,800m',
    ARRAY['ストロベリー', 'ブルーベリー', 'ダークチョコレート', 'スパイス'],
    NULL,
    true
  ) RETURNING id INTO p3_id;

  -- 商品4: コロンビア カウカ ポパヤン
  INSERT INTO products (id, category_id, name, description, origin, farm_name, farm_story, roast_level, process, altitude, flavor_notes, image_url, is_published)
  VALUES (
    gen_random_uuid(), coffee_cat_id,
    'コロンビア カウカ ポパヤン',
    'コロンビア南西部カウカ県の古都ポパヤン周辺で栽培されたハニープロセスのコーヒー。蜂蜜のような甘さとナッツの香ばしさが特徴の、バランスの取れた一杯です。',
    'コロンビア カウカ県 ポパヤン',
    'ロス・アンデス農園',
    'ロス・アンデス農園は、植民地時代の街並みが残る白い街ポパヤンの郊外にあります。農園主のカルロス・エレーラ氏は元エンジニア。都市の仕事を辞め、祖父の農園を継いだ異色の生産者です。「科学的なアプローチと伝統的な農法の融合」をテーマに、ハニープロセスの精度を追求しています。',
    'dark',
    'ハニー',
    '1,700-1,850m',
    ARRAY['ハニー', 'アーモンド', 'ブラウンシュガー', 'プラム'],
    NULL,
    true
  ) RETURNING id INTO p4_id;

  -- 商品5: コロンビア シエラネバダ デカフェ
  INSERT INTO products (id, category_id, name, description, origin, farm_name, farm_story, roast_level, process, altitude, flavor_notes, image_url, is_published)
  VALUES (
    gen_random_uuid(), coffee_cat_id,
    'コロンビア シエラネバダ デカフェ',
    'カリブ海沿岸のシエラネバダ山脈で栽培された豆を、スイスウォータープロセスでカフェインを除去。デカフェとは思えないしっかりとしたボディとチョコレート感が楽しめます。',
    'コロンビア マグダレナ県 シエラネバダ',
    'シエラネバダ先住民組合',
    'シエラネバダ・デ・サンタマルタは世界で最も高い海岸山脈。ここでは先住民アルワコ族が、自然との共生を大切にしながらコーヒーを栽培しています。化学肥料を一切使わない有機栽培で、環境を守りながら高品質なコーヒーを生産。カフェインを除去しても風味が損なわれないよう、スイスウォータープロセスを採用しています。',
    'medium',
    'ウォッシュド（デカフェ: スイスウォータープロセス）',
    '1,400-1,700m',
    ARRAY['ミルクチョコレート', 'ナッツ', 'キャラメル', 'バニラ'],
    NULL,
    true
  ) RETURNING id INTO p5_id;

  -- バリエーション: 各商品に200g, 500g, 1kgの3バリエーション
  -- 商品1
  INSERT INTO product_variants (product_id, label, weight_g, price, stock, sort_order) VALUES
    (p1_id, '200g', 200, 1800, 50, 1),
    (p1_id, '500g', 500, 4200, 30, 2),
    (p1_id, '1kg', 1000, 7800, 10, 3);

  -- 商品2
  INSERT INTO product_variants (product_id, label, weight_g, price, stock, sort_order) VALUES
    (p2_id, '200g', 200, 1600, 40, 1),
    (p2_id, '500g', 500, 3800, 25, 2),
    (p2_id, '1kg', 1000, 7000, 15, 3);

  -- 商品3
  INSERT INTO product_variants (product_id, label, weight_g, price, stock, sort_order) VALUES
    (p3_id, '200g', 200, 1500, 60, 1),
    (p3_id, '500g', 500, 3500, 35, 2),
    (p3_id, '1kg', 1000, 6500, 20, 3);

  -- 商品4
  INSERT INTO product_variants (product_id, label, weight_g, price, stock, sort_order) VALUES
    (p4_id, '200g', 200, 1400, 45, 1),
    (p4_id, '500g', 500, 3200, 30, 2),
    (p4_id, '1kg', 1000, 5800, 15, 3);

  -- 商品5
  INSERT INTO product_variants (product_id, label, weight_g, price, stock, sort_order) VALUES
    (p5_id, '200g', 200, 1700, 35, 1),
    (p5_id, '500g', 500, 4000, 20, 2),
    (p5_id, '1kg', 1000, 7200, 10, 3);
END $$;
