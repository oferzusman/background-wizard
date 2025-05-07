
CREATE OR REPLACE FUNCTION public.get_users_with_roles_and_profiles()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  role text,
  profile jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the calling user has admin role
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE 
      user_id = auth.uid() AND 
      (role = 'admin' OR role = 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Access denied. User does not have admin privileges.';
  END IF;
  
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.last_sign_in_at,
    COALESCE(ur.role::text, 'user') as role,
    jsonb_build_object(
      'first_name', p.first_name,
      'last_name', p.last_name,
      'avatar_url', p.avatar_url
    ) as profile
  FROM 
    auth.users au
  LEFT JOIN 
    public.profiles p ON p.id = au.id
  LEFT JOIN (
    -- Get the "highest" role for each user
    SELECT DISTINCT ON (user_id) 
      user_id,
      CASE 
        WHEN role = 'super_admin' THEN 'super_admin'
        WHEN role = 'admin' THEN 'admin'
        ELSE 'user' 
      END as role
    FROM public.user_roles
    ORDER BY user_id, 
      CASE 
        WHEN role = 'super_admin' THEN 1
        WHEN role = 'admin' THEN 2
        ELSE 3
      END
  ) ur ON ur.user_id = au.id
  ORDER BY 
    CASE 
      WHEN ur.role = 'super_admin' THEN 1
      WHEN ur.role = 'admin' THEN 2
      ELSE 3
    END,
    au.created_at DESC;
END;
$$;
