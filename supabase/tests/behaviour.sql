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

\echo '=== Module 7: billing, invoicing and refunds ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);

\echo '--- every charge lands on the booking master folio without being told to'
select count(*) as entries_without_folio_expect_0 from folio_entries where folio_id is null;
select kind, count(*) from folios group by 1;

\echo '--- a split folio takes charges moved onto it, and per-folio balances add up'
insert into folios (booking_id, kind, label) select id, 'split', 'Company' from bookings where reference='SR-OLD1';
update folio_entries set folio_id = (select id from folios where label='Company')
 where kind='room' and booking_id = (select id from bookings where reference='SR-OLD1');
select
  (select round(folio_balance_of(id)) from folios where label='Company')   as company_folio,
  (select round(folio_balance_of(id)) from folios where kind='master'
     and booking_id=(select id from bookings where reference='SR-OLD1'))   as master_folio,
  (select round(folio_balance(id)) from bookings where reference='SR-OLD1') as whole_booking;

\echo '--- EXPECT refusal: a folio from another booking'
insert into folio_entries (booking_id, folio_id, kind, amount)
select (select id from bookings where reference='SR-OLD2'), (select id from folios where label='Company'), 'extra', 100;

\echo '--- invoice numbers are sequential and never repeat'
select next_invoice_number('INV', financial_year_of(current_date)) as first,
       next_invoice_number('INV', financial_year_of(current_date)) as second;
select financial_year_of('2026-04-01') as apr, financial_year_of('2026-03-31') as mar;

\echo '--- EXPECT refusal: changing an issued invoice; delete removes 0 rows (no RLS delete policy)'
insert into invoices (number, financial_year, seq, booking_id, folio_id, bill_to_name, net_total, tax_total, grand_total)
select 'TEST/2026-27/0001', '2026-27', 1, booking_id, id, 'Test', 100, 5, 105 from folios where label='Company';
update invoices set grand_total = 1 where number = 'TEST/2026-27/0001';
delete from invoices where number = 'TEST/2026-27/0001';
select count(*) as invoice_survived_delete_expect_1 from invoices where number = 'TEST/2026-27/0001';
\echo '--- cancelling is allowed, and the number stays used'
update invoices set status='cancelled', cancel_reason='test', cancelled_at=now() where number='TEST/2026-27/0001';
select number, status from invoices where number = 'TEST/2026-27/0001';

\echo '--- EXPECT refusal: approving your own refund request'
insert into refund_requests (booking_id, amount, reason, method, requested_by)
select id, 2000, 'Overcharged', 'cash', '00000000-0000-0000-0000-000000000001' from bookings where reference='SR-OLD1';
update refund_requests set status='approved', decided_by='00000000-0000-0000-0000-000000000001', decided_at=now()
 where reason='Overcharged';
\echo '--- someone else may approve it'
update refund_requests set status='approved', decided_by='00000000-0000-0000-0000-000000000002', decided_at=now()
 where reason='Overcharged';
select status, decided_by is not null as decided from refund_requests where reason='Overcharged';

\echo '--- housekeeping cannot see invoices or payment links'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', false);
select count(*) as hk_sees_invoices_expect_0 from invoices;
select count(*) as hk_sees_payments_expect_0 from payment_transactions;
reset role;

\echo '=== Module 7: city ledger and multi-currency ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);

\echo '--- EXPECT refusal: moving the base currency off a rate of 1'
update currencies set rate_to_base = 1.5 where code = 'INR';
select code, rate_to_base from currencies where code = 'INR';

\echo '--- a company on 30-day terms with a 20,000 credit limit'
insert into companies (id, name, credit_limit, payment_terms_days)
values ('00000000-0000-0000-0000-0000000000c1', 'Dal Travels', 20000, 30)
on conflict (id) do update set credit_limit = 20000, payment_terms_days = 30;

\echo '--- a folio on a departed stay that still owes 5,000'
insert into folios (id, booking_id, kind, label)
select '00000000-0000-0000-0000-0000000000f1', id, 'split', 'Delegates'
  from bookings where reference='SR-1011';
