\set ON_ERROR_STOP 0
\echo '--- upgrade results'
select email, role from staff order by email;
select room_number, status, housekeeping_status from rooms order by 1;
select reference, status, rate_breakdown from bookings;

-- Act as the front desk agent, through RLS.
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
select set_config('request.jwt.claim.role', 'authenticated', false);

\echo '--- permissions (desk): bookings.view=t rates.manage=f staff.manage=f'
select has_permission('bookings.view'), has_permission('rates.manage'), has_permission('staff.manage');

\echo '--- sellable premier rooms: EXPECT 2 (103 carried over as a block)'
select room_type_capacity((select id from room_types where slug='premier-room'), current_date + 10);

\echo '--- two more rooms on the old enquiry nights: EXPECT OVERBOOKED (103 is blocked, capacity 2)'
insert into bookings (room_type_id, check_in, check_out, status, contact_name, rooms_count)
values ((select id from room_types where slug='premier-room'), current_date + 10, current_date + 11, 'confirmed', 'Two Rooms', 2);

\echo '--- EXPECT OVERBOOKED'
insert into bookings (room_type_id, check_in, check_out, status, contact_name)
values ((select id from room_types where slug='premier-room'), current_date + 10, current_date + 11, 'confirmed', 'One Too Many');

\echo '--- EXPECT OVERBOOKED again: desk lacks bookings.overbook even with a reason'
insert into bookings (room_type_id, check_in, check_out, status, contact_name, overbook_reason)
values ((select id from room_types where slug='premier-room'), current_date + 10, current_date + 11, 'confirmed', 'Pushy', 'VIP');

\echo '--- waitlisted is accepted when full'
insert into bookings (room_type_id, check_in, check_out, status, contact_name)
values ((select id from room_types where slug='premier-room'), current_date + 10, current_date + 11, 'waitlisted', 'Waiting');

\echo '--- promoting the waitlist while full: EXPECT OVERBOOKED'
update bookings set status = 'confirmed' where contact_name = 'Waiting';

\echo '--- room conflict: assign 101 to two overlapping stays, second EXPECT ROOM_CONFLICT'
update bookings set room_id = (select id from rooms where room_number='101') where reference = 'SR-OLD1';
update bookings set room_id = (select id from rooms where room_number='101') where contact_name = 'Two Rooms';

\echo '--- block room 102 for the nights then try to assign it: EXPECT permission denied/0 rows (desk lacks rooms.block)'
insert into room_blocks (room_id, start_date, end_date, reason) values ((select id from rooms where room_number='102'), current_date + 10, current_date + 10, 'AC');

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
set role authenticated;
\echo '--- admin: block 102, capacity on that night drops to 2'
insert into room_blocks (room_id, start_date, end_date, reason) values ((select id from rooms where room_number='102'), current_date + 10, current_date + 10, 'AC broken');
select room_type_capacity((select id from room_types where slug='premier-room'), current_date + 10) as cap_after_block;
\echo '--- EXPECT ROOM_BLOCKED'
update bookings set room_id = (select id from rooms where room_number='102') where contact_name = 'Two Rooms';
\echo '--- admin overbooks with a reason: succeeds, overbooked_by set'
insert into bookings (room_type_id, check_in, check_out, status, contact_name, overbook_reason)
values ((select id from room_types where slug='premier-room'), current_date + 10, current_date + 11, 'confirmed', 'Oversold VIP', 'Owner guest');
select contact_name, overbooked_by is not null as flagged from bookings where contact_name = 'Oversold VIP';

\echo '--- check-in / check-out drives room + housekeeping status'
update bookings set status = 'checked_in' where reference = 'SR-OLD1';
select room_number, status, housekeeping_status from rooms where room_number = '101';
update bookings set status = 'checked_out' where reference = 'SR-OLD1';
select room_number, status, housekeeping_status from rooms where room_number = '101';

\echo '--- folio: payment by desk ok; adjustment by desk EXPECT RLS violation'
insert into folio_entries (booking_id, kind, amount, method) select id, 'payment', 1000, 'cash' from bookings where reference='SR-OLD1';
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
set role authenticated;
insert into folio_entries (booking_id, kind, amount) select id, 'adjustment', 50 from bookings where reference='SR-OLD1';
insert into folio_entries (booking_id, kind, amount, tax_amount, stay_date) select id, 'room', 9046.67, 452.33, current_date+10 from bookings where reference='SR-OLD1';
\echo '--- EXPECT unique violation: second room charge same night'
insert into folio_entries (booking_id, kind, amount, stay_date) select id, 'room', 1, current_date+10 from bookings where reference='SR-OLD1';
select folio_balance(id) as balance_expect_8499 from bookings where reference='SR-OLD1';

