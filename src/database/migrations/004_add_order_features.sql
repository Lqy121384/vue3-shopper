-- 添加订单状态变更记录表
CREATE TABLE IF NOT EXISTS order_status_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  old_status order_status,
  new_status order_status NOT NULL,
  operator_id UUID REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加订单状态变更记录索引
CREATE INDEX IF NOT EXISTS idx_order_status_logs_order_id ON order_status_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_logs_operator_id ON order_status_logs(operator_id);

-- 添加订单状态变更触发器
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_logs (
      order_id,
      old_status,
      new_status,
      operator_id,
      reason
    )
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      current_setting('app.current_user_id', true)::UUID,
      current_setting('app.status_change_reason', true)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建订单状态变更触发器
DROP TRIGGER IF EXISTS log_order_status_change_trigger ON orders;
CREATE TRIGGER log_order_status_change_trigger
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_order_status_change();

-- 添加订单支付记录表
CREATE TABLE IF NOT EXISTS order_payment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  payment_method VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  transaction_id VARCHAR(100),
  status payment_status NOT NULL,
  operator_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加订单支付记录索引
CREATE INDEX IF NOT EXISTS idx_order_payment_logs_order_id ON order_payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_payment_logs_transaction_id ON order_payment_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_order_payment_logs_operator_id ON order_payment_logs(operator_id);

-- 添加订单支付状态变更触发器
CREATE OR REPLACE FUNCTION log_order_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
    INSERT INTO order_payment_logs (
      order_id,
      payment_method,
      amount,
      transaction_id,
      status,
      operator_id
    )
    VALUES (
      NEW.id,
      NEW.payment_method,
      NEW.payment_amount,
      current_setting('app.transaction_id', true),
      NEW.payment_status,
      current_setting('app.current_user_id', true)::UUID
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建订单支付状态变更触发器
DROP TRIGGER IF EXISTS log_order_payment_status_change_trigger ON orders;
CREATE TRIGGER log_order_payment_status_change_trigger
  AFTER UPDATE OF payment_status ON orders
  FOR EACH ROW
  WHEN (OLD.payment_status IS DISTINCT FROM NEW.payment_status)
  EXECUTE FUNCTION log_order_payment_status_change();

-- 添加订单发货记录表
CREATE TABLE IF NOT EXISTS order_shipping_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  shipping_method VARCHAR(20) NOT NULL,
  shipping_company VARCHAR(50) NOT NULL,
  tracking_number VARCHAR(50) NOT NULL,
  operator_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加订单发货记录索引
CREATE INDEX IF NOT EXISTS idx_order_shipping_logs_order_id ON order_shipping_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_shipping_logs_tracking_number ON order_shipping_logs(tracking_number);
CREATE INDEX IF NOT EXISTS idx_order_shipping_logs_operator_id ON order_shipping_logs(operator_id);

-- 添加订单发货状态变更触发器
CREATE OR REPLACE FUNCTION log_order_shipping_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.shipping_status IS DISTINCT FROM NEW.shipping_status AND NEW.shipping_status = 'shipped' THEN
    INSERT INTO order_shipping_logs (
      order_id,
      shipping_method,
      shipping_company,
      tracking_number,
      operator_id
    )
    VALUES (
      NEW.id,
      NEW.shipping_method,
      NEW.shipping_company,
      NEW.tracking_number,
      current_setting('app.current_user_id', true)::UUID
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建订单发货状态变更触发器
DROP TRIGGER IF EXISTS log_order_shipping_status_change_trigger ON orders;
CREATE TRIGGER log_order_shipping_status_change_trigger
  AFTER UPDATE OF shipping_status ON orders
  FOR EACH ROW
  WHEN (OLD.shipping_status IS DISTINCT FROM NEW.shipping_status)
  EXECUTE FUNCTION log_order_shipping_status_change();

-- 添加订单退款表
CREATE TABLE IF NOT EXISTS order_refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  operator_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加订单退款索引
CREATE INDEX IF NOT EXISTS idx_order_refunds_order_id ON order_refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_order_refunds_operator_id ON order_refunds(operator_id);

-- 添加订单退款更新时间触发器
CREATE TRIGGER update_order_refunds_updated_at
  BEFORE UPDATE ON order_refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 添加订单退款状态变更记录表
CREATE TABLE IF NOT EXISTS order_refund_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  refund_id UUID REFERENCES order_refunds(id) ON DELETE CASCADE,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  operator_id UUID REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加订单退款状态变更记录索引
CREATE INDEX IF NOT EXISTS idx_order_refund_logs_refund_id ON order_refund_logs(refund_id);
CREATE INDEX IF NOT EXISTS idx_order_refund_logs_operator_id ON order_refund_logs(operator_id);

-- 添加订单退款状态变更触发器
CREATE OR REPLACE FUNCTION log_order_refund_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_refund_logs (
      refund_id,
      old_status,
      new_status,
      operator_id,
      reason
    )
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      current_setting('app.current_user_id', true)::UUID,
      current_setting('app.refund_status_change_reason', true)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建订单退款状态变更触发器
DROP TRIGGER IF EXISTS log_order_refund_status_change_trigger ON order_refunds;
CREATE TRIGGER log_order_refund_status_change_trigger
  AFTER UPDATE OF status ON order_refunds
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_order_refund_status_change(); 