-- 添加销售统计表
CREATE TABLE IF NOT EXISTS sales_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  total_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_customers INTEGER NOT NULL DEFAULT 0,
  average_order_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date)
);

-- 添加销售统计索引
CREATE INDEX IF NOT EXISTS idx_sales_statistics_date ON sales_statistics(date);

-- 添加销售统计更新时间触发器
CREATE TRIGGER update_sales_statistics_updated_at
  BEFORE UPDATE ON sales_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 添加商品销售统计表
CREATE TABLE IF NOT EXISTS product_sales_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sales_quantity INTEGER NOT NULL DEFAULT 0,
  sales_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, date)
);

-- 添加商品销售统计索引
CREATE INDEX IF NOT EXISTS idx_product_sales_statistics_product_id ON product_sales_statistics(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_statistics_date ON product_sales_statistics(date);

-- 添加商品销售统计更新时间触发器
CREATE TRIGGER update_product_sales_statistics_updated_at
  BEFORE UPDATE ON product_sales_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 添加农户销售统计表
CREATE TABLE IF NOT EXISTS farmer_sales_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_products INTEGER NOT NULL DEFAULT 0,
  average_order_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(farmer_id, date)
);

-- 添加农户销售统计索引
CREATE INDEX IF NOT EXISTS idx_farmer_sales_statistics_farmer_id ON farmer_sales_statistics(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_sales_statistics_date ON farmer_sales_statistics(date);

-- 添加农户销售统计更新时间触发器
CREATE TRIGGER update_farmer_sales_statistics_updated_at
  BEFORE UPDATE ON farmer_sales_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 添加销售统计更新函数
CREATE OR REPLACE FUNCTION update_sales_statistics(target_date DATE)
RETURNS void AS $$
BEGIN
  -- 更新总体销售统计
  INSERT INTO sales_statistics (
    date,
    total_sales,
    total_orders,
    total_customers,
    average_order_value
  )
  SELECT
    target_date,
    COALESCE(SUM(payment_amount), 0),
    COUNT(*),
    COUNT(DISTINCT user_id),
    COALESCE(AVG(payment_amount), 0)
  FROM orders
  WHERE DATE(created_at) = target_date
  ON CONFLICT (date) DO UPDATE
  SET
    total_sales = EXCLUDED.total_sales,
    total_orders = EXCLUDED.total_orders,
    total_customers = EXCLUDED.total_customers,
    average_order_value = EXCLUDED.average_order_value,
    updated_at = CURRENT_TIMESTAMP;

  -- 更新商品销售统计
  INSERT INTO product_sales_statistics (
    product_id,
    date,
    sales_quantity,
    sales_amount
  )
  SELECT
    product_id,
    target_date,
    SUM(quantity),
    SUM(total_amount)
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  WHERE DATE(o.created_at) = target_date
  GROUP BY product_id
  ON CONFLICT (product_id, date) DO UPDATE
  SET
    sales_quantity = EXCLUDED.sales_quantity,
    sales_amount = EXCLUDED.sales_amount,
    updated_at = CURRENT_TIMESTAMP;

  -- 更新农户销售统计
  INSERT INTO farmer_sales_statistics (
    farmer_id,
    date,
    total_sales,
    total_orders,
    total_products,
    average_order_value
  )
  SELECT
    p.farmer_id,
    target_date,
    COALESCE(SUM(oi.total_amount), 0),
    COUNT(DISTINCT o.id),
    COUNT(DISTINCT oi.product_id),
    COALESCE(AVG(oi.total_amount), 0)
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  JOIN products p ON oi.product_id = p.id
  WHERE DATE(o.created_at) = target_date
  GROUP BY p.farmer_id
  ON CONFLICT (farmer_id, date) DO UPDATE
  SET
    total_sales = EXCLUDED.total_sales,
    total_orders = EXCLUDED.total_orders,
    total_products = EXCLUDED.total_products,
    average_order_value = EXCLUDED.average_order_value,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- 创建销售统计更新触发器
CREATE OR REPLACE FUNCTION trigger_update_sales_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM update_sales_statistics(DATE(NEW.created_at));
  ELSIF TG_OP = 'UPDATE' THEN
    IF DATE(OLD.created_at) != DATE(NEW.created_at) THEN
      PERFORM update_sales_statistics(DATE(OLD.created_at));
      PERFORM update_sales_statistics(DATE(NEW.created_at));
    ELSE
      PERFORM update_sales_statistics(DATE(NEW.created_at));
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_sales_statistics(DATE(OLD.created_at));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 为订单表添加销售统计触发器
DROP TRIGGER IF EXISTS update_sales_statistics_trigger ON orders;
CREATE TRIGGER update_sales_statistics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_sales_statistics();

-- 添加销售统计视图
CREATE OR REPLACE VIEW v_sales_statistics AS
SELECT
  date,
  total_sales,
  total_orders,
  total_customers,
  average_order_value,
  LAG(total_sales) OVER (ORDER BY date) as previous_day_sales,
  LAG(total_orders) OVER (ORDER BY date) as previous_day_orders,
  LAG(total_customers) OVER (ORDER BY date) as previous_day_customers,
  LAG(average_order_value) OVER (ORDER BY date) as previous_day_average_order_value,
  (total_sales - LAG(total_sales) OVER (ORDER BY date)) / NULLIF(LAG(total_sales) OVER (ORDER BY date), 0) * 100 as sales_growth_rate,
  (total_orders - LAG(total_orders) OVER (ORDER BY date)) / NULLIF(LAG(total_orders) OVER (ORDER BY date), 0) * 100 as orders_growth_rate,
  (total_customers - LAG(total_customers) OVER (ORDER BY date)) / NULLIF(LAG(total_customers) OVER (ORDER BY date), 0) * 100 as customers_growth_rate
FROM sales_statistics
ORDER BY date DESC;

-- 添加商品销售统计视图
CREATE OR REPLACE VIEW v_product_sales_statistics AS
SELECT
  p.id as product_id,
  p.name as product_name,
  c.name as category_name,
  ps.date,
  ps.sales_quantity,
  ps.sales_amount,
  LAG(ps.sales_quantity) OVER (PARTITION BY p.id ORDER BY ps.date) as previous_day_sales_quantity,
  LAG(ps.sales_amount) OVER (PARTITION BY p.id ORDER BY ps.date) as previous_day_sales_amount,
  (ps.sales_quantity - LAG(ps.sales_quantity) OVER (PARTITION BY p.id ORDER BY ps.date)) / NULLIF(LAG(ps.sales_quantity) OVER (PARTITION BY p.id ORDER BY ps.date), 0) * 100 as quantity_growth_rate,
  (ps.sales_amount - LAG(ps.sales_amount) OVER (PARTITION BY p.id ORDER BY ps.date)) / NULLIF(LAG(ps.sales_amount) OVER (PARTITION BY p.id ORDER BY ps.date), 0) * 100 as amount_growth_rate
FROM product_sales_statistics ps
JOIN products p ON ps.product_id = p.id
JOIN categories c ON p.category_id = c.id
ORDER BY ps.date DESC, ps.sales_amount DESC;

-- 添加农户销售统计视图
CREATE OR REPLACE VIEW v_farmer_sales_statistics AS
SELECT
  u.id as farmer_id,
  u.username as farmer_name,
  fs.date,
  fs.total_sales,
  fs.total_orders,
  fs.total_products,
  fs.average_order_value,
  LAG(fs.total_sales) OVER (PARTITION BY u.id ORDER BY fs.date) as previous_day_sales,
  LAG(fs.total_orders) OVER (PARTITION BY u.id ORDER BY fs.date) as previous_day_orders,
  LAG(fs.total_products) OVER (PARTITION BY u.id ORDER BY fs.date) as previous_day_products,
  LAG(fs.average_order_value) OVER (PARTITION BY u.id ORDER BY fs.date) as previous_day_average_order_value,
  (fs.total_sales - LAG(fs.total_sales) OVER (PARTITION BY u.id ORDER BY fs.date)) / NULLIF(LAG(fs.total_sales) OVER (PARTITION BY u.id ORDER BY fs.date), 0) * 100 as sales_growth_rate,
  (fs.total_orders - LAG(fs.total_orders) OVER (PARTITION BY u.id ORDER BY fs.date)) / NULLIF(LAG(fs.total_orders) OVER (PARTITION BY u.id ORDER BY fs.date), 0) * 100 as orders_growth_rate,
  (fs.total_products - LAG(fs.total_products) OVER (PARTITION BY u.id ORDER BY fs.date)) / NULLIF(LAG(fs.total_products) OVER (PARTITION BY u.id ORDER BY fs.date), 0) * 100 as products_growth_rate
FROM farmer_sales_statistics fs
JOIN users u ON fs.farmer_id = u.id
ORDER BY fs.date DESC, fs.total_sales DESC; 