insert into folio_entries (booking_id, folio_id, kind, description, amount)
select id, '00000000-0000-0000-0000-0000000000f1', 'extra', 'Conference lunch', 5000
  from bookings where reference='SR-1011';
select round(folio_balance_of('00000000-0000-0000-0000-0000000000f1')) as folio_owes_expect_5000;

\echo '--- transferring settles the folio and opens the receivable on terms'
select city_ledger_transfer('00000000-0000-0000-0000-0000000000f1',
  '00000000-0000-0000-0000-0000000000c1', date '2026-09-22', 'PO 4471') is not null as transferred;
select round(folio_balance_of('00000000-0000-0000-0000-0000000000f1')) as folio_now_expect_0,
       round(company_balance('00000000-0000-0000-0000-0000000000c1')) as company_owes_expect_5000;
select kind, round(amount) as amount, due_date, method
  from city_ledger_entries where company_id='00000000-0000-0000-0000-0000000000c1' order by created_at;
\echo '    (the folio carries a matching corporate-billing credit)'
select kind, method, round(amount) as amount from folio_entries
 where folio_id='00000000-0000-0000-0000-0000000000f1' and kind='payment';

\echo '--- EXPECT refusal: billing the same folio to a company twice'
insert into folio_entries (booking_id, folio_id, kind, description, amount)
select id, '00000000-0000-0000-0000-0000000000f1', 'extra', 'Late charge', 500
  from bookings where reference='SR-1011';
select city_ledger_transfer('00000000-0000-0000-0000-0000000000f1',
  '00000000-0000-0000-0000-0000000000c1', date '2026-09-22', 'again');

\echo '--- EXPECT refusal: a transfer that would breach the credit limit'
insert into folios (id, booking_id, kind, label)
select '00000000-0000-0000-0000-0000000000f3', id, 'split', 'Banquet'
  from bookings where reference='SR-1011';
insert into folio_entries (booking_id, folio_id, kind, description, amount)
select id, '00000000-0000-0000-0000-0000000000f3', 'extra', 'Banquet hall', 18000
  from bookings where reference='SR-1011';
select city_ledger_transfer('00000000-0000-0000-0000-0000000000f3',
  '00000000-0000-0000-0000-0000000000c1', date '2026-09-22', 'over limit');

\echo '--- a receipt on account reduces the balance'
insert into city_ledger_entries (company_id, kind, amount, method, description)
values ('00000000-0000-0000-0000-0000000000c1', 'payment', 2000, 'bank_transfer', 'Part payment');
select round(company_balance('00000000-0000-0000-0000-0000000000c1')) as company_owes_expect_3000;

\echo '--- voiding the transfer reverses both books at once'
select city_ledger_void(
  (select id from city_ledger_entries
    where company_id='00000000-0000-0000-0000-0000000000c1' and kind='charge' and voided_at is null limit 1),
  'Billed to the wrong company');
select round(company_balance('00000000-0000-0000-0000-0000000000c1')) as company_owes_expect_minus_2000,
       round(folio_balance_of('00000000-0000-0000-0000-0000000000f1')) as folio_back_expect_5500;

\echo '--- EXPECT refusal: voiding without a reason'
insert into city_ledger_entries (id, company_id, kind, amount, method, description)
values ('00000000-0000-0000-0000-0000000000c9', '00000000-0000-0000-0000-0000000000c1', 'payment', 100, 'cash', 'Void me');
select city_ledger_void('00000000-0000-0000-0000-0000000000c9', '   ');

\echo '--- a payment in another currency is credited in the base currency'
insert into folio_entries (booking_id, folio_id, kind, description, amount, method, fx_currency, fx_amount, fx_rate)
select id, '00000000-0000-0000-0000-0000000000f1', 'payment', 'Payment in USD', 8800, 'cash', 'USD', 100, 88
  from bookings where reference='SR-1011';
select fx_currency, fx_amount, fx_rate, round(amount) as base_amount
  from folio_entries where fx_currency is not null;

\echo '--- EXPECT refusal: a foreign amount without its currency and rate'
insert into folio_entries (booking_id, folio_id, kind, description, amount, method, fx_amount)
select id, '00000000-0000-0000-0000-0000000000f1', 'payment', 'Half a record', 100, 'cash', 50
  from bookings where reference='SR-1011';