\echo '--- identity: desk can set and see masked; housekeeping cannot read table'
insert into guests (full_name) values ('Idy Guest');
select set_guest_identity((select id from guests where full_name='Idy Guest'), 'passport', 'Z1234567');
select * from guest_identity_masked((select id from guests where full_name='Idy Guest'));
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', false);
set role authenticated;
select count(*) as hk_sees_identities_expect_0 from guest_identities;
select count(*) as hk_sees_bookings_expect_0 from bookings;
\echo '--- audit log cannot be deleted'
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
set role authenticated;
delete from audit_log;
select count(*) > 10 as audit_has_rows, count(*) filter (where table_name='guest_identities' and after is null) as id_audits_without_payload from audit_log;
select action, table_name, actor_name, changed from audit_log where table_name='bookings' and action='update' order by id limit 3;
\echo '--- night audit date roll'
select business_date from property_settings;
select advance_business_date((select business_date from property_settings));
select advance_business_date((select business_date from property_settings) - 1);
reset role;
\echo '--- group: 2 rooms fit (cap 2 on +20), 3 does not and nothing is left behind'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
set role authenticated;
select create_booking_group(
  jsonb_build_object('name','Wedding','check_in',(current_date+20)::text,'check_out',(current_date+22)::text),
  (select jsonb_agg(jsonb_build_object('room_type_id',(select id from room_types where slug='premier-room'),
     'check_in',(current_date+20)::text,'check_out',(current_date+22)::text,'status','confirmed','source','phone',
     'contact_name','Wedding room '||g)) from generate_series(1,3) g));
select count(*) as groups_expect_0 from booking_groups;
select create_booking_group(
  jsonb_build_object('name','Wedding','check_in',(current_date+20)::text,'check_out',(current_date+22)::text),
  (select jsonb_agg(jsonb_build_object('room_type_id',(select id from room_types where slug='premier-room'),
     'check_in',(current_date+20)::text,'check_out',(current_date+22)::text,'status','confirmed','source','phone',
     'contact_name','Wedding room '||g)) from generate_series(1,2) g)) is not null as created;
select g.reference, count(b.*) as rooms from booking_groups g join bookings b on b.group_id = g.id group by 1;
\echo '--- close folio day'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
select close_folio_day(current_date) as closed_entries;
reset role;

\echo '=== Module 5: housekeeping ==='
reset role;
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000004', 'hk2@x.test', '{"full_name":"Imran Housekeeping"}'),
  ('00000000-0000-0000-0000-000000000005', 'sup@x.test', '{"full_name":"Sana Supervisor"}');
update staff set role = 'housekeeping' where email = 'hk2@x.test';
update staff set role = 'housekeeping_supervisor' where email = 'sup@x.test';
insert into housekeeping_zones (name, floors) values ('Floor 1', '{1}'), ('Floor 2', '{2}');
update staff set hk_zone_id = (select id from housekeeping_zones where name = 'Floor 2') where email = 'hk@x.test';
update staff set hk_zone_id = (select id from housekeeping_zones where name = 'Floor 1') where email = 'hk2@x.test';
update property_settings set business_date = hk_business_today();

\echo '--- desk checks a guest into 102 and out again: a checkout task is created for floor-1 staff (Imran)'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
set role authenticated;
update rooms set housekeeping_status = 'inspected' where room_number = '102';
insert into bookings (room_type_id, room_id, check_in, check_out, status, contact_name)
values ((select id from room_types where slug='premier-room'), (select id from rooms where room_number='102'),
        current_date, current_date + 1, 'checked_in', 'HK Guest');
update bookings set status = 'checked_out' where contact_name = 'HK Guest';
reset role;
select r.room_number, t.kind, t.status, t.target_minutes, s.full_name as assigned
  from housekeeping_tasks t join rooms r on r.id = t.room_id left join staff s on s.id = t.assigned_to;
select room_number, housekeeping_status from rooms where room_number = '102';

