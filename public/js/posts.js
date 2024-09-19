document.addEventListener("DOMContentLoaded", function () {
    const inputField = document.getElementById("terminal__input");
    const outputArea = document.getElementById("terminal__output");
    const terminal = document.getElementById("terminal");
    const username = "teche74";

    function displayWelcomeMessage() {
        const asciiArt = `
        Welcome to the interactive terminal! Type 'help' to see available commands.
        `;

        const instructions = `
        Commands:
        1. 'show stats' - View GitHub stats.
        2. 'show contributions' - Display GitHub contributions for the current month.
        3. 'help' - This message.
        4. 'show projects' - To get info about.
        5. 'see story' - story mode.
        6. 'clear' - Clear the screen.
        `;

        outputArea.innerHTML += `<pre>${asciiArt}</pre><pre>${instructions}</pre>`;
    }

    
    function handleCommand(command) {
        if (command === "show contributions") {
            fetchGitHubContributions().then((contributions) => {
                displayContributions(contributions);
                fadeOutTerminal(() => {
                    displayHelp();
                });
            }).catch(handleError);
    
        } else if (command === "show stats") {
            fetchGitHubStats().then((stats) => {
                displayStats(stats);
                fadeOutTerminal(() => {
                    displayHelp();
                });
            }).catch(handleError);
    
        } else if (command === "show projects") {
            fetchGitHubProjects().then((projects) => {
                displayProjects(projects);
            }).catch(handleError);
    
        } else if (command === "help") {
            clearTerminal();
            displayHelp();
    
        } else if (command === "see story") {
            fetchGitHubProfile().then((profile) => {
                displayStory(profile);
                fadeOutTerminal(() => {
                    displayHelp();
                });
            }).catch(handleError);
    
        } else if (command === "clear") {
            clearTerminal();
    
        } else {
            outputArea.innerHTML += `<p>Command not found: ${command}</p>`;
        }
    }


    function displayStats(stats) {
        const { login, public_repos, followers, following } = stats;
        const output = `
        <h3>GitHub User Stats:</h3>
        <p><strong>GitHub User:</strong> ${login}</p>
        <p><strong>Public Repos:</strong> ${public_repos}</p>
        <p><strong>Followers:</strong> ${followers}</p>
        <p><strong>Following:</strong> ${following}</p>
        `;
        outputArea.innerHTML += output;
    }

    async function fetchGitHubContributions() {
        try {
            const response = await fetch(
                `https://api.github.com/users/teche74/events`
            );
            const events = await response.json();

            const now = new Date();

            const contributions = {};

            events.forEach((event) => {
                const eventDate = new Date(event.created_at);
                const eventDay = eventDate.getDate();
                const eventType = event.type;

                if (eventDate <= now) {
                    if (!contributions[eventDay]) {
                        contributions[eventDay] = [];
                    }

                    let details = {
                        type: eventType,
                        repoName: event.repo.name,
                        files: [],
                    };

                    // Extract details based on event type
                    if (eventType === "PushEvent") {
                        details.files = event.payload.commits.flatMap(
                            (commit) => commit.modified || []
                        );
                    } else if (eventType === "PullRequestEvent") {
                        // Assuming files are listed under 'files' in the payload
                        details.files = event.payload.pull_request
                            ? event.payload.pull_request.changed_files
                            : [];
                    } else {
                        details.files = []; // Other event types don't have file details
                    }

                    contributions[eventDay].push(details);
                }
            });

            return contributions;
        } catch (error) {
            console.error("Error fetching GitHub contributions:", error);
            return {};
        }
    }

    async function fetchGitHubProfile() {
        try {
            const response = await fetch(`https://api.github.com/users/${username}`);
            const profile = await response.json();
            return profile;
        } catch (error) {
            console.error("Error fetching GitHub profile:", error);
            return {};
        }
    }

    function displayStory(profile) {
        const storyLines = [
            `Meet ${profile.name}, also known as ${profile.login}.`,
            `Currently studying at ${profile.company}, located at ${profile.location}. Pursuing my bachelor's degree in Computer Science major.`,
            `With ${profile.public_repos} public repositories and ${profile.followers} followers.`,
            `Thought in my mind: ${profile.bio}`,
            `Since joining GitHub on ${new Date(profile.created_at).toDateString()}.`,
        ];

        let index = 0;

        function typeText(text, element, callback) {
            let i = 0;
            function typeNext() {
                if (i < text.length) {
                    element.innerHTML += text[i];
                    i++;
                    setTimeout(typeNext, 50); // Adjust typing speed here
                } else {
                    callback();
                }
            }
            typeNext();
        }

        function showNextLine() {
            if (index < storyLines.length) {
                const p = document.createElement("p");
                p.className = "typing-container"; // Ensure proper spacing and font
                outputArea.appendChild(p);

                typeText(storyLines[index], p, () => {
                    index++;
                    setTimeout(showNextLine, 1000); // Wait for 1 second before showing the next line
                });
            } else {
                showTypingAnimation();
                fetchGitHubProjects().then((projects) => {
                    displayProjects(projects);
                    fadeOutTerminal();
                    displayHelp();
                });
            }
            terminal.scrollTop = 0;
        }

        showNextLine();
    }

    function showTypingAnimation() {
        const typingAnimation = `
        <style>
            .typing-container {
                font-family: monospace;
                font-size: 16px;
                white-space: pre-wrap; /* Preserve whitespace and line breaks */
            }
            .typing {
                display: inline-block;
                border-top: 2px solid #333; /* Cursor */
                white-space: nowrap;
                animation: typing 3s steps(30, end), blink-caret 0.75s step-end infinite;
            }
            @keyframes typing {
                from { width: 0; }
                to { width: 100%; }
            }
            @keyframes blink-caret {
                from, to { border-color: transparent; }
                50% { border-color: black; }
            }
        </style>`;

        outputArea.innerHTML += typingAnimation;
        outputArea.innerHTML +=
            '<div class="typing-container"><p class="typing">Fetching your GitHub repositories...</p></div>';
    }

    function displayContributions(contributions) {
        let output = "<h3>GitHub Contributions:</h3>";

        for (let day in contributions) {
            const events = contributions[day];
            output += `<p><strong>${day}:</strong> ${events.length} event(s)</p>`;

            events.forEach((event) => {
                output += `<div style="margin-left: 20px;">
                    <p><strong>Type:</strong> ${event.type}</p>
                    <p><strong>Repository:</strong> ${event.repoName}</p>`;

                if (event.type === "PushEvent" && event.files.length) {
                    output += `<p><strong>Files Pushed:</strong></p>
                        <ul>`;
                    event.files.forEach((file) => {
                        output += `<li>${file}</li>`;
                    });
                    output += `</ul>`;
                } else if (event.type === "PullRequestEvent" && event.files.length) {
                    output += `<p><strong>Files Changed:</strong></p>
                        <ul>`;
                    event.files.forEach((file) => {
                        output += `<li>${file}</li>`;
                    });
                    output += `</ul>`;
                } else {
                    output += `<p>No files information available.</p>`;
                }

                output += `</div>`;
            });
        }

        outputArea.innerHTML += output;
    }

    async function fetchGitHubProjects() {
        try {
            const response = await fetch(
                `https://api.github.com/users/${username}/repos`
            );
            const projects = await response.json();
            return projects;
        } catch (error) {
            console.error("Error fetching GitHub projects:", error);
            return [];
        }
    }

    // Function to display projects with enhanced CSS
    function displayProjects(projects) {
        if (projects.length === 0) {
            outputArea.innerHTML += "<p>No projects found.</p>";
            return;
        }

        const style = `
    <style>
        .project-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
        }
        .project-table th, .project-table td {
            padding: 10px 20px;
            border: 1px solid #ddd;
            text-align: left;
        }
        .project-table th {
            background-color: #4CAF50; /* Green background for headers */
            color: #ffffff; /* White text color */
            font-weight: 700;
            text-transform: uppercase;
        }
        .project-table tr:nth-child(even) {
            background-color: #f2f2f2; /* Light gray background for even rows */
        }
        .project-table tr:nth-child(odd) {
            background-color: #f2f2f2; /* White background for odd rows */
        }
        .project-table tr:hover {
            background-color: #e0e0e0; /* Slightly darker gray on hover */
        }
        .project-table a {
            color: #2196F3; /* Blue color for links */
            text-decoration: none;
            font-weight: 600;
        }
        .project-table a:hover {
            text-decoration: underline;
        }
        .project-table td {
            font-size: 15px;
            line-height: 1.6;
        }
        .project-table th, .project-table td {
            border-radius: 5px;
        }
    </style>`;

        let output = "<h3>GitHub Projects:</h3>";
        output += style; // Add styles to the output
        output += `
        <table class="project-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Language</th>
                    <th>Description</th>
                    <th>Stars</th>
                    <th>Forks</th>
                    <th>Last Updated</th>
                </tr>
            </thead>
            <tbody>`;

        projects.forEach((project) => {
            output += `
            <tr>
                <td><a href="${project.html_url}" target="_blank">${project.name
                }</a></td>
                <td>${project.language || "N/A"}</td>
                <td>${project.description || "No description"}</td>
                <td>${project.stargazers_count}</td>
                <td>${project.forks_count}</td>
                <td>${new Date(project.updated_at).toDateString()}</td>
            </tr>`;
        });
        output += "</tbody></table>";
        outputArea.innerHTML += output;
    }

    // Function to display help message
    function displayHelp() {
        const asciiArt = `
        Welcome to the interactive terminal! Type 'help' to see available commands.
        `;
        const instructions = `
        Commands:
        1. 'show stats' - View GitHub stats.
        2. 'show contributions' - Display GitHub contributions for the current month.
        3. 'help' - This message.
        4. 'show projects' - To get info about.
        5. 'see story' - story mode.
        6. 'clear' - Clear the screen.
        `;
        outputArea.innerHTML += `<pre>${asciiArt}</pre><pre>${instructions}</pre>`;
    }

    // Function to clear the terminal
    function clearTerminal() {
        outputArea.innerHTML = "";

        terminal.scrollTop = 0;
    }

    // Function to fetch GitHub stats
    async function fetchGitHubStats() {
        try {
            const response = await fetch(`https://api.github.com/users/${username}`);
            const stats = await response.json();
            return stats;
        } catch (error) {
            console.error("Error fetching GitHub stats:", error);
            return {};
        }
    }

    // Function to fade out the terminal
    function fadeOutTerminal(callback) {
        terminal.classList.add("fade-out");
        setTimeout(() => {
            terminal.classList.remove("show", "fade-out");
            outputArea.innerHTML = ""; // Clear the output after fade-out
            if (callback) callback();
        }, 1500); // Adjust duration of the fade-out transition as needed
    }

    function handleError(error) {
        console.error("Error:", error);
        outputArea.innerHTML += `<p>Error occurred: ${error.message}</p>`;
    }

    displayWelcomeMessage();

    // Handle command input when user presses Enter
    inputField.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            const command = inputField.value.trim();
            outputArea.innerHTML += `<p>$ ${command}</p>`;
            handleCommand(command);
            inputField.value = "";
        }
    });
});

