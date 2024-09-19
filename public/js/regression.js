document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById('reveal-button');
    const container = document.getElementById('questions-container');
    const questions = container.querySelectorAll('.question');
    let currentQuestionIndex = 0;

    button.addEventListener('click', function () {
        // Show the questions container if hidden
        console.log(container)

        if (container.style.display === 'none') {
            container.style.display = 'block';
        }

        // Show the next question
        if (currentQuestionIndex < questions.length) {
            console.log(questions[currentQuestionIndex])
            questions[currentQuestionIndex].style.display = 'block';
            currentQuestionIndex++;
        } else {
            // Hide the button after showing all questions
            button.style.display = 'none';
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('regression-table');
    const ctx = document.getElementById('scatterplot').getContext('2d');
    const equationElement = document.getElementById('equation-display');

    let scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Relationship between Feature and Target',
                data: getDataFromTable(),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                pointRadius: 5
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Dependent Variable (given feature)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Independent Variable (target)'
                    }
                }
            }
        }
    });

    function getDataFromTable() {
        const rows = table.querySelectorAll('tbody tr');
        let data = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const xValue = parseFloat(cells[0].textContent) || 0;
            const yValue = parseFloat(cells[1].textContent) || 0;

            data.push({ x: xValue, y: yValue });
        });

        return data;
    }

    function calculateOLS() {
        const rows = table.querySelectorAll('tbody tr');
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        const N = rows.length;

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const x = parseFloat(cells[0].textContent) || 0;
            const y = parseFloat(cells[1].textContent) || 0;

            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        });

        if (N * sumX2 - sumX * sumX === 0) {
            console.error('Error in OLS calculation: Division by zero');
            return { m: 0, c: 0 };
        }

        const m = (N * sumXY - sumX * sumY) / (N * sumX2 - sumX * sumX);
        const c = (sumY - m * sumX) / N;

        return { m, c };
    }

    function updateEquationDisplay(m, c) {
        equationElement.textContent = `y = ${m.toFixed(2)}x + ${c.toFixed(2)}`;
    }

    function updateScatterPlot(m, c) {
        const scatterData = getDataFromTable();
        const xValues = scatterData.map(point => point.x);
        const lineData = xValues.map(x => ({ x, y: m * x + c }));

        scatterChart.data.datasets[0].data = scatterData;

        if (scatterChart.data.datasets.length > 1) {
            scatterChart.data.datasets[1].data = lineData;
        } else {
            scatterChart.data.datasets.push({
                label: 'Best Fit Line',
                data: lineData,
                type: 'line',
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                pointRadius: 0
            });
        }

        scatterChart.update();
    }

    function handleTableInput() {
        const { m, c } = calculateOLS();
        updateEquationDisplay(m, c);
        updateScatterPlot(m, c);
    }

    table.addEventListener('input', handleTableInput);

    handleTableInput();
});


