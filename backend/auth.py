from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from database import db, User, PatientProfile, DoctorProfile, Progress, Message

auth_bp = Blueprint('auth', __name__)

# ---------------- REGISTER ----------------
@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()

    new_user = User(
        name=data['name'],
        email=data['email'],
        password=generate_password_hash(data['password']),
        role=data['role']
    )

    db.session.add(new_user)
    db.session.flush()

    if data['role'] == 'patient':
        db.session.add(PatientProfile(user_id=new_user.id))
    else:
        db.session.add(DoctorProfile(user_id=new_user.id))

    db.session.commit()
    return {"message": "Registered"}

# ---------------- LOGIN ----------------
@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if user and check_password_hash(user.password, data['password']):
        return {"user": {"id": user.id, "name": user.name, "role": user.role}}
    return {"error": "Invalid"}, 401

# ---------------- PATIENTS ----------------
@auth_bp.route('/api/patients', methods=['GET'])
def get_patients():
    profiles = PatientProfile.query.all()
    return [
        {
            "profile_id": p.id,
            "name": User.query.get(p.user_id).name,
            "age": p.age,
            "condition": p.condition
        } for p in profiles
    ]

# ---------------- SAVE PROGRESS ----------------
@auth_bp.route('/api/save-progress', methods=['POST'])
def save_progress():
    data = request.get_json()
    today = datetime.now().strftime("%Y-%m-%d")

    entry = Progress.query.filter_by(
        patient_id=data['patient_id'],
        date=today
    ).first()

    if entry:
        entry.reps = data['reps']
    else:
        db.session.add(Progress(
            patient_id=data['patient_id'],
            date=today,
            reps=data['reps']
        ))

    db.session.commit()
    return {"message": "Saved"}

# ---------------- GET PROGRESS ----------------
@auth_bp.route('/api/progress/<int:id>', methods=['GET'])
def get_progress(id):
    today = datetime.now()
    week = []

    for i in range(6, -1, -1):
        day = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        entry = Progress.query.filter_by(patient_id=id, date=day).first()

        week.append({
            "day": day,
            "reps": entry.reps if entry else 0
        })

    return week

# ---------------- CHAT ----------------
@auth_bp.route('/api/send-message', methods=['POST'])
def send_message():
    data = request.get_json()

    msg = Message(**data)
    db.session.add(msg)
    db.session.commit()

    return {"message": "sent"}

@auth_bp.route('/api/get-messages', methods=['GET'])
def get_messages():
    msgs = Message.query.all()

    return [
        {
            "from": m.sender,
            "text": m.text,
            "time": m.time
        } for m in msgs
    ]