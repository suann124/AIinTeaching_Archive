# 🚀 Student Guide

## How to Use This Interactive Book

This book combines **theory + hands-on coding** for learning PID control. No software installation required!

### 🎯 **Quick Start**

1. **Read the lecture content** in the [PID Control Guide](pid.md)
2. **Go to [Exercises](exercises.md)** for hands-on practice
3. **Click the 🚀 rocket button** → "Live Code" to activate interactive mode
4. **Wait 30-60 seconds** for the Python kernel to start (first time only)
5. **Start coding!** Type in any code block and press `Shift+Enter` to run

### 💻 **How the Interactive System Works**

**What is this?**
- **Python in your browser** - no installation needed
- **Jupyter kernel** running on MyBinder.org (free cloud service)  
- **Real-time code execution** with plots and results
- **Same as Jupyter notebooks** but embedded in the book

**Available libraries:**
```python
import numpy as np
import matplotlib.pyplot as plt
import scipy  # for advanced control functions
```

### 📚 **Exercise Structure**

Each exercise has:
- **Learning objective** clearly stated
- **Starter code** with `TODO` comments
- **Hints** about what functions to copy from the main lecture
- **Empty code blocks** for you to experiment

**Example workflow:**
1. Read the exercise description
2. Copy needed functions from the main PID lecture
3. Modify parameters and experiment
4. Run your code with `Shift+Enter`
5. Analyze the plots and results

### 🔧 **Interactive Features**

**Running Code:**
- `Shift+Enter`: Execute current code block
- `Ctrl+Enter`: Execute without moving to next block
- Click anywhere in a code block to edit

**Getting Help:**
- Use the 💬 **AI chat widget** (bottom-right) for questions
- Copy error messages to the chat for debugging help
- Ask about PID theory, Python syntax, or exercises

### 🎯 **Exercise Guide**

**Exercise 1: Parameter Comparison**
- Copy `pid_discrete` and `simulate_pid_first_order` from main lecture
- Test P, PI, and PID controllers
- Measure performance metrics (rise time, overshoot, settling time)

**Exercise 2: Anti-Windup**
- Experiment with saturation limits
- Compare with/without anti-windup
- Understand why integral windup happens

**Exercise 3: Disturbance Rejection** 
- Add step disturbances to your plant
- Tune Ki for best disturbance rejection
- Balance fast rejection vs. stability

**Exercise 4: Ziegler-Nichols**
- Find the ultimate gain by trial and error
- Apply the classic tuning formulas
- Compare with manual tuning

**Exercise 5: Noise Filtering**
- Add measurement noise to your simulation
- Test different derivative filter settings
- Understand the noise vs. performance trade-off

### 🚨 **Troubleshooting**

**Kernel won't start?**
- Try refreshing the page and clicking "Live Code" again
- MyBinder.org is free but sometimes slow/busy
- If persistent issues, try later or use local Jupyter

**Code not running?**
- Make sure you clicked in the code block first
- Press `Shift+Enter` (not just Enter)
- Check for syntax errors (missing commas, parentheses)

**Plots not showing?**
- Add `plt.show()` at the end of your plotting code
- Make sure matplotlib is imported: `import matplotlib.pyplot as plt`

**Need the PID functions?**
- Copy from the main lecture: [PID Control Guide](pid.md)
- Look for the `pid_discrete` and `simulate_pid_first_order` functions
- All exercises assume you have these available

### 💡 **Tips for Success**

1. **Start simple** - get basic code working before adding complexity
2. **Experiment freely** - change parameters and see what happens
3. **Compare results** - plot multiple cases on the same graph
4. **Use the AI chat** - ask questions when stuck
5. **Save your work** - copy interesting code to your own notes

### 🎓 **Learning Objectives**

By completing these exercises, you will:
- ✅ Understand how P, I, D components affect control performance
- ✅ Implement discrete-time PID controllers in Python
- ✅ Apply systematic tuning methods (Ziegler-Nichols)
- ✅ Handle practical issues (saturation, noise, disturbances)
- ✅ Analyze control system performance quantitatively

**Ready to start?** Go to [Exercises](exercises.md) and click the 🚀 button!