\echo '--- housekeeping cannot see the city ledger'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', false);
select count(*) as hk_sees_city_ledger_expect_0 from city_ledger_entries;
\echo '--- but anyone may read exchange rates, since anyone may quote a price'
select count(*) > 0 as hk_sees_rates_expect_t from currencies;
reset role;

\echo '=== Module 8: loyalty points and tiers ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);

update property_settings set loyalty_enabled = true, loyalty_expiry_months = 24, loyalty_min_redeem_points = 500;

\echo '--- enrolling gives a membership number and the entry tier'
insert into guests (id, full_name, email)
values ('00000000-0000-0000-0000-0000000000a2', 'Imran Rather', 'imran@example.com')
on conflict (id) do nothing;
update bookings set guest_id = '00000000-0000-0000-0000-0000000000a2' where reference = 'SR-1012';
select loyalty_enroll('00000000-0000-0000-0000-0000000000a2') like 'RR%' as got_member_no;
select loyalty_opt_in, loyalty_tier from guests where id='00000000-0000-0000-0000-0000000000a2';

\echo '--- an issued invoice earns points on the taxable value at the tier rate'
insert into folios (id, booking_id, kind, label)
select '00000000-0000-0000-0000-0000000000f2', id, 'split', 'Loyalty' from bookings where reference='SR-1012';
insert into folio_entries (booking_id, folio_id, kind, description, amount, tax_amount, tax_rate)
select id, '00000000-0000-0000-0000-0000000000f2', 'extra', 'Spa package', 20000, 1000, 5
  from bookings where reference='SR-1012';
insert into invoices (number, financial_year, seq, booking_id, folio_id, bill_to_name, net_total, tax_total, grand_total)
select 'LOY/2026-27/0901', '2026-27', 901, id, '00000000-0000-0000-0000-0000000000f2',
       'Imran Rather', 20000, 1000, 21000 from bookings where reference='SR-1012';
\echo '    20,000 taxable at silver (0.05/unit) = 1,000 points; tax earns nothing'
select loyalty_balance('00000000-0000-0000-0000-0000000000a2') as balance_expect_1000;
select kind, points, remaining, round(base_amount) as on_spend, expires_on is not null as expires
  from loyalty_transactions where guest_id='00000000-0000-0000-0000-0000000000a2';

\echo '--- reprinting or re-inserting the same invoice does not earn twice'
select loyalty_award_for_invoice((select id from invoices where number='LOY/2026-27/0901')) as awarded_expect_0;
select loyalty_balance('00000000-0000-0000-0000-0000000000a2') as balance_still_1000;

\echo '--- a goodwill correction opens a second lot'
select loyalty_adjust('00000000-0000-0000-0000-0000000000a2', 500, 'Goodwill, lift outage') as balance_expect_1500;

\echo '--- EXPECT refusal: a correction with no reason'
select loyalty_adjust('00000000-0000-0000-0000-0000000000a2', 100, '  ');

\echo '--- EXPECT refusal: spending more points than are held'
select loyalty_consume('00000000-0000-0000-0000-0000000000a2', 99999);

\echo '--- redeeming credits the folio, and eats the oldest lot first'
select round(loyalty_redeem(
  '00000000-0000-0000-0000-0000000000a2',
  (select id from bookings where reference='SR-1012'),
  '00000000-0000-0000-0000-0000000000f2',
  1200, 'Points off the bill')) as rupees_off_expect_300;
select loyalty_balance('00000000-0000-0000-0000-0000000000a2') as balance_expect_300;
select kind, points, remaining from loyalty_transactions
 where guest_id='00000000-0000-0000-0000-0000000000a2' order by created_at;
\echo '    (the folio carries a loyalty_points payment of 300)'
select kind, method, round(amount) as amount from folio_entries
 where folio_id='00000000-0000-0000-0000-0000000000f2' and method='loyalty_points';

\echo '--- EXPECT refusal: a redemption below the property minimum'
select loyalty_redeem('00000000-0000-0000-0000-0000000000a2',
  (select id from bookings where reference='SR-1012'),
  '00000000-0000-0000-0000-0000000000f2', 100, 'too few');

