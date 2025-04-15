-- 添加农户相关字段
ALTER TABLE users
ADD COLUMN IF NOT EXISTS farmer_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS farmer_description TEXT,
ADD COLUMN IF NOT EXISTS farmer_products_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS farmer_sales_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS farmer_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS farmer_verification_time TIMESTAMP WITH TIME ZONE;

-- 添加农户认证相关索引
CREATE INDEX IF NOT EXISTS idx_users_farmer_rating ON users(farmer_rating);
CREATE INDEX IF NOT EXISTS idx_users_farmer_verified ON users(farmer_verified);

-- 添加农户统计函数
CREATE OR REPLACE FUNCTION update_farmer_stats(farmer_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    farmer_products_count = (
      SELECT COUNT(*) 
      FROM products 
      WHERE farmer_id = $1 AND status = 'active'
    ),
    farmer_sales_count = (
      SELECT COALESCE(SUM(sales), 0)
      FROM products
      WHERE farmer_id = $1
    ),
    farmer_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE p.farmer_id = $1 AND r.status = 'approved'
    )
  WHERE id = $1;
END;
$$ LANGUAGE plpgsql;

-- 创建农户统计触发器
CREATE OR REPLACE FUNCTION trigger_update_farmer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_farmer_stats(NEW.farmer_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_farmer_stats(OLD.farmer_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 为产品表添加触发器
DROP TRIGGER IF EXISTS update_farmer_stats_trigger ON products;
CREATE TRIGGER update_farmer_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_farmer_stats();

-- 添加农户认证状态变更函数
CREATE OR REPLACE FUNCTION update_farmer_verification_status(
  farmer_id UUID,
  is_verified BOOLEAN,
  admin_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    farmer_verified = is_verified,
    farmer_verification_time = CASE WHEN is_verified THEN CURRENT_TIMESTAMP ELSE NULL END
  WHERE id = farmer_id AND is_farmer = true;
END;
$$ LANGUAGE plpgsql;

-- 添加农户认证记录表
CREATE TABLE IF NOT EXISTS farmer_verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES users(id),
  admin_id UUID REFERENCES users(id),
  action VARCHAR(20) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加农户认证记录触发器
CREATE OR REPLACE FUNCTION log_farmer_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.farmer_verified IS DISTINCT FROM NEW.farmer_verified THEN
    INSERT INTO farmer_verification_logs (farmer_id, admin_id, action, reason)
    VALUES (
      NEW.id,
      current_setting('app.current_admin_id', true)::UUID,
      CASE WHEN NEW.farmer_verified THEN 'verify' ELSE 'unverify' END,
      current_setting('app.verification_reason', true)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为用户表添加认证记录触发器
DROP TRIGGER IF EXISTS log_farmer_verification_trigger ON users;
CREATE TRIGGER log_farmer_verification_trigger
  AFTER UPDATE OF farmer_verified ON users
  FOR EACH ROW
  WHEN (OLD.farmer_verified IS DISTINCT FROM NEW.farmer_verified)
  EXECUTE FUNCTION log_farmer_verification(); 