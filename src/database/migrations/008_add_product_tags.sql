-- 添加商品标签字段
ALTER TABLE products
ADD COLUMN is_fresh BOOLEAN DEFAULT false,
ADD COLUMN is_organic BOOLEAN DEFAULT false,
ADD COLUMN is_local BOOLEAN DEFAULT false,
ADD COLUMN is_seasonal BOOLEAN DEFAULT false,
ADD COLUMN is_premium BOOLEAN DEFAULT false;

-- 创建商品标签索引
CREATE INDEX idx_products_is_fresh ON products(is_fresh);
CREATE INDEX idx_products_is_organic ON products(is_organic);
CREATE INDEX idx_products_is_local ON products(is_local);
CREATE INDEX idx_products_is_seasonal ON products(is_seasonal);
CREATE INDEX idx_products_is_premium ON products(is_premium);

-- 添加商品标签更新时间触发器
CREATE OR REPLACE FUNCTION update_product_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_tags_trigger
  BEFORE UPDATE OF is_fresh, is_organic, is_local, is_seasonal, is_premium
  ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_tags_updated_at(); 