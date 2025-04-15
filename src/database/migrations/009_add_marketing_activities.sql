-- 创建营销活动表
CREATE TABLE IF NOT EXISTS marketing_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- seckill, group_buy, full_reduction
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 创建营销活动商品表
CREATE TABLE IF NOT EXISTS marketing_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES marketing_activities(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  activity_price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL,
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  limit_per_user INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(activity_id, product_id)
);

-- 创建拼团活动表
CREATE TABLE IF NOT EXISTS group_buy_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES marketing_activities(id) ON DELETE CASCADE,
  group_size INTEGER NOT NULL,
  group_price DECIMAL(10,2) NOT NULL,
  group_time_limit INTEGER NOT NULL, -- 拼团时间限制（小时）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建拼团记录表
CREATE TABLE IF NOT EXISTS group_buy_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_buy_id UUID REFERENCES group_buy_activities(id) ON DELETE CASCADE,
  leader_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  current_size INTEGER NOT NULL DEFAULT 1,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建拼团成员表
CREATE TABLE IF NOT EXISTS group_buy_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_record_id UUID REFERENCES group_buy_records(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_record_id, user_id)
);

-- 创建满减活动表
CREATE TABLE IF NOT EXISTS full_reduction_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES marketing_activities(id) ON DELETE CASCADE,
  full_amount DECIMAL(10,2) NOT NULL,
  reduction_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建活动参与记录表
CREATE TABLE IF NOT EXISTS activity_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES marketing_activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(activity_id, user_id, product_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_marketing_activities_status ON marketing_activities(status);
CREATE INDEX IF NOT EXISTS idx_marketing_activities_time ON marketing_activities(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_marketing_products_status ON marketing_products(status);
CREATE INDEX IF NOT EXISTS idx_group_buy_records_status ON group_buy_records(status);
CREATE INDEX IF NOT EXISTS idx_group_buy_records_time ON group_buy_records(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_activity_participants_user ON activity_participants(user_id);

-- 创建更新时间触发器
CREATE TRIGGER update_marketing_activities_updated_at
  BEFORE UPDATE ON marketing_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_products_updated_at
  BEFORE UPDATE ON marketing_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_buy_activities_updated_at
  BEFORE UPDATE ON group_buy_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_buy_records_updated_at
  BEFORE UPDATE ON group_buy_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_full_reduction_activities_updated_at
  BEFORE UPDATE ON full_reduction_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建活动状态更新函数
CREATE OR REPLACE FUNCTION update_marketing_activity_status()
RETURNS void AS $$
BEGIN
  -- 更新营销活动状态
  UPDATE marketing_activities
  SET status = CASE
    WHEN end_time < CURRENT_TIMESTAMP THEN 'ended'
    WHEN start_time > CURRENT_TIMESTAMP THEN 'pending'
    ELSE 'active'
  END
  WHERE status != 'cancelled';

  -- 更新活动商品状态
  UPDATE marketing_products mp
  SET status = ma.status
  FROM marketing_activities ma
  WHERE mp.activity_id = ma.id;

  -- 更新拼团记录状态
  UPDATE group_buy_records gbr
  SET status = 'failed',
      end_time = CURRENT_TIMESTAMP
  WHERE status = 'pending'
  AND start_time + (group_time_limit || ' hours')::INTERVAL < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- 创建营销活动统计视图
CREATE OR REPLACE VIEW v_marketing_statistics AS
SELECT
  ma.id as activity_id,
  ma.name as activity_name,
  ma.type as activity_type,
  ma.start_time,
  ma.end_time,
  ma.status,
  COUNT(DISTINCT mp.product_id) as total_products,
  SUM(mp.sold_quantity) as total_sold,
  SUM(mp.sold_quantity * mp.activity_price) as total_sales,
  COUNT(DISTINCT ap.user_id) as total_participants
FROM marketing_activities ma
LEFT JOIN marketing_products mp ON ma.id = mp.activity_id
LEFT JOIN activity_participants ap ON ma.id = ap.activity_id
GROUP BY ma.id, ma.name, ma.type, ma.start_time, ma.end_time, ma.status
ORDER BY ma.start_time DESC;

-- 创建拼团统计视图
CREATE OR REPLACE VIEW v_group_buy_statistics AS
SELECT
  gba.id as activity_id,
  ma.name as activity_name,
  COUNT(DISTINCT gbr.id) as total_groups,
  COUNT(DISTINCT CASE WHEN gbr.status = 'completed' THEN gbr.id END) as completed_groups,
  COUNT(DISTINCT CASE WHEN gbr.status = 'failed' THEN gbr.id END) as failed_groups,
  COUNT(DISTINCT gbm.user_id) as total_participants,
  AVG(gbr.current_size) as avg_group_size,
  SUM(gbr.current_size) as total_participants_in_groups
FROM group_buy_activities gba
JOIN marketing_activities ma ON gba.activity_id = ma.id
LEFT JOIN group_buy_records gbr ON gba.id = gbr.group_buy_id
LEFT JOIN group_buy_members gbm ON gbr.id = gbm.group_record_id
GROUP BY gba.id, ma.name
ORDER BY ma.start_time DESC; 