\echo '--- EXPECT refusal: a redemption worth more than the bill'
insert into folios (id, booking_id, kind, label)
select '00000000-0000-0000-0000-0000000000f4', id, 'split', 'Tiny' from bookings where reference='SR-1012';
insert into folio_entries (booking_id, folio_id, kind, description, amount)
select id, '00000000-0000-0000-0000-0000000000f4', 'extra', 'Bottle of water', 20
  from bookings where reference='SR-1012';
select loyalty_adjust('00000000-0000-0000-0000-0000000000a2', 5000, 'Top up for the over-balance check');
select loyalty_redeem('00000000-0000-0000-0000-0000000000a2',
  (select id from bookings where reference='SR-1012'),
  '00000000-0000-0000-0000-0000000000f4', 5000, 'worth 1250 against a 20 bill');

\echo '--- expiry retires only what is left in a lot whose date has passed'
update loyalty_transactions set expires_on = date '2020-01-01'
 where guest_id='00000000-0000-0000-0000-0000000000a2' and remaining > 0;
select loyalty_expire_points(date '2026-09-22') as points_expired_expect_5300;
select loyalty_balance('00000000-0000-0000-0000-0000000000a2') as balance_expect_0;
select kind, points from loyalty_transactions
 where guest_id='00000000-0000-0000-0000-0000000000a2' and kind='expire' order by points;

\echo '--- tiers need both nights and spend, so this guest stays on the entry tier'
select nights, round(spend) as spend from loyalty_rolling_activity('00000000-0000-0000-0000-0000000000a2', date '2026-09-22');
select loyalty_evaluate_tier('00000000-0000-0000-0000-0000000000a2', date '2026-09-22') as tier_expect_silver;

\echo '--- erasing a guest removes the membership and its points history'
select loyalty_erase('00000000-0000-0000-0000-0000000000a2');
select loyalty_opt_in, loyalty_member_no is null as no_number, loyalty_tier is null as no_tier
  from guests where id='00000000-0000-0000-0000-0000000000a2';
select count(*) as points_rows_expect_0 from loyalty_transactions where guest_id='00000000-0000-0000-0000-0000000000a2';

\echo '--- housekeeping may read tiers to honour a perk, but not change them'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', false);
select count(*) > 0 as hk_sees_tiers_expect_t from loyalty_tiers;
update loyalty_tiers set earn_rate = 99 where key = 'silver';
select earn_rate as earn_rate_expect_0_05 from loyalty_tiers where key = 'silver';
reset role;

\echo '=== Module 6: point of sale ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);

\echo '--- all seven outlet types the SOW names are set up'
select count(*) as outlets_expect_7, count(distinct kind) as kinds_expect_7 from pos_outlets;

\echo '--- a menu on the restaurant: outlet tax 5%, service charge 10%'
insert into pos_categories (id, outlet_id, name)
select '00000000-0000-0000-0000-0000000000e1', id, 'Wazwan' from pos_outlets where code = 'RST';
insert into pos_items (id, outlet_id, category_id, name, price)
select '00000000-0000-0000-0000-0000000000e2', id, '00000000-0000-0000-0000-0000000000e1', 'Rista', 1000
  from pos_outlets where code = 'RST';
insert into pos_items (id, outlet_id, category_id, name, price)
select '00000000-0000-0000-0000-0000000000e3', id, '00000000-0000-0000-0000-0000000000e1', 'Kahwa', 500
  from pos_outlets where code = 'RST';
select pos_item_tax_rate('00000000-0000-0000-0000-0000000000e2') as inherits_outlet_expect_5;

\echo '--- a category rate overrides the outlet, and an item rate overrides both'
update pos_categories set tax_rate = 12 where id = '00000000-0000-0000-0000-0000000000e1';
select pos_item_tax_rate('00000000-0000-0000-0000-0000000000e2') as from_category_expect_12;
update pos_items set tax_rate = 18 where id = '00000000-0000-0000-0000-0000000000e2';
select pos_item_tax_rate('00000000-0000-0000-0000-0000000000e2') as from_item_expect_18;
update pos_items set tax_rate = null where id = '00000000-0000-0000-0000-0000000000e2';
update pos_categories set tax_rate = null where id = '00000000-0000-0000-0000-0000000000e1';

