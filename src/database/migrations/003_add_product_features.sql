-- 添加商品特征表
CREATE TABLE IF NOT EXISTS product_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, name)
);

-- 添加商品特征索引
CREATE INDEX IF NOT EXISTS idx_product_features_product_id ON product_features(product_id);

-- 添加商品特征更新时间触发器
CREATE TRIGGER update_product_features_updated_at
  BEFORE UPDATE ON product_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 添加商品标签表
CREATE TABLE IF NOT EXISTS product_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加商品标签关联表
CREATE TABLE IF NOT EXISTS product_tag_relations (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES product_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, tag_id)
);

-- 添加商品标签索引
CREATE INDEX IF NOT EXISTS idx_product_tag_relations_product_id ON product_tag_relations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tag_relations_tag_id ON product_tag_relations(tag_id);

-- 添加商品标签更新时间触发器
CREATE TRIGGER update_product_tags_updated_at
  BEFORE UPDATE ON product_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 添加商品规格表
CREATE TABLE IF NOT EXISTS product_specifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  value TEXT NOT NULL,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  stock_adjustment INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, name, value)
);

-- 添加商品规格索引
CREATE INDEX IF NOT EXISTS idx_product_specifications_product_id ON product_specifications(product_id);

-- 添加商品规格更新时间触发器
CREATE TRIGGER update_product_specifications_updated_at
  BEFORE UPDATE ON product_specifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 添加商品库存记录表
CREATE TABLE IF NOT EXISTS product_stock_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'in' or 'out'
  quantity INTEGER NOT NULL,
  reason TEXT,
  operator_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加商品库存记录索引
CREATE INDEX IF NOT EXISTS idx_product_stock_logs_product_id ON product_stock_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_logs_operator_id ON product_stock_logs(operator_id);

-- 添加商品库存变更触发器
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO product_stock_logs (product_id, type, quantity, reason, operator_id)
    VALUES (NEW.product_id, NEW.type, NEW.quantity, NEW.reason, NEW.operator_id);
    
    UPDATE products
    SET 
      stock = CASE 
        WHEN NEW.type = 'in' THEN stock + NEW.quantity
        WHEN NEW.type = 'out' THEN stock - NEW.quantity
      END
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建商品库存变更触发器
CREATE TRIGGER update_product_stock_trigger
  AFTER INSERT ON product_stock_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

-- 添加商品价格历史表
CREATE TABLE IF NOT EXISTS product_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  operator_id UUID REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加商品价格历史索引
CREATE INDEX IF NOT EXISTS idx_product_price_history_product_id ON product_price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_product_price_history_operator_id ON product_price_history(operator_id);

-- 添加商品价格变更触发器
CREATE OR REPLACE FUNCTION log_product_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price OR OLD.original_price IS DISTINCT FROM NEW.original_price THEN
    INSERT INTO product_price_history (
      product_id,
      price,
      original_price,
      operator_id,
      reason
    )
    VALUES (
      NEW.id,
      NEW.price,
      NEW.original_price,
      current_setting('app.current_user_id', true)::UUID,
      current_setting('app.price_change_reason', true)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建商品价格变更触发器
DROP TRIGGER IF EXISTS log_product_price_change_trigger ON products;
CREATE TRIGGER log_product_price_change_trigger
  AFTER UPDATE OF price, original_price ON products
  FOR EACH ROW
  WHEN (OLD.price IS DISTINCT FROM NEW.price OR OLD.original_price IS DISTINCT FROM NEW.original_price)
  EXECUTE FUNCTION log_product_price_change(); 