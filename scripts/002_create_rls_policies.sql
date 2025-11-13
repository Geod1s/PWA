-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS TEXT AS $$
  SELECT COALESCE((
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ), 'none')
$$ LANGUAGE SQL STABLE;

-- Helper function to check if user is store creator
CREATE OR REPLACE FUNCTION public.is_store_creator(store_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.stores WHERE id = store_id AND creator_id = auth.uid()
  )
$$ LANGUAGE SQL STABLE;

-- Helper function to check if user is store admin/staff
CREATE OR REPLACE FUNCTION public.is_store_staff(store_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND store_id = $1 
    AND role IN ('admin', 'cashier')
  )
$$ LANGUAGE SQL STABLE;

-- PROFILES RLS Policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_own_store" ON public.profiles FOR SELECT
  USING (store_id IN (SELECT id FROM public.stores WHERE creator_id = auth.uid() OR public.is_store_staff(id)));

CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- STORES RLS Policies
CREATE POLICY "stores_select_own" ON public.stores FOR SELECT
  USING (creator_id = auth.uid() OR public.is_store_staff(id));

CREATE POLICY "stores_insert_own" ON public.stores FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "stores_update_own" ON public.stores FOR UPDATE
  USING (creator_id = auth.uid());

CREATE POLICY "stores_delete_own" ON public.stores FOR DELETE
  USING (creator_id = auth.uid());

-- PRODUCTS RLS Policies
CREATE POLICY "products_select_store" ON public.products FOR SELECT
  USING (store_id IN (SELECT id FROM public.stores WHERE creator_id = auth.uid() OR public.is_store_staff(id)));

CREATE POLICY "products_insert_admin" ON public.products FOR INSERT
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE creator_id = auth.uid() OR public.is_store_staff(id)) 
    AND (public.auth_role() = 'creator' OR public.auth_role() = 'admin'));

CREATE POLICY "products_update_admin" ON public.products FOR UPDATE
  USING (store_id IN (SELECT id FROM public.stores WHERE creator_id = auth.uid() OR public.is_store_staff(id))
    AND (public.auth_role() = 'creator' OR public.auth_role() = 'admin'));

CREATE POLICY "products_delete_admin" ON public.products FOR DELETE
  USING (store_id IN (SELECT id FROM public.stores WHERE creator_id = auth.uid()) 
    AND public.auth_role() = 'creator');

-- TRANSACTIONS RLS Policies
CREATE POLICY "transactions_select_staff" ON public.transactions FOR SELECT
  USING (store_id IN (SELECT id FROM public.stores WHERE creator_id = auth.uid() OR public.is_store_staff(id)));

CREATE POLICY "transactions_insert_cashier" ON public.transactions FOR INSERT
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE public.is_store_staff(id)) 
    AND cashier_id = auth.uid() 
    AND public.auth_role() IN ('admin', 'cashier'));

CREATE POLICY "transactions_update_own" ON public.transactions FOR UPDATE
  USING (cashier_id = auth.uid() AND status = 'completed');

-- TRANSACTION_ITEMS RLS Policies
CREATE POLICY "transaction_items_select" ON public.transaction_items FOR SELECT
  USING (transaction_id IN (SELECT id FROM public.transactions WHERE store_id IN (SELECT id FROM public.stores WHERE creator_id = auth.uid() OR public.is_store_staff(id))));

CREATE POLICY "transaction_items_insert" ON public.transaction_items FOR INSERT
  WITH CHECK (transaction_id IN (SELECT id FROM public.transactions WHERE cashier_id = auth.uid()));

-- ROLE_INVITATIONS RLS Policies
CREATE POLICY "role_invitations_select_own" ON public.role_invitations FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "role_invitations_select_creator" ON public.role_invitations FOR SELECT
  USING (store_id IN (SELECT id FROM public.stores WHERE creator_id = auth.uid()));

CREATE POLICY "role_invitations_insert_admin" ON public.role_invitations FOR INSERT
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE creator_id = auth.uid()) 
    AND invited_by = auth.uid());

-- DAILY_ANALYTICS RLS Policies
CREATE POLICY "daily_analytics_select_staff" ON public.daily_analytics FOR SELECT
  USING (store_id IN (SELECT id FROM public.stores WHERE creator_id = auth.uid() OR public.is_store_staff(id)));