\echo '--- opening a bill numbers it per outlet, and totals add up as lines go on'
select pos_open_order((select id from pos_outlets where code='RST'), '7', null, null, 'Imran', 2) as order_id
\gset
select number, status from pos_orders where id = :'order_id';
select pos_add_line(:'order_id', '00000000-0000-0000-0000-0000000000e2', 1) is not null as line_1;
select pos_add_line(:'order_id', '00000000-0000-0000-0000-0000000000e3', 2) is not null as line_2;
\echo '    net 2000, tax 100 at 5%, service 200 + 10 tax, grand 2310'
select net_total, tax_total, service_net, service_tax, grand_total from pos_orders where id = :'order_id';
select round(pos_order_balance(:'order_id')) as owed_expect_2310;

\echo '--- a modifier changes the line price and is frozen onto the line'
insert into pos_modifiers (id, outlet_id, name, price_delta)
select '00000000-0000-0000-0000-0000000000e4', id, 'Extra gravy', 50 from pos_outlets where code='RST';
insert into pos_item_modifiers (item_id, modifier_id)
values ('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000e4');
select pos_add_line(:'order_id', '00000000-0000-0000-0000-0000000000e2', 1,
  array['00000000-0000-0000-0000-0000000000e4']::uuid[], 'mild') is not null as line_3;
select unit_price, modifiers, notes from pos_order_lines
 where order_id = :'order_id' and notes = 'mild';

\echo '--- EXPECT refusal: an item from another outlet''s menu'
insert into pos_items (id, outlet_id, name, price)
select '00000000-0000-0000-0000-0000000000e5', id, 'Whisky', 800 from pos_outlets where code='BAR';
select pos_add_line(:'order_id', '00000000-0000-0000-0000-0000000000e5', 1);

\echo '--- splitting moves a line onto a second bill; both recompute'
select pos_open_order((select id from pos_outlets where code='RST'), '7b') as split_id
\gset
select pos_move_lines(array[(select id from pos_order_lines where order_id = :'order_id' and notes='mild')], :'split_id') as moved_expect_1;
select (select round(grand_total) from pos_orders where id = :'order_id') as first_bill,
       (select round(grand_total) from pos_orders where id = :'split_id') as second_bill;

\echo '--- merging moves them back and the empty bill is voided'
select pos_move_lines(array(select id from pos_order_lines where order_id = :'split_id'), :'order_id') as merged_expect_1;
select pos_void_order(:'split_id', 'Merged into the other bill');
select status, void_reason from pos_orders where id = :'split_id';
select count(*) as lines_on_voided_bill_expect_0 from pos_order_lines where order_id = :'split_id';

\echo '--- EXPECT refusal: voiding a bill with no reason'
select pos_void_order(:'order_id', '  ');

\echo '--- EXPECT refusal: charging to a room whose guest is not checked in'
select pos_charge_to_room(:'order_id', (select id from bookings where reference='SR-1002'));

\echo '--- charging to room posts one folio line per tax rate, plus service and tip'
update bookings set status = 'checked_in' where reference = 'SR-1012';
update pos_orders set tip_amount = 100 where id = :'order_id';
select pos_recalc_order(:'order_id');
select round(grand_total) as grand_with_tip from pos_orders where id = :'order_id';
select pos_charge_to_room(:'order_id', (select id from bookings where reference='SR-1012')) is not null as charged;
select description, round(amount) as net, round(tax_amount) as tax, tax_rate
  from folio_entries
 where reference = (select number from pos_orders where id = :'order_id')
 order by description;
select status, round(pos_order_balance(:'order_id')) as balance_expect_0
  from pos_orders where id = :'order_id';

\echo '--- EXPECT refusal: charging a bill that is already settled'
select pos_charge_to_room(:'order_id', (select id from bookings where reference='SR-1012'));

