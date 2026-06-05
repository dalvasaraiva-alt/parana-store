-- Add customer email, gift wrapping and delivery restrictions fields to sales table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS gift_wrapping boolean DEFAULT false;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS delivery_restrictions text;