// leetcode

document.addEventListener("DOMContentLoaded", () => {
    const leet_username = "ujjwalbisht55";
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    const apiUrl = "https://leetcode.com/graphql";

    async function fetchLeetCodeData(username) {
        const query = `
        {
            matchedUser(username: "${username}") {
                username
                submitStats: submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                }
            }
        }`;

        try {
            const response = await fetch(proxyUrl + apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });

            const result = await response.json();

            // Filter out only Easy, Medium, and Hard categories
            const filteredData =
                result.data.matchedUser.submitStats.acSubmissionNum.filter((item) =>
                    ["Easy", "Medium", "Hard"].includes(item.difficulty)
                );

            return filteredData;
        } catch (error) {
            console.error("Error fetching LeetCode data:", error);
            return [];
        }
    }

    // Function to render charts
    async function renderCharts(username) {
        const data = await fetchLeetCodeData(username);

        if (data.length === 0) {
            console.error("No data available");
            return;
        }

        // Extract data for charts
        const difficulties = data.map((item) => item.difficulty);
        const counts = data.map((item) => item.count);

        // Ensure difficulties and counts match up
        if (difficulties.length !== counts.length) {
            console.error("Data mismatch");
            return;
        }

        // Create bar chart
        const ctxBar = document.getElementById("problemsBarChart").getContext("2d");
        new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: difficulties,
                datasets: [
                    {
                        label: "Problems Solved",
                        data: counts,
                        backgroundColor: [
                            "rgb(2, 252, 227)", // Blue for Easy
                            "rgb(253, 245, 3)", // Yellow for Medium
                            "rgb(252, 0, 0)", // Red for Hard
                        ],
                        borderColor: [
                            "rgb(2, 252, 227)", // Blue for Easy
                            "rgb(253, 245, 3)", // Yellow for Medium
                            "rgb(252, 0, 0)", // Red for Hard
                        ],
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || '';
                                return `${label}: ${value} problems`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Difficulty'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Problems'
                        }
                    }
                }
            },
        });
    }

    renderCharts(leet_username);
});

