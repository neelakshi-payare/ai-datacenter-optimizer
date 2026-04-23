from simulation.datacenter import DataCenterSimulation

sim = DataCenterSimulation(num_servers=10, num_tasks=50, seed=42)
result = sim.run(model_type="hybrid")
print(result)