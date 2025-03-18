-- Enable realtime for specific tables
alter publication supabase_realtime add table doubts;
alter publication supabase_realtime add table messages;

-- Create function to handle doubt notifications
create or replace function public.handle_doubt_changes()
returns trigger as $$
begin
  perform pg_notify(
    'doubt_changes',
    json_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'id', case 
        when TG_OP = 'DELETE' then OLD.id 
        else NEW.id 
      end,
      'record', case 
        when TG_OP = 'DELETE' then row_to_json(OLD)
        else row_to_json(NEW)
      end
    )::text
  );
  return NULL;
end;
$$ language plpgsql;

-- Create function to handle message notifications
create or replace function public.handle_message_changes()
returns trigger as $$
begin
  perform pg_notify(
    'message_changes',
    json_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'id', case 
        when TG_OP = 'DELETE' then OLD.id 
        else NEW.id 
      end,
      'record', case 
        when TG_OP = 'DELETE' then row_to_json(OLD)
        else row_to_json(NEW)
      end
    )::text
  );
  return NULL;
end;
$$ language plpgsql;

-- Create triggers for doubts table
create trigger doubts_trigger_insert
  after insert on public.doubts
  for each row
  execute function public.handle_doubt_changes();

create trigger doubts_trigger_update
  after update on public.doubts
  for each row
  execute function public.handle_doubt_changes();

create trigger doubts_trigger_delete
  after delete on public.doubts
  for each row
  execute function public.handle_doubt_changes();

-- Create triggers for messages table
create trigger messages_trigger_insert
  after insert on public.messages
  for each row
  execute function public.handle_message_changes();

create trigger messages_trigger_update
  after update on public.messages
  for each row
  execute function public.handle_message_changes();

create trigger messages_trigger_delete
  after delete on public.messages
  for each row
  execute function public.handle_message_changes();