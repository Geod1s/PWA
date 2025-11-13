-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, store_id, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'cashier'),
    COALESCE((new.raw_user_meta_data->>'store_id')::UUID, '00000000-0000-0000-0000-000000000000'),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update daily_analytics when transaction is created
CREATE OR REPLACE FUNCTION public.update_daily_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.daily_analytics (store_id, date, total_sales, total_transactions, total_items_sold)
  VALUES (
    NEW.store_id,
    DATE(NEW.created_at),
    NEW.total,
    1,
    (SELECT COALESCE(SUM(quantity), 0) FROM public.transaction_items WHERE transaction_id = NEW.id)
  )
  ON CONFLICT (store_id, date) DO UPDATE SET
    total_sales = daily_analytics.total_sales + NEW.total,
    total_transactions = daily_analytics.total_transactions + 1,
    total_items_sold = daily_analytics.total_items_sold + (SELECT COALESCE(SUM(quantity), 0) FROM public.transaction_items WHERE transaction_id = NEW.id),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_transaction_created ON public.transactions;

CREATE TRIGGER on_transaction_created
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_analytics();
