import sys
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import db, Progress  
from auth import auth_bp
from flask_socketio import SocketIO
from datetime import datetime

app = Flask(__name__)
CORS(app)

# 1. DATABASE CONFIG
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rehab.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 2. INITIALIZE
try:
    db.init_app(app)
    app.register_blueprint(auth_bp)
    socketio = SocketIO(app, cors_allowed_origins="*")
    print("Flask app, DB, and Blueprints initialized successfully.")
except Exception as e:
    print(f"Initialization Error: {e}")

# --- 🆕 DOCTOR REPORTS MODEL ---
class DoctorReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.String(50))
    patient_name = db.Column(db.String(100))
    exercise = db.Column(db.String(100))
    reps = db.Column(db.Integer)
    errors = db.Column(db.Integer)
    date = db.Column(db.String(50))
    status = db.Column(db.String(20), default="New")

# --- 🆕 EXERCISE PLAN MODEL (Navin Table) ---
class ExercisePlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.String(50), unique=True) # Eka patient la ekach active plan
    exercise_name = db.Column(db.String(100))
    sets = db.Column(db.Integer)
    reps = db.Column(db.Integer)
    doctor_name = db.Column(db.String(100))
    date_assigned = db.Column(db.String(50))

@app.route('/')
def home():
    return "Backend Running 🚀"

# --- 🆕 SEND PLAN (Doctor Dashboard kadhun yeil) ---
@app.route('/api/send-plan', methods=['POST'])
def send_plan():
    try:
        data = request.json
        patient_id = data.get('patient_id')
        
        # Check kara jar ya patient la aadhich plan dila asel tar to update kara, nase tar navin banva
        plan = ExercisePlan.query.filter_by(patient_id=patient_id).first()
        
        if plan:
            plan.exercise_name = data.get('exercise')
            plan.sets = data.get('sets')
            plan.reps = data.get('reps')
            plan.doctor_name = data.get('doctor_name')
            plan.date_assigned = datetime.now().strftime("%d %b %Y")
        else:
            plan = ExercisePlan(
                patient_id=patient_id,
                exercise_name=data.get('exercise'),
                sets=data.get('sets'),
                reps=data.get('reps'),
                doctor_name=data.get('doctor_name'),
                date_assigned=datetime.now().strftime("%d %b %Y")
            )
            db.session.add(plan)
            
        db.session.commit()
        return jsonify({"status": "success", "message": "Plan assigned successfully!"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- 🆕 GET PLAN (Patient Dashboard madhe fetch hoin) ---
@app.route('/api/get-plan/<patient_id>', methods=['GET'])
def get_plan(patient_id):
    try:
        plan = ExercisePlan.query.filter_by(patient_id=patient_id).first()
        if plan:
            return jsonify({
                "exercise": plan.exercise_name,
                "sets": plan.sets,
                "reps": plan.reps,
                "doctor_name": plan.doctor_name,
                "date": plan.date_assigned
            }), 200
        return jsonify({"message": "No plan assigned yet"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- FETCH PROGRESS HISTORY ---
@app.route('/api/progress/<patient_id>', methods=['GET'])
def get_progress(patient_id):
    try:
        records = Progress.query.filter_by(patient_id=patient_id).order_by(Progress.id.desc()).all()
        history = [ {
            "date": r.date,
            "exercise": r.exercise,
            "reps": r.reps,
            "errors": r.errors,
            "accuracy": r.accuracy
        } for r in records ]
        return jsonify(history), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- SAVE PROGRESS ENDPOINT ---
@app.route('/api/save-progress', methods=['POST'])
def save_progress():
    try:
        data = request.json
        patient_id = data.get('patient_id')
        date = data.get('date') 
        record = Progress.query.filter_by(patient_id=patient_id, date=date).first()

        if record:
            record.reps += int(data.get('reps', 0))
            record.errors += int(data.get('errors', 0))
            total = record.reps + record.errors
            record.accuracy = int((record.reps / total) * 100) if total > 0 else 0
        else:
            reps = int(data.get('reps', 0))
            errors = int(data.get('errors', 0))
            total = reps + errors
            accuracy = int((reps / total) * 100) if total > 0 else 0
            record = Progress(
                patient_id=patient_id,
                exercise=data.get('exercise', 'General Rehab'),
                reps=reps,
                errors=errors,
                date=date,
                accuracy=accuracy
            )
            db.session.add(record)

        db.session.commit()
        return jsonify({"status": "success", "total_reps": record.reps}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- SEND REPORT TO DOCTOR ---
@app.route('/api/send-report', methods=['POST'])
def send_report():
    try:
        data = request.json
        new_report = DoctorReport(
            patient_id=data.get('patient_id'),
            patient_name=data.get('patient_name'),
            exercise=data.get('exercise'),
            reps=data.get('reps'),
            errors=data.get('errors'),
            date=data.get('date'),
            status="Sent"
        )
        db.session.add(new_report)
        db.session.commit()
        return jsonify({"status": "success", "message": "Report sent to doctor!"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- DOCTOR GET ALL REPORTS ---
@app.route('/api/doctor/all-reports', methods=['GET'])
def get_doctor_reports():
    try:
        reports = DoctorReport.query.order_by(DoctorReport.id.desc()).all()
        output = [{
            "id": r.id,
            "patient_name": r.patient_name,
            "exercise": r.exercise,
            "reps": r.reps,
            "errors": r.errors,
            "date": r.date,
            "status": r.status
        } for r in reports]
        return jsonify(output), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

# 3. SERVER START LOGIC
if __name__ == '__main__':
    try:
        print("--- Starting Remote Rehab AI Server ---")
        with app.app_context():
            db.create_all() 
            print("Database Tables: Verified/Created.")
        socketio.run(app, debug=True, port=5000)
    except Exception as e:
        print(f"CRITICAL SERVER ERROR: {e}")
        sys.exit(1)