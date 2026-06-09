-- Profils utilisateurs
create table if not exists profiles (
  id uuid references auth.users primary key,
  name text,
  email text,
  lang text default 'fr',
  created_at timestamp default now()
);

-- Abonnements
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_id text,
  status text,
  current_period_end timestamp,
  created_at timestamp default now()
);

-- Configuration IA par utilisateur
create table if not exists ai_config (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  gender text,
  personality text,
  hair text,
  eyes text,
  build text,
  style text,
  updated_at timestamp default now()
);

-- Conversations
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  ai_config_id uuid references ai_config(id),
  started_at timestamp default now(),
  last_message_at timestamp
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id),
  role text,
  content text,
  type text default 'text',
  image_url text,
  created_at timestamp default now()
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  title text,
  body text,
  read boolean default false,
  created_at timestamp default now()
);

-- Usage quotidien
create table if not exists daily_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  date date default current_date,
  seconds_used integer default 0,
  unique(user_id, date)
);

-- RLS policies
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table ai_config enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table daily_usage enable row level security;

create policy "Users can manage their own profile" on profiles for all using (auth.uid() = id);
create policy "Users can manage their own subscriptions" on subscriptions for all using (auth.uid() = user_id);
create policy "Users can manage their own ai_config" on ai_config for all using (auth.uid() = user_id);
create policy "Users can manage their own conversations" on conversations for all using (auth.uid() = user_id);
create policy "Users can manage their own messages" on messages for all using (
  conversation_id in (select id from conversations where user_id = auth.uid())
);
create policy "Users can manage their own notifications" on notifications for all using (auth.uid() = user_id);
create policy "Users can manage their own daily_usage" on daily_usage for all using (auth.uid() = user_id);
