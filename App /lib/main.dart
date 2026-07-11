import 'package:flutter/material.dart';
import 'dart:math';

void main() {
  runApp(const RocketApp());
}

class RocketApp extends StatelessWidget {
  const RocketApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rocket Trajectory',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        primaryColor: Colors.orange,
        scaffoldBackgroundColor: Colors.black,
      ),
      home: const RocketCalculatorScreen(),
    );
  }
}

class RocketCalculatorScreen extends StatefulWidget {
  const RocketCalculatorScreen({super.key});

  @override
  State<RocketCalculatorScreen> createState() => _RocketCalculatorScreenState();
}

class _RocketCalculatorScreenState extends State<RocketCalculatorScreen> {
  final _fuelController = TextEditingController();
  final _distanceController = TextEditingController();
  
  String result = "";
  List<Map<String, double>> trajectoryPoints = [];

  void calculateTrajectory() {
    double fuel = double.tryParse(_fuelController.text) ?? 0;
    double distance = double.tryParse(_distanceController.text) ?? 0;

    if (fuel <= 0 || distance <= 0) {
      setState(() => result = "Please enter valid positive values");
      return;
    }

    // Simple Rocket Equation + Trajectory Simulation
    double exhaustVelocity = 3000; // m/s (typical)
    double massRatio = fuel / 1000 + 1; // rough
    double deltaV = exhaustVelocity * log(massRatio);

    double time = distance / (deltaV * 0.6); // rough estimate
    double maxAltitude = (deltaV * deltaV) / (2 * 9.81);

    // Generate trajectory points for graph
    trajectoryPoints.clear();
    for (double t = 0; t <= time; t += time / 20) {
      double x = distance * (t / time);
      double y = maxAltitude * sin(3.14 * t / time); // simple curve
      trajectoryPoints.add({'x': x, 'y': y});
    }

    setState(() {
      result = """
Fuel Used: ${fuel.toStringAsFixed(0)} kg
Delta-V: ${deltaV.toStringAsFixed(0)} m/s
Estimated Flight Time: ${time.toStringAsFixed(1)} seconds
Max Altitude: ${maxAltitude.toStringAsFixed(0)} meters
Mission Feasibility: ${deltaV > 5000 ? "High" : "Medium"}
""";
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("🚀 Rocket Trajectory Calculator"),
        backgroundColor: Colors.orange.shade900,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _fuelController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: "Rocket Fuel (kg)",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _distanceController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: "Distance / Range (km)",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 60,
              child: ElevatedButton(
                onPressed: calculateTrajectory,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  foregroundColor: Colors.black,
                  textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                child: const Text("CALCULATE TRAJECTORY"),
              ),
            ),
            const SizedBox(height: 20),
            if (result.isNotEmpty)
              Card(
                color: Colors.grey[900],
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    result,
                    style: const TextStyle(fontSize: 16, height: 1.6),
                  ),
                ),
              ),
            const SizedBox(height: 20),
            if (trajectoryPoints.isNotEmpty)
              const Text("Trajectory Preview:", style: TextStyle(fontSize: 18)),
            // Simple text-based graph for now (we can improve with fl_chart later)
            if (trajectoryPoints.isNotEmpty)
              Container(
                height: 200,
                width: double.infinity,
                color: Colors.black54,
                child: Center(
                  child: Text(
                    "📈 Simple parabolic trajectory generated\n"
                    "(${trajectoryPoints.length} points)",
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