\echo '--- supervisor is never auto-assigned; generation is idempotent'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000005', false);
set role authenticated;
select hk_generate_tasks(hk_business_today()) as generated_first;
select hk_generate_tasks(hk_business_today()) as generated_again_expect_0;
select count(*) filter (where assigned_to = '00000000-0000-0000-0000-000000000005') as assigned_to_supervisor_expect_0 from housekeeping_tasks;

\echo '--- Hana tries to start every checkout task: EXPECT only her own (101) changes, not Imran''s (102)'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', false);
update housekeeping_tasks set status = 'in_progress' where kind = 'checkout';
select r.room_number, t.status from housekeeping_tasks t join rooms r on r.id = t.room_id order by 1;

\echo '--- housekeeper cannot generate tasks: EXPECT not permitted'
select hk_generate_tasks(hk_business_today());

\echo '--- lost & found: front desk may log, maintenance may not see'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
insert into lost_found_items (room_id, found_on, description) values ((select id from rooms where room_number='102'), current_date, 'Black phone charger');
select reference, description, status from lost_found_items;
reset role;

\echo '=== Module 11: maintenance ==='
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000006', 'eng@x.test', '{"full_name":"Esha Engineer"}'),
  ('00000000-0000-0000-0000-000000000007', 'chief@x.test', '{"full_name":"Chetan Chief"}'),
  ('00000000-0000-0000-0000-000000000008', 'eng2@x.test', '{"full_name":"Ravi Engineer"}');
update staff set role = 'maintenance' where email in ('eng@x.test', 'eng2@x.test');
update staff set role = 'maintenance_supervisor' where email = 'chief@x.test';

\echo '--- housekeeper reports a leak: ticket gets the medium target (24 h)'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', false);
set role authenticated;
insert into maintenance_tickets (title, room_id, reported_by)
values ('Tap leaking', (select id from rooms where room_number = '101'), auth.uid());
select reference, priority, status, round(extract(epoch from due_at - created_at) / 3600) as target_hours
  from maintenance_tickets where title = 'Tap leaking';

\echo '--- housekeeper cannot assign or resolve it: EXPECT 0 rows changed'
update maintenance_tickets set status = 'resolved' where title = 'Tap leaking';
select status from maintenance_tickets where title = 'Tap leaking';

\echo '--- supervisor makes it urgent: EXPECT target 2 h; assigns Esha'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000007', false);
update maintenance_tickets set priority = 'urgent', assigned_to = '00000000-0000-0000-0000-000000000006'
 where title = 'Tap leaking';
select priority, round(extract(epoch from due_at - created_at) / 3600) as target_hours from maintenance_tickets where title = 'Tap leaking';

\echo '--- Ravi (not assigned) cannot touch it; Esha can: EXPECT in_progress'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000008', false);
update maintenance_tickets set status = 'on_hold' where title = 'Tap leaking';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000006', false);
update maintenance_tickets set status = 'in_progress', started_at = now() where title = 'Tap leaking';
select status from maintenance_tickets where title = 'Tap leaking';

\echo '--- room blocked from the Rooms page is flagged to maintenance: EXPECT a room_block ticket linked'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000007', false);
insert into room_blocks (room_id, kind, start_date, end_date, reason, created_by)
values ((select id from rooms where room_number = '102'), 'out_of_order', current_date + 30, current_date + 31,
        'AC not cooling', auth.uid());
select t.reference, t.source, t.priority, t.affects_room, b.ticket_id = t.id as linked
  from room_blocks b join maintenance_tickets t on t.id = b.ticket_id where b.reason = 'AC not cooling';

\echo '--- front desk logs a maintenance guest request: ticket created; resolving it closes the request'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
insert into guest_requests (room_id, kind, description, created_by)
values ((select id from rooms where room_number = '101'), 'maintenance', 'TV remote not working', auth.uid());
select source, title from maintenance_tickets where source = 'guest_request';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000007', false);
update maintenance_tickets set status = 'resolved', resolved_at = now(), resolved_by = auth.uid()
 where source = 'guest_request';
select kind, status from guest_requests where description = 'TV remote not working';

\echo '--- preventive schedule due today raises one ticket and moves on 90 days; again: EXPECT 0'
insert into maintenance_schedules (title, room_id, interval_days, next_due_on, assigned_to)
values ('AC servicing', (select id from rooms where room_number = '101'), 90, current_date - 1,
        '00000000-0000-0000-0000-000000000006');
