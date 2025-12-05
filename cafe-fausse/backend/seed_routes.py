# seed_routes.py
"""
Admin seeding routes for Café Fausse (staging + local)
Creates demo customers and dinner-hour reservations (default 5–11 PM) for the next N days.
Requires header:  X-Admin-Token: <ADMIN_TOKEN>

Endpoints:
- POST /api/admin/seed?days=7&start_hour=17&end_hour=23&step=30&fully_book_demo=true&wipe_customers=false
- POST /api/admin/smallseed?days=1&start_hour=17&end_hour=23&step=30&wipe_customers=false
"""

import os
from datetime import datetime, timedelta, time
from zoneinfo import ZoneInfo
from flask import request, jsonify
from sqlalchemy import text
from models import Customer, Reservation
from database import SessionLocal

# --- Config ---
LOCAL_TZ = ZoneInfo(os.getenv("LOCAL_TZ", "America/Chicago"))
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "dev-secret-123")
MAX_PER_SLOT = 30

# --- Helpers ---
def _ensure_demo_customers(session):
    demo_data = [
        ("Avery Chen",  "avery.chen@example.com",  "202-555-0101", True),
        ("Jordan Patel","jordan.patel@example.com","202-555-0102", False),
        ("Riley Nguyen","riley.nguyen@example.com","202-555-0103", True),
        ("Samira Ali",  "samira.ali@example.com",  "202-555-0104", False),
        ("Diego Romero","diego.romero@example.com","202-555-0105", False),
        ("Priya Shah",  "priya.shah@example.com",  "202-555-0106", True),
        ("Maya Thompson","maya.thompson@example.com","202-555-0107", True),
        ("Ethan Rivera","ethan.rivera@example.com","202-555-0108", False),
        ("Zoe Park",    "zoe.park@example.com",    "202-555-0109", True),
        ("Leo Carter",  "leo.carter@example.com",  "202-555-0110", False),
    ]
    existing = {e for (e,) in session.query(Customer.email).filter(Customer.email.like("%@example.com"))}
    to_add = [
        Customer(name=n, email=e, phone=p, newsletter_signup=ns)
        for (n, e, p, ns) in demo_data if e not in existing
    ]
    if to_add:
        session.add_all(to_add)
        session.flush()
    return session.query(Customer).filter(Customer.email.like("%@example.com")).order_by(Customer.id).all()

def _slots_for_day(day, start_hour=17, end_hour=23, step_minutes=30):
    """Return timezone-aware datetimes from start_hour to end_hour inclusive, on given day, at step_minutes increments."""
    start = datetime.combine(day, time(start_hour, 0), tzinfo=LOCAL_TZ)
    end   = datetime.combine(day, time(end_hour, 0), tzinfo=LOCAL_TZ)
    slots = []
    cur = start
    while cur <= end:
        slots.append(cur)
        cur += timedelta(minutes=step_minutes)
    return slots

def _seed_reservations(
    session,
    days=7,
    start_hour=17,
    end_hour=23,
    step_minutes=30,
    mode="normal",
    fully_book_demo=True,
):
    """
    Seed reservations for the next `days`, dinner window only.
    mode = "normal" | "small"
      - normal: realistic load by hour; fully books one 7PM slot if enabled
      - small:  only 3 tables per slot (demo-light)
    """
    customers = _ensure_demo_customers(session)
    if not customers:
        return {"created_slots": 0, "created_reservations": 0}

    today = datetime.now(LOCAL_TZ).date()
    party_pattern = [2, 4, 3, 5, 2, 6]
    total_customers = len(customers)

    # pick one future day to fully book the 7:00 PM slot for demo
    full_day_idx = min(2, max(0, days - 1))  # e.g., 2 days from today
    full_slot_hour = 19
    full_slot_min = 0

    created_slots = 0
    created_res = 0

    for d in range(days):
        day = today + timedelta(days=d)
        for dt in _slots_for_day(day, start_hour, end_hour, step_minutes):
            # choose target occupancy
            if mode == "small":
                target = min(3, MAX_PER_SLOT)
            else:
                # fully book a single 7:00 PM slot for demo if requested
                if (
                    fully_book_demo
                    and d == full_day_idx
                    and dt.hour == full_slot_hour
                    and dt.minute == full_slot_min
                ):
                    target = MAX_PER_SLOT
                else:
                    # realistic load curve by hour
                    h = dt.hour
                    if h < 18:      target = 8     # 5:00–5:30
                    elif h == 18:   target = 12    # 6:00–6:30
                    elif h == 19:   target = 18    # 7:00–7:30
                    elif h == 20:   target = 16    # 8:00–8:30
                    else:           target = 10    # 9:00–11:00

            # seed up to `target` distinct tables
            seeded_this_slot = 0
            for table_n in range(1, min(target, MAX_PER_SLOT) + 1):
                # skip existing collisions
                if session.query(Reservation.id).filter_by(time_slot=dt, table_number=table_n).first():
                    continue
                c = customers[(table_n - 1) % total_customers]
                reservation = Reservation(
                    customer_id=c.id,
                    party_size=party_pattern[(table_n - 1) % len(party_pattern)],
                    time_slot=dt,
                    table_number=table_n,
                )
                session.add(reservation)
                created_res += 1
                seeded_this_slot += 1

            if seeded_this_slot > 0:
                created_slots += 1

    return {"created_slots": created_slots, "created_reservations": created_res}

