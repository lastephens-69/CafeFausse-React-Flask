import os, random, re , datetime as dt
from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import select, and_, desc
from dotenv import load_dotenv
from database import Base, engine, get_db
from models import Customer, Reservation
from sqlalchemy.orm import Session
from functools import wraps
from database import Base, engine, get_db, SessionLocal
from sqlalchemy.orm import joinedload
from seed_routes import register_seed_routes, small_register_seed_routes, register_capacity_seed_route
from datetime import datetime, time

load_dotenv()

app = Flask(__name__)
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")  # set on Render
register_seed_routes(app)
small_register_seed_routes(app)
register_capacity_seed_route(app)

# --- CORS (read from env; allow dev; optionally any *.netlify.app) ---
NETLIFY_URL = os.getenv("NETLIFY_URL", "").rstrip("/")  # e.g. https://cafe-fausse-ls.netlify.app

origins = []
if NETLIFY_URL:
    origins.append(NETLIFY_URL)
# local dev (vite)
origins.append("http://localhost:5173")
# optional: allow any Netlify subdomain (uncomment if you want this)
origins.append(re.compile(r"^https://.*\.netlify\.app$"))
CORS(app, resources={r"/api/*": {
    "origins": origins,
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "X-Admin-Token"],
    "max_age": 86400
}})
# Initialize tables if they don't exist
Base.metadata.create_all(bind=engine)

def parse_iso_datetime(value: str) -> dt.datetime:
    # Accepts ISO strings like "2025-10-31T19:30:00"
    try:
        # Allow timezone-less -> assume local; convert to naive for consistent storage or use UTC
        return dt.datetime.fromisoformat(value)
    except Exception:
        raise ValueError("Invalid datetime format. Use ISO 8601, e.g., 2025-10-31T19:30:00")

@app.get("/api/health")
def health():
    return jsonify({"ok": True}), 200

@app.post("/api/newsletter")
def newsletter():
    payload = request.get_json(force=True)
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    phone = (payload.get("phone") or "").strip() or None

    if not name or not email or "@" not in email:
        return jsonify({"error": "Name and valid email are required"}), 400

    with Session(engine) as db:
        # Upsert by email
        customer = db.scalar(select(Customer).where(Customer.email == email))
        if customer:
            customer.name = name or customer.name
            customer.phone = phone if phone is not None else customer.phone
            customer.newsletter_signup = True
        else:
            customer = Customer(name=name, email=email, phone=phone, newsletter_signup=True)
            db.add(customer)
        db.commit()
    return jsonify({"status": "subscribed"}), 201

@app.post("/api/reservations")
def create_reservation():
    payload = request.get_json(force=True)
    try:
        time_slot_str = payload.get("time_slot")
        time_slot = parse_iso_datetime(time_slot_str)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    party_size = int(payload.get("party_size") or 0)

    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    phone = (payload.get("phone") or "").strip() or None

    if party_size <= 0 or not name or not email or "@" not in email:
        return jsonify({"error": "Party size must be > 0, and name/email are required"}), 400

    total_tables = 30

    with Session(engine) as db:
        # ensure customer exists (upsert)
        customer = db.scalar(select(Customer).where(Customer.email == email))

        if not customer:
            customer = Customer(name=name, email=email, phone=phone, newsletter_signup=False)
            db.add(customer)
            db.flush()  # get id

        # Find taken tables for the exact time_slot
        taken = db.scalars(select(Reservation.table_number).where(Reservation.time_slot == time_slot)).all()
        taken_set = set(taken)

        if len(taken_set) >= total_tables:
            return jsonify({"error": "Time slot fully booked. Please choose another time."}), 409

        # Choose a random free table
        free_tables = [t for t in range(1, total_tables + 1) if t not in taken_set]
        table_number = random.choice(free_tables)

        reservation = Reservation(customer_id=customer.id, time_slot=time_slot, table_number=table_number,party_size=party_size)
        db.add(reservation)
        db.commit()

        return jsonify({
            "status": "confirmed",
            "reservation": {
                "id": reservation.id,
                "customer_id": customer.id,
                "time_slot": time_slot.isoformat(),
                "table_number": table_number,
                "party_size": party_size
            }
        }), 201

@app.get("/api/reservations")
def list_reservations():
    # Simple admin-ish endpoint to view reservations (optional convenience)
    time_slot_str = request.args.get("time_slot")
    with Session(engine) as db:
        query = select(Reservation)
        if time_slot_str:
            try:
                ts = parse_iso_datetime(time_slot_str)
                query = query.where(Reservation.time_slot == ts)
            except Exception:
                return jsonify({"error": "Invalid time_slot query param"}), 400
        rows = db.scalars(query).all()
        data = [{
            "id": r.id,
            "customer_id": r.customer_id,
            "time_slot": r.time_slot.isoformat(),
            "table_number": r.table_number,
            "party_size": r.party_size
        } for r in rows]
        return jsonify(data), 200

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = request.headers.get("X-Admin-Token")
        if token != ADMIN_TOKEN:
            return jsonify({"error": "Unauthorized"}), 401
        return fn(*args, **kwargs)
    return wrapper

def to_dict_customer(c: Customer):
    return {
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "phone": c.phone,
        "newsletter_signup": c.newsletter_signup,
        "created_at": format_timeslot(c.created_at) if c.created_at else None
    }

def to_dict_reservation(r: Reservation):
    return {
        "id": r.id,
        "Customer_id": r.customer_id,
        "table_number": r.table_number,
        "time_slot": r.time_slot.isoformat(),
        "party_size": r.party_size,
        "created_at": getattr(r, "created_at", None),
    }

@app.get("/api/admin/summary")
def admin_summary():
    with SessionLocal() as db:
        customers = db.execute(select(Customer)).scalars().all()
        reservations = db.execute(select(Reservation)).scalars().all()
        return {
            "customers": len(customers),
            "reservations": len(reservations)
        }

@app.get("/api/admin/customers")
def admin_customers():
    with SessionLocal() as db:
        rows = db.execute(
            select(Customer).order_by(Customer.id.desc()).limit(200)
        ).scalars().all()
        data = [to_dict_customer(c) for c in rows]
        return jsonify(data)  # <-- always JSON

@app.get("/api/admin/reservations")
def admin_reservations():
    with SessionLocal() as db:
        today = datetime.combine(datetime.today().date(), time.min)
        res_list = (
            db.query(Reservation)
            .options(joinedload(Reservation.customer))
            .where(Reservation.time_slot >= today)
            .order_by(desc(Reservation.time_slot), desc(Reservation.table_number), desc(Reservation.created_at))
            .all()
        )
        data = []
        for r in res_list:
            c = r.customer
            data.append({
                "id": r.id,
                "party_size": r.party_size,
                "table_number": r.table_number,
                "time_slot": format_timeslot(r.time_slot),
                "created_at": format_timeslot(r.created_at) if r.created_at else None,
                "customer": {
                    "id": c.id,
                    "name": c.name,
                    "email": c.email,
                    "phone": c.phone,
                } if c else None
            })
        return jsonify(data)

def format_timeslot(dt_obj):
    return dt_obj.strftime("%Y-%m-%d %H:%M")


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))
    app.run(host=host, port=port)
