-- 创建用户等级表
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  discount_rate DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name)
);

-- 创建用户积分记录表
CREATE TABLE IF NOT EXISTS user_points_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 创建用户积分记录索引
CREATE INDEX IF NOT EXISTS idx_user_points_logs_user_id ON user_points_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_logs_type ON user_points_logs(type);
CREATE INDEX IF NOT EXISTS idx_user_points_logs_reference_id ON user_points_logs(reference_id);

-- 创建用户积分规则表
CREATE TABLE IF NOT EXISTS points_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name)
);

-- 创建用户等级更新时间触发器
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level_id UUID;
BEGIN
  -- 计算用户总积分
  SELECT id INTO new_level_id
  FROM user_levels
  WHERE points_required <= (
    SELECT COALESCE(SUM(points), 0)
    FROM user_points_logs
    WHERE user_id = NEW.user_id
  )
  ORDER BY points_required DESC
  LIMIT 1;

  -- 更新用户等级
  UPDATE users
  SET level_id = new_level_id
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为积分记录添加等级更新触发器
CREATE TRIGGER update_user_level_trigger
  AFTER INSERT ON user_points_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();

-- 创建积分规则触发器
CREATE TRIGGER update_points_rules_updated_at
  BEFORE UPDATE ON points_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建用户等级更新时间触发器
CREATE TRIGGER update_user_levels_updated_at
  BEFORE UPDATE ON user_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 插入默认用户等级
INSERT INTO user_levels (name, description, points_required, discount_rate) VALUES
('普通会员', '普通会员，享受基础会员权益', 0, 1.00),
('银卡会员', '银卡会员，享受95折优惠', 1000, 0.95),
('金卡会员', '金卡会员，享受9折优惠', 5000, 0.90),
('钻石会员', '钻石会员，享受85折优惠', 10000, 0.85),
('至尊会员', '至尊会员，享受8折优惠', 50000, 0.80);

-- 插入默认积分规则
INSERT INTO points_rules (name, type, points, description) VALUES
('每日签到', 'SIGN_IN', 10, '每日签到可获得10积分'),
('首次注册', 'REGISTER', 100, '首次注册可获得100积分'),
('完善资料', 'PROFILE', 50, '完善个人资料可获得50积分'),
('商品评价', 'REVIEW', 20, '评价商品可获得20积分'),
('订单完成', 'ORDER', 100, '完成订单可获得100积分'),
('推荐用户', 'REFERRAL', 200, '推荐新用户注册可获得200积分');

-- 创建用户积分统计视图
CREATE OR REPLACE VIEW v_user_points_summary AS
SELECT
  u.id as user_id,
  u.username,
  ul.name as level_name,
  ul.discount_rate,
  COALESCE(SUM(upl.points), 0) as total_points,
  COALESCE(SUM(CASE WHEN upl.type = 'SIGN_IN' THEN upl.points ELSE 0 END), 0) as sign_in_points,
  COALESCE(SUM(CASE WHEN upl.type = 'ORDER' THEN upl.points ELSE 0 END), 0) as order_points,
  COALESCE(SUM(CASE WHEN upl.type = 'REVIEW' THEN upl.points ELSE 0 END), 0) as review_points,
  COALESCE(SUM(CASE WHEN upl.type = 'REFERRAL' THEN upl.points ELSE 0 END), 0) as referral_points
FROM users u
LEFT JOIN user_levels ul ON u.level_id = ul.id
LEFT JOIN user_points_logs upl ON u.id = upl.user_id
GROUP BY u.id, u.username, ul.name, ul.discount_rate; 