# --- Route registration ---
def register_seed_routes(app):
    """Attach admin seeding routes to the Flask app under /api/admin/*."""
    @app.post("/api/admin/seed")
    def admin_seed():
        token = request.headers.get("X-Admin-Token")
        if token != ADMIN_TOKEN:
            return jsonify({"error": "unauthorized"}), 401

        # query params (defaults: dinner window 5–11 PM)
        days = int(request.args.get("days", 7))
        start_hour = int(request.args.get("start_hour", 17))
        end_hour = int(request.args.get("end_hour", 23))
        step = int(request.args.get("step", 30))
        fully_book_demo = request.args.get("fully_book_demo", "true").lower() == "true"
        wipe_customers = request.args.get("wipe_customers", "false").lower() == "true"

        session = SessionLocal()
        try:
            # wipe reservations; optionally wipe customers
            session.execute(text("TRUNCATE TABLE reservations RESTART IDENTITY CASCADE;"))
            if wipe_customers:
                session.execute(text("TRUNCATE TABLE customers RESTART IDENTITY CASCADE;"))
            session.commit()

            result = _seed_reservations(
                session,
                days=days,
                start_hour=start_hour,
                end_hour=end_hour,
                step_minutes=step,
                mode="normal",
                fully_book_demo=fully_book_demo,
            )
            session.commit()
            return jsonify({"ok": True, "wiped_customers": wipe_customers, **result}), 200
        except Exception as e:
            session.rollback()
            return jsonify({"ok": False, "error": str(e)}), 500
        finally:
            session.close()

def small_register_seed_routes(app):
    """Attach lightweight seeding under /api/admin/smallseed (few tables per slot)."""
    @app.post("/api/admin/smallseed")
    def admin_small_seed():
        token = request.headers.get("X-Admin-Token")
        if token != ADMIN_TOKEN:
            return jsonify({"error": "unauthorized"}), 401

        days = int(request.args.get("days", 1))
        start_hour = int(request.args.get("start_hour", 17))
        end_hour = int(request.args.get("end_hour", 23))
        step = int(request.args.get("step", 30))
        wipe_customers = request.args.get("wipe_customers", "false").lower() == "true"

        session = SessionLocal()
        try:
            session.execute(text("TRUNCATE TABLE reservations RESTART IDENTITY CASCADE;"))
            if wipe_customers:
                session.execute(text("TRUNCATE TABLE customers RESTART IDENTITY CASCADE;"))
            session.commit()

            result = _seed_reservations(
                session,
                days=days,
                start_hour=start_hour,
                end_hour=end_hour,
                step_minutes=step,
                mode="small",            # <-- lightweight mode
                fully_book_demo=False,   # <-- no fully-booked slot in small seed
            )
            session.commit()
            return jsonify({"ok": True, "wiped_customers": wipe_customers, **result}), 200
        except Exception as e:
            session.rollback()
            return jsonify({"ok": False, "error": str(e)}), 500
        finally:
            session.close()

# --- Capacity test scenario (exact 30 & 29) ---
def _seed_capacity_scenario(session, day_offset=0, hour=19, minute=0, step_minutes=30):
    """
    Seeds exactly two time slots on a given day:
      - Slot A: filled with 30 reservations (full)
      - Slot B: filled with 29 reservations (1 open table)

    Returns dict summary with the two slot timestamps.
    """
    customers = _ensure_demo_customers(session)
    if not customers:
        return {"error": "no demo customers available"}

    today = datetime.now(LOCAL_TZ).date()
    base_day = today + timedelta(days=day_offset)

    slot_full   = datetime.combine(base_day, time(hour, minute), tzinfo=LOCAL_TZ)
    slot_almost = slot_full + timedelta(minutes=step_minutes)

    # wipe existing reservations only (keep customers)
    session.execute(text("TRUNCATE TABLE reservations RESTART IDENTITY CASCADE;"))
    session.commit()

    party_pattern = [2, 4, 3, 5, 2, 6]
    total_customers = len(customers)

    def _fill_slot(dt, target_tables):
        created = 0
        for table_n in range(1, target_tables + 1):
            # skip if already exists (shouldn't, after truncate)
            if session.query(Reservation.id).filter_by(time_slot=dt, table_number=table_n).first():
                continue
            c = customers[(table_n - 1) % total_customers]
            r = Reservation(
                customer_id=c.id,
                party_size=party_pattern[(table_n - 1) % len(party_pattern)],
                time_slot=dt,
                table_number=table_n,
            )
            session.add(r)
            created += 1
        return created

    created_full   = _fill_slot(slot_full,   30)  # exactly 30
    created_almost = _fill_slot(slot_almost, 29)  # exactly 29

    session.commit()

    return {
        "ok": True,
        "slot_full":   slot_full.isoformat(),
        "slot_almost": slot_almost.isoformat(),
        "created_full": created_full,
        "created_almost": created_almost,
        "note": "slot_full has 30 reservations; slot_almost has 29.",
    }


def register_capacity_seed_route(app):
    """POST /api/admin/seed_capacity — seed two slots (30 & 29 tables) for testing."""
    @app.post("/api/admin/seed_capacity")
    def admin_seed_capacity():
        token = request.headers.get("X-Admin-Token")

        # OPTIONAL query params (defaults: today @ 19:00 and 19:30)
        day_offset   = int(request.args.get("day", 0))       # 0=today, 1=tomorrow, etc.
        hour         = int(request.args.get("hour", 19))     # 24-hour clock
        minute       = int(request.args.get("minute", 0))    # 0/30 recommended
        step_minutes = int(request.args.get("step", 30))     # 30-minute spacing

        session = SessionLocal()
        try:
            result = _seed_capacity_scenario(
                session,
                day_offset=day_offset,
                hour=hour,
                minute=minute,
                step_minutes=step_minutes,
            )
            return jsonify(result), 200
        except Exception as e:
            session.rollback()
            return jsonify({"ok": False, "error": str(e)}), 500
        finally:
            session.close()