// calender
document.addEventListener("DOMContentLoaded", () => {
    const apiUrl =
        "https://alfa-leetcode-api.onrender.com/ujjwalbisht55/calendar";

    async function fetchLeetCodeData() {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            const submissions = JSON.parse(data.submissionCalendar);
            return submissions;
        } catch (error) {
            console.error("Error fetching LeetCode data:", error);
            return {};
        }
    }

    function unixTimeToHumanReadable(key) {
        return new Date(key * 1000).toLocaleDateString("en-US");
    }

    function createCalendarCell(content, className = "") {
        const cell = document.createElement("div");
        cell.className = `calendar-cell ${className}`;
        cell.textContent = content;
        return cell;
    }

    function getSubmissionColor(count) {
        if (count === 0) return "";
        const intensity = Math.min(255, 50 + count * 20);
        return `rgb(235, ${intensity}, 0)`;
    }

    async function renderCalendar() {
        const submissions = await fetchLeetCodeData();

        const calendar = document.getElementById("calendar");
        if (!calendar) {
            console.error("Calendar element not found");
            return;
        }

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const firstDay = new Date(currentYear, currentMonth - 1, 1);
        const lastDay = new Date(currentYear, currentMonth, 0);
        const daysInMonth = lastDay.getDate();

        calendar.innerHTML = "";

        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        weekdays.forEach((day) => {
            const headerCell = createCalendarCell(day);
            headerCell.classList.add("calendar-header");
            calendar.appendChild(headerCell);
        });

        for (let i = 0; i < firstDay.getDay(); i++) {
            calendar.appendChild(createCalendarCell(""));
        }

        const dayCells = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = createCalendarCell(day);
            dayCells[day] = dayCell;
            calendar.appendChild(dayCell);
        }

        for (const key in submissions) {
            const humanReadableDate = unixTimeToHumanReadable(parseInt(key));
            const [submissionMonth, submissionDay, submissionYear] = humanReadableDate
                .split("/")
                .map(Number);

            if (submissionYear === currentYear && submissionMonth === currentMonth) {
                const day = submissionDay;
                const dayCell = dayCells[day];
                if (dayCell) {
                    const count = submissions[key];
                    const cellColor = getSubmissionColor(count);
                    if (cellColor) {
                        dayCell.style.backgroundColor = cellColor;
                        dayCell.style.color = "#fff";
                    }
                    dayCell.title = `Date: ${humanReadableDate}, Submissions: ${count}`;
                }
            }
        }
    }

    renderCalendar();
});
