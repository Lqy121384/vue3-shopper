-- 创建预售活动表
CREATE TABLE IF NOT EXISTS presale_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  delivery_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 创建预售商品表
CREATE TABLE IF NOT EXISTS presale_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES presale_activities(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  presale_price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  max_quantity INTEGER NOT NULL,
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(activity_id, product_id)
);

-- 创建预售订单表
CREATE TABLE IF NOT EXISTS presale_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  presale_product_id UUID REFERENCES presale_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建限时特价活动表
CREATE TABLE IF NOT EXISTS flash_sale_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 创建限时特价商品表
CREATE TABLE IF NOT EXISTS flash_sale_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES flash_sale_activities(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  flash_price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL,
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  limit_per_user INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(activity_id, product_id)
);

-- 创建限时特价订单表
CREATE TABLE IF NOT EXISTS flash_sale_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  flash_sale_product_id UUID REFERENCES flash_sale_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  flash_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_presale_activities_status ON presale_activities(status);
CREATE INDEX IF NOT EXISTS idx_presale_activities_time ON presale_activities(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_presale_products_status ON presale_products(status);
CREATE INDEX IF NOT EXISTS idx_flash_sale_activities_status ON flash_sale_activities(status);
CREATE INDEX IF NOT EXISTS idx_flash_sale_activities_time ON flash_sale_activities(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_flash_sale_products_status ON flash_sale_products(status);

-- 创建更新时间触发器
CREATE TRIGGER update_presale_activities_updated_at
  BEFORE UPDATE ON presale_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presale_products_updated_at
  BEFORE UPDATE ON presale_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presale_orders_updated_at
  BEFORE UPDATE ON presale_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flash_sale_activities_updated_at
  BEFORE UPDATE ON flash_sale_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flash_sale_products_updated_at
  BEFORE UPDATE ON flash_sale_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flash_sale_orders_updated_at
  BEFORE UPDATE ON flash_sale_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建活动状态更新函数
CREATE OR REPLACE FUNCTION update_activity_status()
RETURNS void AS $$
BEGIN
  -- 更新预售活动状态
  UPDATE presale_activities
  SET status = CASE
    WHEN end_time < CURRENT_TIMESTAMP THEN 'ended'
    WHEN start_time > CURRENT_TIMESTAMP THEN 'pending'
    ELSE 'active'
  END
  WHERE status != 'cancelled';

  -- 更新限时特价活动状态
  UPDATE flash_sale_activities
  SET status = CASE
    WHEN end_time < CURRENT_TIMESTAMP THEN 'ended'
    WHEN start_time > CURRENT_TIMESTAMP THEN 'pending'
    ELSE 'active'
  END
  WHERE status != 'cancelled';
END;
$$ LANGUAGE plpgsql;

-- 创建活动商品状态更新函数
CREATE OR REPLACE FUNCTION update_promotion_product_status()
RETURNS void AS $$
BEGIN
  -- 更新预售商品状态
  UPDATE presale_products pp
  SET status = pa.status
  FROM presale_activities pa
  WHERE pp.activity_id = pa.id;

  -- 更新限时特价商品状态
  UPDATE flash_sale_products fp
  SET status = fa.status
  FROM flash_sale_activities fa
  WHERE fp.activity_id = fa.id;
END;
$$ LANGUAGE plpgsql;

-- 创建活动统计视图
CREATE OR REPLACE VIEW v_promotion_statistics AS
SELECT
  'presale' as type,
  pa.id as activity_id,
  pa.name as activity_name,
  pa.start_time,
  pa.end_time,
  pa.status,
  COUNT(DISTINCT pp.product_id) as total_products,
  SUM(pp.sold_quantity) as total_sold,
  SUM(pp.sold_quantity * pp.presale_price) as total_sales
FROM presale_activities pa
LEFT JOIN presale_products pp ON pa.id = pp.activity_id
GROUP BY pa.id, pa.name, pa.start_time, pa.end_time, pa.status
UNION ALL
SELECT
  'flash_sale' as type,
  fa.id as activity_id,
  fa.name as activity_name,
  fa.start_time,
  fa.end_time,
  fa.status,
  COUNT(DISTINCT fp.product_id) as total_products,
  SUM(fp.sold_quantity) as total_sold,
  SUM(fp.sold_quantity * fp.flash_price) as total_sales
FROM flash_sale_activities fa
LEFT JOIN flash_sale_products fp ON fa.id = fp.activity_id
GROUP BY fa.id, fa.name, fa.start_time, fa.end_time, fa.status; 