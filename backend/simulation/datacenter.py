import simpy
import numpy as np
import random

class DataCenterSimulation:
    def __init__(self, num_servers=10, num_tasks=100):
        self.num_servers = num_servers
        self.num_tasks = num_tasks
        self.total_energy = 0
        self.tasks_completed = 0
        self.sla_violations = 0
        self.energy_log = []
        self.completion_times = []

    def run(self, model_type="hybrid"):
        env = simpy.Environment()
        servers = simpy.Resource(env, capacity=self.num_servers)

        # Reset stats
        self.total_energy = 0
        self.tasks_completed = 0
        self.sla_violations = 0
        self.energy_log = []
        self.completion_times = []

        # Energy factor per model
        energy_factors = {
            "ml":     1.0,
            "rl":     0.65,
            "dqn":    0.58,
            "hybrid": 0.49
        }
        factor = energy_factors.get(model_type, 1.0)

        def task(env, task_id, servers):
            arrival = env.now
            duration = np.random.uniform(2, 8)
            power    = np.random.uniform(100, 500) * factor
            sla_limit = 10.0

            with servers.request() as req:
                yield req
                yield env.timeout(duration)

            energy_used = power * duration / 1000
            self.total_energy += energy_used
            self.tasks_completed += 1
            self.energy_log.append(round(energy_used, 4))

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
            "model": model_type.upper(),
            "total_energy_kwh": round(self.total_energy, 4),
            "tasks_completed": self.tasks_completed,
            "sla_violations": self.sla_violations,
            "sla_compliance": sla_compliance,
            "avg_completion_time": avg_time,
            "energy_log": self.energy_log[:30]
        }