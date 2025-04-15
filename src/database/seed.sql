-- 插入测试用户
INSERT INTO users (username, email, password_hash, avatar, phone, role, status) VALUES
('admin', 'admin@example.com', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iq.7ZxZxZxZxZ', 'https://example.com/avatar1.jpg', '13800138000', 'admin', 'active'),
('user1', 'user1@example.com', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iq.7ZxZxZxZxZ', 'https://example.com/avatar2.jpg', '13800138001', 'user', 'active'),
('user2', 'user2@example.com', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iq.7ZxZxZxZxZ', 'https://example.com/avatar3.jpg', '13800138002', 'user', 'active'),
('user3', 'user3@example.com', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iq.7ZxZxZxZxZ', 'https://example.com/avatar4.jpg', '13800138003', 'user', 'active');

-- 插入农产品分类
INSERT INTO categories (name, description, parent_id, level, sort_order) VALUES
('水果', '新鲜水果', NULL, 1, 1),
('蔬菜', '新鲜蔬菜', NULL, 1, 2),
('粮油', '米面粮油', NULL, 1, 3),
('肉类', '生鲜肉类', NULL, 1, 4),
('水产', '海鲜水产', NULL, 1, 5),
('时令水果', '应季水果', (SELECT id FROM categories WHERE name = '水果'), 2, 1),
('进口水果', '进口优质水果', (SELECT id FROM categories WHERE name = '水果'), 2, 2),
('叶菜类', '绿叶蔬菜', (SELECT id FROM categories WHERE name = '蔬菜'), 2, 1),
('根茎类', '根茎类蔬菜', (SELECT id FROM categories WHERE name = '蔬菜'), 2, 2),
('菌菇类', '食用菌菇', (SELECT id FROM categories WHERE name = '蔬菜'), 2, 3),
('大米', '优质大米', (SELECT id FROM categories WHERE name = '粮油'), 2, 1),
('面粉', '各类面粉', (SELECT id FROM categories WHERE name = '粮油'), 2, 2),
('食用油', '食用植物油', (SELECT id FROM categories WHERE name = '粮油'), 2, 3),
('猪肉', '新鲜猪肉', (SELECT id FROM categories WHERE name = '肉类'), 2, 1),
('牛肉', '优质牛肉', (SELECT id FROM categories WHERE name = '肉类'), 2, 2),
('羊肉', '新鲜羊肉', (SELECT id FROM categories WHERE name = '肉类'), 2, 3),
('鱼类', '淡水鱼类', (SELECT id FROM categories WHERE name = '水产'), 2, 1),
('虾类', '虾类水产', (SELECT id FROM categories WHERE name = '水产'), 2, 2),
('贝类', '贝类水产', (SELECT id FROM categories WHERE name = '水产'), 2, 3);

-- 插入农产品
INSERT INTO products (category_id, name, description, price, original_price, stock, sales, unit, origin, harvest_date, shelf_life, storage_method, cover_image, images, status, is_new, is_hot, is_seasonal) VALUES
-- 水果类
((SELECT id FROM categories WHERE name = '时令水果'), '红富士苹果', '新鲜采摘的陕西红富士苹果，果肉细腻，口感甜脆', 5.99, 7.99, 1000, 500, '斤', '陕西洛川', CURRENT_DATE - INTERVAL '7 days', '常温7天', '常温避光保存', 'https://example.com/apple.jpg', ARRAY['https://example.com/apple1.jpg', 'https://example.com/apple2.jpg'], 'active', true, true, true),
((SELECT id FROM categories WHERE name = '进口水果'), '智利车厘子', '进口智利车厘子，个大饱满，果肉厚实', 39.99, 49.99, 500, 200, '斤', '智利', CURRENT_DATE - INTERVAL '3 days', '冷藏7天', '冷藏保存', 'https://example.com/cherry.jpg', ARRAY['https://example.com/cherry1.jpg', 'https://example.com/cherry2.jpg'], 'active', true, true, false),

-- 蔬菜类
((SELECT id FROM categories WHERE name = '叶菜类'), '有机生菜', '无农药有机生菜，新鲜采摘', 3.99, 4.99, 800, 300, '斤', '山东寿光', CURRENT_DATE - INTERVAL '1 day', '冷藏3天', '冷藏保存', 'https://example.com/lettuce.jpg', ARRAY['https://example.com/lettuce1.jpg', 'https://example.com/lettuce2.jpg'], 'active', true, false, true),
((SELECT id FROM categories WHERE name = '根茎类'), '新鲜胡萝卜', '农家种植胡萝卜，富含胡萝卜素', 2.99, 3.99, 1200, 600, '斤', '河北张家口', CURRENT_DATE - INTERVAL '2 days', '常温7天', '常温避光保存', 'https://example.com/carrot.jpg', ARRAY['https://example.com/carrot1.jpg', 'https://example.com/carrot2.jpg'], 'active', false, true, true),

-- 粮油类
((SELECT id FROM categories WHERE name = '大米'), '五常大米', '黑龙江五常大米，优质东北大米', 39.99, 49.99, 500, 200, '袋', '黑龙江五常', NULL, '12个月', '阴凉干燥处保存', 'https://example.com/rice.jpg', ARRAY['https://example.com/rice1.jpg', 'https://example.com/rice2.jpg'], 'active', false, true, false),
((SELECT id FROM categories WHERE name = '食用油'), '花生油', '压榨花生油，纯天然无添加', 59.99, 69.99, 300, 100, '桶', '山东青岛', NULL, '18个月', '阴凉避光保存', 'https://example.com/oil.jpg', ARRAY['https://example.com/oil1.jpg', 'https://example.com/oil2.jpg'], 'active', false, true, false),

-- 肉类
((SELECT id FROM categories WHERE name = '猪肉'), '五花肉', '新鲜五花肉，肥瘦均匀', 15.99, 18.99, 200, 80, '斤', '河南', CURRENT_DATE - INTERVAL '1 day', '冷藏3天', '冷藏保存', 'https://example.com/pork.jpg', ARRAY['https://example.com/pork1.jpg', 'https://example.com/pork2.jpg'], 'active', true, true, false),
((SELECT id FROM categories WHERE name = '牛肉'), '牛里脊', '进口牛里脊，肉质鲜嫩', 39.99, 49.99, 100, 40, '斤', '澳大利亚', CURRENT_DATE - INTERVAL '2 days', '冷冻30天', '冷冻保存', 'https://example.com/beef.jpg', ARRAY['https://example.com/beef1.jpg', 'https://example.com/beef2.jpg'], 'active', true, true, false),

-- 水产类
((SELECT id FROM categories WHERE name = '鱼类'), '草鱼', '新鲜草鱼，活鱼现杀', 12.99, 15.99, 300, 120, '斤', '湖北', CURRENT_DATE - INTERVAL '1 day', '冷藏2天', '冷藏保存', 'https://example.com/fish.jpg', ARRAY['https://example.com/fish1.jpg', 'https://example.com/fish2.jpg'], 'active', true, true, false),
((SELECT id FROM categories WHERE name = '虾类'), '基围虾', '活虾，个大新鲜', 39.99, 49.99, 200, 80, '斤', '广东', CURRENT_DATE - INTERVAL '1 day', '冷藏2天', '冷藏保存', 'https://example.com/shrimp.jpg', ARRAY['https://example.com/shrimp1.jpg', 'https://example.com/shrimp2.jpg'], 'active', true, true, false);

-- 插入优惠券
INSERT INTO coupons (name, type, value, min_amount, start_time, end_time, total_quantity, per_limit, status) VALUES
('新人专享券', '满减', 10.00, 50.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 1000, 1, 'active'),
('满100减20', '满减', 20.00, 100.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 500, 2, 'active'),
('满200减50', '满减', 50.00, 200.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 200, 1, 'active'),
('水果专享券', '满减', 15.00, 80.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 300, 1, 'active'),
('生鲜专享券', '满减', 25.00, 150.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 200, 1, 'active'); 