select mt_generate_preventive(current_date) as created;
select mt_generate_preventive(current_date) as created_again_expect_0;
select next_due_on - current_date as days_to_next from maintenance_schedules where title = 'AC servicing';

\echo '--- escalation marks an overdue ticket once'
reset role;
update maintenance_tickets set created_at = now() - interval '3 hours' where title = 'Tap leaking';
update maintenance_tickets set priority = 'high' where title = 'Tap leaking';
update maintenance_tickets set priority = 'urgent' where title = 'Tap leaking';
set role authenticated;
select count(*) as escalated from mt_escalate_overdue();
select count(*) as escalated_again_expect_0 from mt_escalate_overdue();

\echo '=== Module 12: HR ==='
reset role;
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000009', 'hr@x.test', '{"full_name":"Hema HR"}');
update staff set role = 'hr_manager' where email = 'hr@x.test';
set role authenticated;

\echo '--- HR sets Hana''s profile; desk cannot'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000009', false);
select set_staff_hr('00000000-0000-0000-0000-000000000003', 'EMP-003', (select id from departments where name = 'Housekeeping'),
  'Room Attendant', current_date - 200, (select id from shift_types where name = 'Morning'), 0::smallint, '98765', '', 'Mother 99999');
select employee_code, job_title, weekly_off from staff where email = 'hk@x.test';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
select set_staff_hr('00000000-0000-0000-0000-000000000003', 'X', null, '', null, null, null, '', '', '');

\echo '--- self clock-in, second clock-in refused, clock-out'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', false);
select clock_in() is not null as clocked_in;
select clock_in();
select clock_out() is not null as clocked_out;
select method, clock_out is not null as closed from attendance where staff_id = auth.uid();

\echo '--- geofence required: far away refused, near accepted'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000009', false);
select set_hr_geofence(34.083700, 74.797300, 200, true, 10);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', false);
select clock_in(28.6139, 77.2090);
select clock_in(34.083900, 74.797400) is not null as near_ok;
select method, in_distance_m < 200 as inside from attendance where staff_id = auth.uid();

\echo '--- staff see only their own attendance: EXPECT 1 row for Imran'
select count(*) from attendance;

\echo '--- Hana asks for leave tomorrow; cannot approve it herself; supervisor approves'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', false);
insert into leave_requests (staff_id, kind, start_date, end_date, reason)
values (auth.uid(), 'casual', current_date + 1, current_date + 1, 'Family event');
update leave_requests set status = 'approved' where reason = 'Family event';
select status from leave_requests where reason = 'Family event';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000005', false);
update leave_requests set status = 'approved', decided_by = auth.uid(), decided_at = now() where reason = 'Family event';
select status from leave_requests where reason = 'Family event';

\echo '--- housekeeping auto-assign skips Hana (on leave tomorrow): EXPECT Imran not Hana'
reset role;
update attendance set clock_out = now() where clock_out is null;
select s.full_name from staff s where s.id = hk_pick_staff(2, current_date + 1);

\echo '--- biometric device: only the server may call it'
set role authenticated;
select attendance_device_event('EMP-003', 'in');
reset role;
select set_config('request.jwt.claim.role', 'service_role', false);
select attendance_device_event('EMP-003', 'in') as first;
select attendance_device_event('EMP-003', 'in') as second_expect_already_in;
select attendance_device_event('EMP-003', 'out') as third;
select attendance_device_event('NOPE', 'in') as unknown;
select set_config('request.jwt.claim.role', 'authenticated', false);

\echo '=== Module 11: automatic room block / unblock ==='
set role authenticated;
\echo '--- housekeeper reports a broken window in 101 and takes it out of order'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', false);
insert into maintenance_tickets (title, room_id, reported_by) values ('Window broken', (select id from rooms where room_number = '101'), auth.uid());
select mt_block_room((select id from maintenance_tickets where title = 'Window broken')) is not null as blocked;
select r.status, b.ticket_id is not null as linked from rooms r join room_blocks b on b.room_id = r.id and b.released_at is null
 where r.room_number = '101';
