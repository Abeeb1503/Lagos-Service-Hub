WITH admin_user AS (
  INSERT INTO users (email, password_hash, role, first_name, last_name)
  VALUES ('admin@lagosservicehub.ng', 'admin_pwd_hash', 'admin', 'Admin', 'User')
  RETURNING id
),
buyer_user AS (
  INSERT INTO users (email, password_hash, role, first_name, last_name)
  VALUES ('buyer1@lagosservicehub.ng', 'buyer_pwd_hash', 'buyer', 'Bola', 'Ade')
  RETURNING id
),
seller_user AS (
  INSERT INTO users (email, password_hash, role, first_name, last_name)
  VALUES ('seller1@lagosservicehub.ng', 'seller_pwd_hash', 'seller', 'Tunde', 'Okoro')
  RETURNING id
),
profile AS (
  INSERT INTO seller_profiles (user_id, display_name, categories, years_experience, verification_status)
  SELECT seller_user.id, 'Tunde Electrics', ARRAY['electrical','maintenance'], 5, 'verified'
  FROM seller_user
  RETURNING id
),
job AS (
  INSERT INTO jobs (buyer_id, seller_id, seller_profile_id, title, category, status, quoted_amount, agreed_amount, funded_at)
  SELECT buyer_user.id, seller_user.id, profile.id, 'Fix wiring issue', 'electrical', 'funded', 50000, 50000, NOW()
  FROM buyer_user, seller_user, profile
  RETURNING id
),
payment AS (
  INSERT INTO payment_transactions (job_id, buyer_id, seller_id, type, status, amount, currency, idempotency_key, commission_amount, escrow_amount)
  SELECT job.id, buyer_user.id, seller_user.id, 'ESCROW_DEPOSIT', 'CONFIRMED', 35000, 'NGN', 'demo-deposit-001', 5000, 35000
  FROM job, buyer_user, seller_user
  RETURNING id
),
chat AS (
  INSERT INTO chat_messages (job_id, sender_id, recipient_id, content)
  SELECT job.id, buyer_user.id, seller_user.id, 'Hi, please confirm visit time'
  FROM job, buyer_user, seller_user
  RETURNING id
)
INSERT INTO audit_logs (actor_id, target_type, target_id, action, metadata)
SELECT admin_user.id, 'Job', job.id, 'escrow_release_review', jsonb_build_object('status','funded')
FROM admin_user, job;

