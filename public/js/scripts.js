

document.addEventListener("DOMContentLoaded", () => {
  const regressionCtx = document.getElementById("linearRegressionChart").getContext("2d");
  const classificationCtx = document.getElementById("classificationChart").getContext("2d");


  // Linear Regression Chart
  const regressionData = {
    datasets: [
      {
        label: "Data Points",
        data: [],
        backgroundColor: [],
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        pointRadius: 5,
      },
      {
        label: "Best Fit Line",
        data: [],
        type: "line",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const regressionConfig = {
    type: "scatter",
    data: regressionData,
    options: {
      plugins: {
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              scaleID: 'y',
              value: 0,
              borderDash: [10, 5],
              yMin: 0,  
              yMax: 10,
              label: {
                content: 'y = mx + b',
                enabled: true,
                position: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                font: {
                    size: 12,
                },
              }
            }
          }
        }
      },
      scales: {
        x: {
          type: "linear",
          position: "bottom",
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  const regressionChart = new Chart(regressionCtx, regressionConfig);

  // Classification Chart
  const classificationData = {
    datasets: [
      {
        label: "Class A",
        data: [],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        pointRadius: 5,
      },
      {
        label: "Class B",
        data: [],
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        pointRadius: 5,
      },
    ],
  };

  const classificationConfig = {
    type: "scatter",
    data: classificationData,
    options: {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  const classificationChart = new Chart(
    classificationCtx,
    classificationConfig
  );

  function generateRegressionData() {
    const x = [];
    const y = [];
    const colors = [];
    for (let i = 0; i < 10; i++) {
      x.push(i);
      y.push(Math.random() * 10);
      colors.push(
        y[i] > 5 ? "rgba(255, 99, 132, 0.5)" : "rgba(75, 192, 192, 0.5)"
      );
    }
    return { x, y, colors };
  }

  function generateClassificationData() {
    const classA = [];
    const classB = [];
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 10;
      const y = Math.random() * 10;
      if (x + y < 10) {
        classA.push({ x, y });
      } else {
        classB.push({ x, y });
      }
    }
    return { classA, classB };
  }

  function updateRegressionChart() {
    const { x, y, colors } = generateRegressionData();

    regressionChart.data.datasets[0].data = x.map((val, idx) => ({
      x: val,
      y: y[idx],
    }));
    regressionChart.data.datasets[0].backgroundColor = colors;

    const n = x.length;
    const xSum = x.reduce((a, b) => a + b, 0);
    const ySum = y.reduce((a, b) => a + b, 0);
    const xySum = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const xSquaredSum = x.reduce((sum, xi) => sum + xi * xi, 0);

    const m = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
    const b = (ySum - m * xSum) / n;

    const line = x.map((xi) => ({ x: xi, y: m * xi + b }));

    regressionChart.data.datasets[1].data = line;

    regressionChart.update();
  }

  function updateClassificationChart() {
    const { classA, classB } = generateClassificationData();

    classificationChart.data.datasets[0].data = classA;
    classificationChart.data.datasets[1].data = classB;

    classificationChart.data.datasets[0].backgroundColor =
      classA.length > 10
        ? "rgba(255, 206, 86, 0.6)"
        : "rgba(54, 162, 235, 0.6)";
    classificationChart.data.datasets[1].backgroundColor =
      classB.length > 10
        ? "rgba(153, 102, 255, 0.6)"
        : "rgba(255, 159, 64, 0.6)";

    classificationChart.update();
  }

  let regressionInterval, classificationInterval;

  function toggleChart(chartToShow) {
    const regressionChartElement = document.getElementById(
      "linearRegressionChart"
    );
    const classificationChartElement = document.getElementById(
      "classificationChart"
    );

    if (chartToShow === "regression") {
      if (
        regressionChartElement.style.display === "none" ||
        regressionChartElement.style.display === ""
      ) {
        regressionChartElement.style.display = "block";
        classificationChartElement.style.display = "none";
        clearInterval(classificationInterval);
        classificationInterval = null;

        updateRegressionChart();
        regressionInterval = setInterval(updateRegressionChart, 2000);
      } else {
        regressionChartElement.style.display = "none";
        clearInterval(regressionInterval);
        regressionInterval = null;
      }
    } else if (chartToShow === "classification") {
      if (
        classificationChartElement.style.display === "none" ||
        classificationChartElement.style.display === ""
      ) {
        classificationChartElement.style.display = "block";
        regressionChartElement.style.display = "none";
        clearInterval(regressionInterval);
        regressionInterval = null;

        updateClassificationChart();
        classificationInterval = setInterval(updateClassificationChart, 2000);
      } else {
        classificationChartElement.style.display = "none";
        clearInterval(classificationInterval);
        classificationInterval = null;
      }
    }
  }

  document
    .getElementById("showRegression")
    .addEventListener("click", () => toggleChart("regression"));
  document
    .getElementById("showClassification")
    .addEventListener("click", () => toggleChart("classification"));
});


let visualizationVisible = false;

function toggleVisualizationContainer() {
  const visualizationContainer = document.querySelector(
    ".visualization-container"
  );
  const seeVisualizationBtn = document.querySelector(".see-visualization-btn");

  if (visualizationVisible) {
    // Hide the visualization container
    visualizationContainer.style.display = "none";
    seeVisualizationBtn.textContent = "See Visualization";
  } else {
    // Show the visualization container and stretch it
    visualizationContainer.style.display = "block";
    visualizationContainer.style.height = "auto";
    seeVisualizationBtn.textContent = "Hide Visualization";
  }

  visualizationVisible = !visualizationVisible;
}

function toggleVisualization(containerId) {
  const visualizationContainer = document.getElementById(containerId);
  const seeVisualizationBtn = document.querySelector(`.see-visualization-btn`);

  if (visualizationContainer.style.display === "block") {
    // Hide the visualization container
    visualizationContainer.style.display = "none";
    seeVisualizationBtn.textContent = "Have a look";
  } else {
    // Show the visualization container and stretch it
    visualizationContainer.style.display = "block";
    visualizationContainer.style.height = "auto";
    seeVisualizationBtn.textContent = "Hide Visualization";
  }
}