\echo '--- the property''s outlet limit per stay is enforced'
update property_settings set pos_room_charge_limit = 100;
select pos_open_order((select id from pos_outlets where code='RST'), '9') as limited_id
\gset
select pos_add_line(:'limited_id', '00000000-0000-0000-0000-0000000000e3', 1) is not null as added;
\echo '    EXPECT refusal: the stay already carries more than the limit'
select pos_charge_to_room(:'limited_id', (select id from bookings where reference='SR-1012'));
update property_settings set pos_room_charge_limit = 0;

\echo '--- cash at the till, and EXPECT refusal on an overpayment'
select round(pos_order_balance(:'limited_id')) as owed;
select pos_take_payment(:'limited_id', 'cash', 99999);
select pos_take_payment(:'limited_id', 'cash', pos_order_balance(:'limited_id')) is not null as paid;
select status, round(pos_order_balance(:'limited_id')) as balance_expect_0
  from pos_orders where id = :'limited_id';

\echo '--- EXPECT refusal: adding to a bill that is closed'
select pos_add_line(:'limited_id', '00000000-0000-0000-0000-0000000000e3', 1);

\echo '--- EXPECT refusal: voiding a bill that has taken payment'
select pos_void_order(:'limited_id', 'changed their mind');

\echo '--- loyalty points settle an outlet bill, worth the tier rate'
select loyalty_enroll('00000000-0000-0000-0000-0000000000a2') like 'RR%' as re_enrolled;
select loyalty_adjust('00000000-0000-0000-0000-0000000000a2', 2000, 'Points for the POS test') as balance_expect_2000;
select pos_open_order((select id from pos_outlets where code='RST'), '11') as pts_id
\gset
select pos_add_line(:'pts_id', '00000000-0000-0000-0000-0000000000e3', 1) is not null as added;
\echo '    1,000 points at silver (0.25) = 250 off'
select round(pos_redeem_points(:'pts_id', '00000000-0000-0000-0000-0000000000a2', 1000)) as off_expect_250;
select loyalty_balance('00000000-0000-0000-0000-0000000000a2') as points_left_expect_1000;
select kind, round(amount) as amount, points from pos_payments where order_id = :'pts_id';
\echo '    a second redemption still fits, because 327.50 was left owing'
select round(pos_redeem_points(:'pts_id', '00000000-0000-0000-0000-0000000000a2', 1000)) as off_expect_250;
\echo '    EXPECT refusal: points worth more than a small bill'
insert into pos_items (id, outlet_id, name, price)
select '00000000-0000-0000-0000-0000000000e6', id, 'Bottled water', 100 from pos_outlets where code='RST';
select pos_open_order((select id from pos_outlets where code='RST'), '11b') as small_id
\gset
select pos_add_line(:'small_id', '00000000-0000-0000-0000-0000000000e6', 1) is not null as added;
select round(pos_order_balance(:'small_id')) as owed_expect_116;
select pos_redeem_points(:'small_id', '00000000-0000-0000-0000-0000000000a2', 1000);

\echo '--- a bill mixing two tax rates reaches the folio as two lines'
insert into pos_items (id, outlet_id, name, price, tax_rate)
select '00000000-0000-0000-0000-0000000000e7', id, 'Kingfisher', 800, 18 from pos_outlets where code='RST';
select pos_open_order((select id from pos_outlets where code='RST'), '13') as mixed_id
\gset
select pos_add_line(:'mixed_id', '00000000-0000-0000-0000-0000000000e3', 1) is not null as added_5pct;
select pos_add_line(:'mixed_id', '00000000-0000-0000-0000-0000000000e7', 1) is not null as added_18pct;
select pos_charge_to_room(:'mixed_id', (select id from bookings where reference='SR-1012')) is not null as charged;
select round(amount) as net, round(tax_amount) as tax, tax_rate
  from folio_entries
 where reference = (select number from pos_orders where id = :'mixed_id')
   and description not like '%service charge%'
 order by tax_rate;

\echo '--- the kitchen ticket fires each line once'
select pos_open_order((select id from pos_outlets where code='RST'), '12') as kot_id
\gset
select pos_add_line(:'kot_id', '00000000-0000-0000-0000-0000000000e3', 1) is not null as added;
select pos_send_kot(:'kot_id') as fired_expect_1;
select pos_send_kot(:'kot_id') as refired_expect_0;

