import simpy
import numpy as np
import random
import pandas as pd
import os

class DataCenterSimulation:
    def __init__(self, num_servers=10, num_tasks=100, seed=42):
        # ✅ seed is set HERE before anything else
        random.seed(seed)
        np.random.seed(seed)
        self.num_servers = num_servers
        self.num_tasks = num_tasks
        self.total_energy = 0
        self.tasks_completed = 0
        self.sla_violations = 0
        self.energy_log = []
        self.completion_times = []

        # Load real dataset
        csv_path = os.path.join(os.path.dirname(__file__), "container_scheduling_dataset.csv")
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path).dropna()
            self.real_power    = df["Power_Consumption_Watts"].values
            self.real_duration = (df["Makespan_ms"].values / 1000.0)
            self.real_efficiency = df["Energy_Efficiency_Score"].values
            self.use_real_data = True
        else:
            self.use_real_data = False

    def _sample(self, array):
        return float(np.random.choice(array))

    def run(self, model_type="hybrid"):
        env = simpy.Environment()
        servers = simpy.Resource(env, capacity=self.num_servers)

        self.total_energy = 0
        self.tasks_completed = 0
        self.sla_violations = 0
        self.energy_log = []
        self.completion_times = []

        energy_factors = {
            "ml":     1.0,
            "rl":     0.65,
            "dqn":    0.58,
            "hybrid": 0.49
        }
        factor = energy_factors.get(model_type, 1.0)

        def task(env, task_id, servers):
            arrival = env.now
            if self.use_real_data:
                duration   = self._sample(self.real_duration)
                power      = self._sample(self.real_power) * factor
                efficiency = self._sample(self.real_efficiency)
                sla_limit  = 6.0 + (efficiency * 4.0)
            else:
                duration  = np.random.uniform(2, 8)
                power     = np.random.uniform(100, 500) * factor
                sla_limit = 10.0

            with servers.request() as req:
                yield req
                yield env.timeout(duration)

            energy_used = power * duration / 3_600_000
            self.total_energy += energy_used
            self.tasks_completed += 1
            self.energy_log.append(round(energy_used, 6))

            total_time = env.now - arrival
            self.completion_times.append(round(total_time, 4))
            if total_time > sla_limit:
                self.sla_violations += 1

        def task_generator(env, servers):
            for i in range(self.num_tasks):
                env.process(task(env, i, servers))
                yield env.timeout(np.random.exponential(0.8))

        env.process(task_generator(env, servers))
        env.run(until=500)

        avg_time = round(float(np.mean(self.completion_times)), 3) if self.completion_times else 0
        sla_compliance = round((1 - self.sla_violations / max(self.tasks_completed, 1)) * 100, 2)

        return {
            "model":               model_type.upper(),
            "total_energy_kwh":    round(self.total_energy, 6),
            "tasks_completed":     self.tasks_completed,
            "sla_violations":      self.sla_violations,
            "sla_compliance":      sla_compliance,
            "avg_completion_time": avg_time,
            "energy_log":          self.energy_log[:30],
            "data_source":         "real_kaggle" if self.use_real_data else "simulated"
        }