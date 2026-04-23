import math, time
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
    data        = request.get_json()
    model       = data.get("model", "hybrid").lower()
    num_tasks   = int(data.get("num_tasks", 100))
    num_servers = int(data.get("num_servers", 10))

    # Stable seed: same model + tasks + servers = always same result
    seed = (ord(model[0]) * 1000 + num_tasks * 10 + num_servers) % (2**32)

    sim    = DataCenterSimulation(num_servers=num_servers, num_tasks=num_tasks, seed=seed)
    result = sim.run(model_type=model)
    return jsonify(result)

# ── Compare all 4 models ─────────────────────
@app.route("/compare", methods=["GET"])
def compare():
    models  = ["ml", "rl", "dqn", "hybrid"]
    results = []
    for m in models:
        seed = (ord(m[0]) * 1000 + 100 * 10 + 10) % (2**32)
        sim  = DataCenterSimulation(num_servers=10, num_tasks=100, seed=seed)
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
# ── Add this route to your existing app.py ────────────────────────────────────
# Paste this block BEFORE the `if __name__ == "__main__":` line


@app.route("/resources", methods=["GET"])
def resources():
    """
    Returns simulated real-time CPU, Memory, Network usage per server.
    Query param: ?num_servers=6  (default 6)
    """
    num_servers = int(request.args.get("num_servers", 6))
    tick = time.time()   # use real time so each call returns fresh values

    servers = []
    for i in range(num_servers):
        base = 30 + i * 5
        cpu  = min(95, max(5, base + math.sin(tick * 0.3 + i) * 15 + (i % 3) * 4))
        mem  = min(90, max(10, base + 10 + math.cos(tick * 0.2 + i) * 12))
        net  = min(100, max(0, 20 + math.sin(tick * 0.5 + i * 2) * 18))

        status = "critical" if cpu > 85 else ("warning" if cpu > 65 else "healthy")

        servers.append({
            "id":      f"SRV-{str(i+1).zfill(2)}",
            "cpu":     round(cpu, 1),
            "memory":  round(mem, 1),
            "network": round(net, 1),
            "status":  status,
            "tasks":   int((cpu / 10) + (i % 4) + 2),
        })

    avg = lambda key: round(sum(s[key] for s in servers) / len(servers), 1) if servers else 0

    return jsonify({
        "servers":      servers,
        "summary": {
            "avg_cpu":     avg("cpu"),
            "avg_memory":  avg("memory"),
            "avg_network": avg("network"),
            "total_tasks": sum(s["tasks"] for s in servers),
            "critical":    sum(1 for s in servers if s["status"] == "critical"),
            "warning":     sum(1 for s in servers if s["status"] == "warning"),
            "healthy":     sum(1 for s in servers if s["status"] == "healthy"),
        },
        "timestamp": round(tick, 2)
    })
if __name__ == "__main__":
 import os
 port = int(os.environ.get("PORT", 8080))
 app.run(debug=False, host="0.0.0.0", port=port)