\echo '--- only one ticket for that block (the block trigger must not raise a second)'
select count(*) as duplicate_tickets_expect_0 from maintenance_tickets where title like '%Window broken%' and source = 'room_block';
\echo '--- housekeeper cannot release it; engineer resolves and releases: EXPECT available + dirty'
select mt_release_room((select id from maintenance_tickets where title = 'Window broken'));
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000006', false);
select mt_release_room((select id from maintenance_tickets where title = 'Window broken')) as released;
select status, housekeeping_status from rooms where room_number = '101';
\echo '--- room with a guest assigned cannot be blocked: EXPECT ROOM_IN_USE'
reset role;
insert into bookings (room_type_id, room_id, check_in, check_out, status, contact_name)
values ((select room_type_id from rooms where room_number = '101'), (select id from rooms where room_number = '101'),
        current_date, current_date + 2, 'confirmed', 'Block Guest');
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', false);
insert into maintenance_tickets (title, room_id, reported_by) values ('Door squeaks', (select id from rooms where room_number = '101'), auth.uid());
select mt_block_room((select id from maintenance_tickets where title = 'Door squeaks'));
reset role;

\echo '=== Module 8: guest CRM ==='
reset role;
insert into guests (id, full_name, email, phone, date_of_birth, tags) values
  ('00000000-0000-0000-0000-0000000000a1', 'Asha Mehta', 'asha@guest.test', '+91 98765 43210', '1990-05-01', '{VIP}'),
  ('00000000-0000-0000-0000-0000000000a2', 'Asha Mehta', null, '9876543210', null, '{}');
insert into bookings (guest_id, room_type_id, check_in, check_out, status, contact_name)
values ('00000000-0000-0000-0000-0000000000a1', (select id from room_types limit 1), current_date - 20, current_date - 18, 'checked_out', 'Asha Mehta'),
       ('00000000-0000-0000-0000-0000000000a2', (select id from room_types limit 1), current_date - 10, current_date - 7, 'checked_out', 'Asha M');
insert into guest_identities (guest_id, id_type, id_number) values ('00000000-0000-0000-0000-0000000000a2', 'passport', 'Z1234567');

set role authenticated;
\echo '--- stats: EXPECT 1 stay / 2 nights on the first profile'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
select stays, nights from guest_stats where guest_id = '00000000-0000-0000-0000-0000000000a1';

\echo '--- desk (no guests.privacy) cannot merge: EXPECT not permitted'
select merge_guests('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2');

\echo '--- manager merges: EXPECT 2 stays, 5 nights, ID moved, VIP kept, duplicate gone'
reset role;
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000010', 'gm@x.test', '{"full_name":"Gita Manager"}');
update staff set role = 'manager' where email = 'gm@x.test';
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000010', false);
select merge_guests('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2');
select stays, nights from guest_stats where guest_id = '00000000-0000-0000-0000-0000000000a1';
select g.tags, gi.id_number is not null as id_kept, (select count(*) from guests where full_name like 'Asha%') as asha_profiles
  from guests g left join guest_identities gi on gi.guest_id = g.id where g.id = '00000000-0000-0000-0000-0000000000a1';

\echo '--- erase: name and contact gone from guest and bookings, stays kept'
select erase_guest('00000000-0000-0000-0000-0000000000a1');
select full_name, email, phone, date_of_birth, erased_at is not null as erased from guests where id = '00000000-0000-0000-0000-0000000000a1';
select count(*) as bookings_kept, bool_and(contact_name = 'Erased guest') as anonymised from bookings where guest_id = '00000000-0000-0000-0000-0000000000a1';
select count(*) as identities_left from guest_identities where guest_id = '00000000-0000-0000-0000-0000000000a1';

\echo '--- feedback: desk can insert; housekeeper cannot read'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
insert into guest_feedback (guest_id, overall, comment, source, submitted_at) values ('00000000-0000-0000-0000-0000000000a1', 5, 'Lovely', 'desk', now());
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', false);
select count(*) as housekeeper_sees_expect_0 from guest_feedback;

\echo '=== Module 15: templates and sessions ==='
\echo '--- desk can read templates but not change them: EXPECT 4 rows, then 0 updated'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
select count(*) from message_templates;
update message_templates set subject = 'hacked' where template = 'confirmation';
select subject from message_templates where template = 'confirmation' and language = 'en';
\echo '--- admin adds a Hindi confirmation'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
insert into message_templates (template, language, subject) values ('confirmation', 'hi', 'बुकिंग पक्की — {Reference}');
select language, subject from message_templates where template = 'confirmation' order by 1;
reset role;