\echo '--- housekeeping may read the menu but not change it, and sees no bills'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', false);
select count(*) > 0 as hk_sees_menu_expect_t from pos_items;
update pos_items set price = 1 where id = '00000000-0000-0000-0000-0000000000e3';
select price as price_unchanged_expect_500 from pos_items where id = '00000000-0000-0000-0000-0000000000e3';
select count(*) as hk_sees_orders_expect_0 from pos_orders;
select count(*) as hk_sees_payments_expect_0 from pos_payments;
reset role;

\echo '=== Module 13: reporting and access control ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);

\echo '--- an administrator can run every report'
select count(*) > 0 as daily_rows_expect_t   from report_daily(current_date - 2, current_date);
select count(*) > 0 as tax_rows_expect_t     from report_tax_summary(current_date - 400, current_date + 400);
select count(*) > 0 as outlet_rows_expect_t  from report_outlet_sales(current_date - 400, current_date + 400);
select count(*) > 0 as owed_rows_expect_t    from report_outstanding();
select count(*) >= 0 as hk_rows_ok           from report_housekeeping(current_date - 400, current_date + 400);

\echo '--- the daily report says whether a figure is closed or still live'
select distinct source from report_daily(current_date - 2, current_date);

\echo '--- a closed night audit fixes the figure, so the report stops moving'
insert into night_audits (business_date, status, completed_at, report)
values (
  current_date - 1, 'completed', now(),
  '{"rooms": {"available": 99, "sold": 7}, "revenue": {"room": 70000, "fees": 0, "extras": 0, "penalties": 0, "tax": 3500, "total": 73500}}'::jsonb
)
on conflict (business_date) do update set status = 'completed', report = excluded.report;
select source, rooms_available, rooms_sold, round(room_revenue) as room_rev, round(total_revenue) as total
  from report_daily(current_date - 1, current_date - 1);
\echo '    (the snapshot is used verbatim, not recomputed from the folio)'

\echo '--- the same range twice gives the same answer'
select (select round(sum(total_revenue)) from report_daily(current_date - 1, current_date - 1))
     = (select round(sum(total_revenue)) from report_daily(current_date - 1, current_date - 1)) as reproducible_expect_t;

\echo '--- EXPECT refusal: a housekeeper reading the tax summary'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', false);
select report_tax_summary(current_date - 30, current_date);

\echo '--- EXPECT refusal: a housekeeper reading outlet sales'
select report_outlet_sales(current_date - 30, current_date);

\echo '--- EXPECT refusal: a housekeeper reading what guests owe'
select report_outstanding();

\echo '--- EXPECT refusal: a housekeeper reading housekeeping performance (no reports.view)'
select report_housekeeping(current_date - 30, current_date);

\echo '--- a front desk agent has no reporting permission either: EXPECT refusal'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
select report_daily(current_date - 1, current_date);
reset role;

\echo '--- finance may read financial reports but a housekeeper never can'
select 'reports.financial on finance: ' ||
  (select count(*) from role_permissions where role_key='finance' and permission='reports.financial')::text;
select 'reports.financial on housekeeping: ' ||
  (select count(*) from role_permissions where role_key='housekeeping' and permission='reports.financial')::text;

\echo '--- the scheduler (service key, no signed-in user) may still run reports'
set role service_role;
select count(*) > 0 as service_can_report_expect_t from report_daily(current_date - 2, current_date);
reset role;

\echo '--- EXPECT refusal: an anonymous caller, who also has no auth.uid()'
set role anon;
select report_tax_summary(current_date - 30, current_date);
reset role;

\echo '--- schedules: only a scheduler-permission holder may write them'
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
insert into report_schedules (name, report, frequency, recipients)
values ('Owner daily', 'kpi_summary', 'daily', 'owner@example.com');
select name, report, frequency, is_active from report_schedules;
\echo '    EXPECT refusal: a housekeeper adding one'
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', false);
insert into report_schedules (name, report, frequency, recipients)
values ('Sneaky', 'daily_revenue', 'daily', 'hk@example.com');
select count(*) as hk_sees_schedules_expect_0 from report_schedules;
reset role;
