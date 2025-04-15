-- 创建系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(key)
);

-- 创建订单自动取消配置
INSERT INTO system_configs (key, value, description) VALUES
('order_auto_cancel_minutes', '30', '订单自动取消时间（分钟）'),
('order_auto_confirm_days', '7', '订单自动确认收货时间（天）'),
('order_auto_complete_days', '30', '订单自动完成时间（天）');

-- 创建售后单表
CREATE TABLE IF NOT EXISTS after_sales_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- refund, return, repair
  reason TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  refund_amount DECIMAL(10,2),
  refund_method VARCHAR(50),
  refund_account VARCHAR(100),
  refund_time TIMESTAMP WITH TIME ZONE,
  return_address TEXT,
  return_tracking_number VARCHAR(100),
  return_time TIMESTAMP WITH TIME ZONE,
  repair_description TEXT,
  repair_result TEXT,
  repair_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  handled_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 创建售后单状态记录表
CREATE TABLE IF NOT EXISTS after_sales_status_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  after_sales_id UUID REFERENCES after_sales_orders(id) ON DELETE CASCADE,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  reason TEXT,
  operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建售后单图片表
CREATE TABLE IF NOT EXISTS after_sales_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  after_sales_id UUID REFERENCES after_sales_orders(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  type VARCHAR(20) NOT NULL, -- problem, solution
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_after_sales_orders_order_id ON after_sales_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_after_sales_orders_status ON after_sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_after_sales_status_logs_after_sales_id ON after_sales_status_logs(after_sales_id);
CREATE INDEX IF NOT EXISTS idx_after_sales_images_after_sales_id ON after_sales_images(after_sales_id);

-- 创建更新时间触发器
CREATE TRIGGER update_after_sales_orders_updated_at
  BEFORE UPDATE ON after_sales_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建售后单状态更新触发器
CREATE OR REPLACE FUNCTION log_after_sales_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO after_sales_status_logs (
      after_sales_id,
      old_status,
      new_status,
      reason,
      operator_id
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      NEW.description,
      NEW.handled_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_sales_status_change_trigger
  AFTER UPDATE ON after_sales_orders
  FOR EACH ROW
  EXECUTE FUNCTION log_after_sales_status_change();

-- 创建订单自动处理函数
CREATE OR REPLACE FUNCTION process_auto_orders()
RETURNS void AS $$
DECLARE
  auto_cancel_minutes INTEGER;
  auto_confirm_days INTEGER;
  auto_complete_days INTEGER;
BEGIN
  -- 获取系统配置
  SELECT value::INTEGER INTO auto_cancel_minutes
  FROM system_configs
  WHERE key = 'order_auto_cancel_minutes';

  SELECT value::INTEGER INTO auto_confirm_days
  FROM system_configs
  WHERE key = 'order_auto_confirm_days';

  SELECT value::INTEGER INTO auto_complete_days
  FROM system_configs
  WHERE key = 'order_auto_complete_days';

  -- 自动取消未支付订单
  UPDATE orders
  SET status = 'cancelled',
      cancel_reason = '自动取消：超时未支付',
      updated_at = CURRENT_TIMESTAMP
  WHERE status = 'pending'
  AND created_at < CURRENT_TIMESTAMP - (auto_cancel_minutes || ' minutes')::INTERVAL;

  -- 自动确认收货
  UPDATE orders
  SET status = 'confirmed',
      shipping_status = 'delivered',
      updated_at = CURRENT_TIMESTAMP
  WHERE status = 'shipped'
  AND shipping_time < CURRENT_TIMESTAMP - (auto_confirm_days || ' days')::INTERVAL;

  -- 自动完成订单
  UPDATE orders
  SET status = 'completed',
      updated_at = CURRENT_TIMESTAMP
  WHERE status = 'confirmed'
  AND shipping_time < CURRENT_TIMESTAMP - (auto_complete_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- 创建售后统计视图
CREATE OR REPLACE VIEW v_after_sales_statistics AS
SELECT
  o.id as order_id,
  o.order_number,
  o.created_at as order_time,
  aso.id as after_sales_id,
  aso.type as after_sales_type,
  aso.status as after_sales_status,
  aso.reason as after_sales_reason,
  aso.refund_amount,
  aso.created_at as after_sales_time,
  u.username as customer_name,
  p.name as product_name,
  oi.quantity,
  oi.price,
  oi.total_amount
FROM orders o
JOIN after_sales_orders aso ON o.id = aso.order_id
JOIN order_items oi ON aso.order_item_id = oi.id
JOIN products p ON oi.product_id = p.id
JOIN users u ON o.user_id = u.id
ORDER BY aso.created_at DESC;

-- 创建售后处理统计视图
CREATE OR REPLACE VIEW v_after_sales_handling_statistics AS
SELECT
  u.id as handler_id,
  u.username as handler_name,
  COUNT(*) as total_cases,
  COUNT(CASE WHEN aso.status = 'completed' THEN 1 END) as completed_cases,
  COUNT(CASE WHEN aso.status = 'pending' THEN 1 END) as pending_cases,
  COUNT(CASE WHEN aso.status = 'processing' THEN 1 END) as processing_cases,
  COUNT(CASE WHEN aso.status = 'rejected' THEN 1 END) as rejected_cases,
  AVG(EXTRACT(EPOCH FROM (aso.updated_at - aso.created_at))/86400) as avg_handling_days
FROM users u
JOIN after_sales_orders aso ON u.id = aso.handled_by
GROUP BY u.id, u.username
ORDER BY total_cases DESC; 