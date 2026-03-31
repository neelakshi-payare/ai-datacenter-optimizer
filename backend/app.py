from flask import Flask, jsonify, request
from flask_cors import CORS
from simulation.datacenter import DataCenterSimulation

app = Flask(__name__)
CORS(app)

# ── Home route ──────────────────────────────
@app.route("/")
def home():
    return jsonify({"message": "AI Data Center API is running!"})

# ── Run single model simulation ──────────────
@app.route("/simulate", methods=["POST"])
def simulate():
    data       = request.get_json()
    model      = data.get("model", "hybrid").lower()
    num_tasks  = int(data.get("num_tasks", 100))
    num_servers= int(data.get("num_servers", 10))

    sim    = DataCenterSimulation(num_servers=num_servers, num_tasks=num_tasks)
    result = sim.run(model_type=model)
    return jsonify(result)

# ── Compare all 4 models ─────────────────────
@app.route("/compare", methods=["GET"])
def compare():
    models  = ["ml", "rl", "dqn", "hybrid"]
    results = []
    for m in models:
        sim = DataCenterSimulation(num_servers=10, num_tasks=100)
        results.append(sim.run(model_type=m))
    return jsonify(results)

# ── Energy breakdown by component ────────────
@app.route("/energy-breakdown", methods=["GET"])
def energy_breakdown():
    breakdown = {
        "components": ["Servers", "Cooling", "Storage", "Network"],
        "baseline":   [250000, 175000, 50000, 25000],
        "optimized":  [210000, 130000, 45000, 22000],
        "percentages":[50, 35, 10, 5]
    }
    return jsonify(breakdown)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
