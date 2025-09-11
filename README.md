# Interactive Control Lab 🎛️

An interactive Jupyter Book for teaching PID control with real-time simulations and AI assistance.

## Features

### 📚 **Interactive Learning Materials**
- **Mathematical Foundations**: Complete PID control theory with properly rendered equations
- **Live Code Execution**: Students can run and modify Python code directly in the browser using Thebe
- **AI Chat Assistant**: Integrated multi-model AI chat using OpenRouter (GPT, Claude, Gemini, Grok)

### 🎮 **Real-Time PID Simulation**
- **Inverted Pendulum Control**: Interactive simulation of a rotary inverted pendulum
- **Live Visualization**: Real-time animated pendulum showing current angle and reference
- **Interactive Parameters**: Adjust PID gains (Kp, Ki, Kd) and see immediate response
- **Multiple References**: Step input and sine wave tracking
- **Disturbance Testing**: Inject torque disturbances to test robustness
- **Physical Parameters**: Modify mass, length, damping, and gravity

### 📊 **Advanced Plotting**
- **Angle Tracking Plot**: Reference vs actual angle in real-time
- **Control Signal Decomposition**: P, I, D terms visualization
- **Responsive Design**: Clean, modern interface that works on all devices

## Quick Start

### Prerequisites
- Python 3.8+
- Jupyter Book
- Node.js (for some dependencies)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/YOUR_USERNAME/interactive-control-lab.git
cd interactive-control-lab
```

2. Install dependencies:
```bash
pip install jupyter-book
```

3. Build the book:
```bash
jupyter-book build .
```

4. Open the book:
```bash
open _build/html/index.html
```

### Online Access

Visit the live version at: [https://YOUR_USERNAME.github.io/interactive-control-lab/](https://YOUR_USERNAME.github.io/interactive-control-lab/)

## How to Use

### For Students:
1. **Read the Theory**: Start with the PID control fundamentals
2. **Try the Code**: Execute Python examples directly in your browser
3. **Experiment**: Use the interactive simulation to understand PID behavior
4. **Get Help**: Use the AI chat assistant for questions
5. **Complete Exercises**: Work through the provided problems

### For Educators:
1. **Customize Content**: Modify markdown files for your curriculum
2. **Add Exercises**: Create new interactive code blocks
3. **Adjust Simulation**: Modify parameters in `_static/inverted-pendulum.js`
4. **Deploy**: Use GitHub Pages for easy student access

## File Structure

```
├── index.md              # Main landing page
├── student-guide.md      # How to use this book
├── pid.md               # PID theory and examples
├── simulation.md        # Interactive simulation page
├── exercises.md         # Practice problems
├── references.md        # Bibliography
├── _config.yml         # Jupyter Book configuration
├── _toc.yml           # Table of contents
└── _static/
    ├── chat.js         # AI chat widget
    ├── chat.css        # Styling for chat and code
    └── inverted-pendulum.js  # Real-time simulation
```

## Technical Details

### Simulation Physics
The inverted pendulum follows nonlinear dynamics:
```
I·θ̈ = u + d - c·θ̇ - mgl·sin(θ)
```

Where:
- `I = ml²` is rotational inertia
- `u` is control torque (PID output)  
- `d` is disturbance torque
- `c` is viscous damping
- `mgl·sin(θ)` is gravitational restoring torque

### PID Controller
```
u = Kp·e + Ki·∫e dt + Kd·(-ω)
```

With angle wrapping and anti-windup for realistic performance.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Jupyter Book](https://jupyterbook.org/)
- Interactive code execution via [Thebe](https://thebe.readthedocs.io/)
- AI chat powered by [OpenRouter](https://openrouter.ai/)
- Inspired by modern control engineering education needs

## Citation

If you use this in your research or teaching, please cite:

```bibtex
@misc{interactive-control-lab,
  title={Interactive Control Lab: A Jupyter Book for PID Control Education},
  author={Su Ann Low},
  year={2024},
  url={https://github.com/YOUR_USERNAME/interactive-control-lab}
}
```

---

**Built with ❤️ for control engineering education**