document.querySelectorAll('.regression_type').forEach(button => {
    button.addEventListener('click', function () {
        const type = this.getAttribute('data-type');
        const infoText = document.getElementById('info_text');
        const infoContainer = document.getElementById('type_info_container');

        switch (type) {
            case 'linear':
                infoText.textContent = "Linear Regression is a linear approach to modeling the relationship between a dependent variable and one or more independent variables.";
                break;
            case 'logistic':
                infoText.textContent = "Logistic Regression is used for binary classification tasks and models the probability of an event occurring as a function of a linear predictor.";
                break;
            case 'polynomial':
                infoText.textContent = "Polynomial Regression fits a nonlinear relationship between the independent variable and the dependent variable as an nth degree polynomial.";
                break;
            default:
                infoText.textContent = "";
        }

        infoContainer.style.display = 'block';
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('regression-table2');
    let scatterChart, bestFitChart;

    // Initial data extraction and chart plotting
    let data = extractDataFromTable(table);
    scatterChart = plotScatterplot(data);
    updateOLSSteps(data);
    updateOLSFormula(data);

    // Event listener to monitor changes in the table
    table.addEventListener('input', function () {
        // Extract new data and update charts
        data = extractDataFromTable(table);

        // Update scatter plot
        updateScatterplot(scatterChart, data);

        // Update OLS steps and charts
        updateOLSSteps(data);

        // Update OLS formula with the current values
        updateOLSFormula(data);
    });
});

function extractDataFromTable(table) {
    const rows = table.querySelectorAll('tbody tr');
    const data = [];
    rows.forEach(row => {
        const x = parseFloat(row.cells[0].textContent);
        const y = parseFloat(row.cells[1].textContent);
        data.push({ x, y });
    });
    return data;
}

function calculateOLS(data) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    data.forEach(point => {
        sumX += point.x;
        sumY += point.y;
        sumXY += point.x * point.y;
        sumXX += point.x * point.x;
    });

    const meanX = sumX / n;
    const meanY = sumY / n;
    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const c = (sumY - m * sumX) / n;

    return { sumX, sumY, sumXY, sumXX, meanX, meanY, m, c };
}

function updateOLSSteps(data) {
    const { sumX, sumY, sumXY, sumXX, meanX, meanY, m, c } = calculateOLS(data);

    // Update sums
    document.getElementById('sumX').textContent = sumX.toFixed(2);
    document.getElementById('sumY').textContent = sumY.toFixed(2);
    document.getElementById('sumXY').textContent = sumXY.toFixed(2);
    document.getElementById('sumXX').textContent = sumXX.toFixed(2);

    // Update means
    document.getElementById('meanX').textContent = meanX.toFixed(2);
    document.getElementById('meanY').textContent = meanY.toFixed(2);

    // Update slope and intercept
    document.getElementById('slope_m').textContent = m.toFixed(2);
    document.getElementById('intercept_c').textContent = c.toFixed(2);

    // Update the best fit line
    updateBestFitLine(m, c);
}

function updateOLSFormula(data) {
    const { n, sumX, sumY, sumXY, sumXX, m, c } = calculateOLS(data);

    // Update the slope formula
    const slopeFormula = `m = [${data.length} * ${sumXY.toFixed(2)} - ${sumX.toFixed(2)} * ${sumY.toFixed(2)}] / [${data.length} * ${sumXX.toFixed(2)} - (${sumX.toFixed(2)})²] = ${m.toFixed(2)}`;
    document.getElementById('ols_slope_formula').textContent = slopeFormula;

    // Update the intercept formula
    const interceptFormula = `c = [${sumY.toFixed(2)} - ${m.toFixed(2)} * ${sumX.toFixed(2)}] / ${data.length} = ${c.toFixed(2)}`;
    document.getElementById('ols_intercept_formula').textContent = interceptFormula;
}

function plotScatterplot(data) {
    const ctx = document.getElementById('scatterplot2').getContext('2d');
    const scatterData = data.map(d => ({ x: d.x, y: d.y }));

    return new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Data Points',
                data: scatterData,
                backgroundColor: 'blue'
            }]
        },
        options: {
            scales: {
                x: { type: 'linear', position: 'bottom' },
                y: { type: 'linear' }
            }
        }
    });
}

function updateScatterplot(chart, data) {
    const scatterData = data.map(d => ({ x: d.x, y: d.y }));
    chart.data.datasets[0].data = scatterData;
    chart.update();
}

function updateBestFitLine(m, c) {
    const ctx = document.getElementById('bestFitLineCanvas').getContext('2d');

    // Update the data for the best fit line
    const data = [
        { x: 0, y: c },
        { x: 5, y: m * 5 + c }
    ];

    if (!window.bestFitChart) {
        window.bestFitChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Best Fit Line',
                    data: data,
                    borderColor: 'red',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: { type: 'linear', position: 'bottom' },
                    y: { type: 'linear' }
                }
            }
        });
    } else {
        window.bestFitChart.data.datasets[0].data = data;
        window.bestFitChart.update();
    }
}


document.getElementById("linearBtn").addEventListener("click", function () {
    const linearInfoContainer = document.getElementById("Linear");

    // Hide all other info containers if needed
    // document.querySelectorAll('.info_container').forEach(container => {
    //     container.style.visibility = 'hidden';
    //     container.style.height = '0';
    //     container.style.opacity = '0';
    // });

    // Toggle visibility for the Linear Regression container
    if (linearInfoContainer.style.visibility === "hidden") {
        linearInfoContainer.style.visibility = "visible";
        linearInfoContainer.style.height = "auto";  // Ensure it takes up space when shown
        linearInfoContainer.style.opacity = "1";    // Fade in for smooth transition
    } else {
        linearInfoContainer.style.visibility = "hidden";
        linearInfoContainer.style.height = "0";      // Hide the container
        linearInfoContainer.style.opacity = "0";     // Fade out for smooth transition
    }
});


document.getElementById("multipleBtn").addEventListener("click", function () {
    const mulitpleInfoContainer = document.getElementById("Multiple");

    if (mulitpleInfoContainer.style.visibility === "hidden") {
        mulitpleInfoContainer.style.visibility = "visible";
        mulitpleInfoContainer.style.height = "auto";  // Ensure it takes up space when shown
        mulitpleInfoContainer.style.opacity = "1";    // Fade in for smooth transition
    } else {
        mulitpleInfoContainer.style.visibility = "hidden";
        mulitpleInfoContainer.style.height = "0";      // Hide the container
        mulitpleInfoContainer.style.opacity = "0";     // Fade out for smooth transition
    }
});
