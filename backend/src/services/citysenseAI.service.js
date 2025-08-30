const { spawn } = require('child_process');

const runPythonAI = async (weather, air, moods) => {
  return new Promise((resolve, reject) => {
    const py = spawn('python3', ['ai/api_runner.py']);

    py.stdin.write(JSON.stringify({ weather, air, moods }));
    py.stdin.end();

    let data = '';
    let error = '';

    py.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });

    py.stderr.on('data', (err) => {
      console.error('Python stderr:', err.toString());
      error += err.toString();
    });

    py.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(error || `Python exited with code ${code}`));
      }
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error('Invalid Python output: ' + data));
      }
    });
  });
};

module.exports = { runPythonAI };
