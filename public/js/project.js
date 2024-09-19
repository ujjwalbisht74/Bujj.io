const username = 'teche74';
const projectsPerPage = 3;
let page = 1;
let allProjects = []; 

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function fetchProjects() {
    try {
        const response = await fetch(`/api/projects?username=${username}&page=${page}&projectsPerPage=${projectsPerPage}`, {
            headers: {
                'Accept': 'application/json',             
            }
        });

        if (!response.ok) throw new Error('Network response was not ok');
        console.log('Response from backend:', response);


        return await response.json();
    } catch (error) {
        console.error('Failed to fetch projects from backend:', error);
        return [];
    }
}



function createProjectElement(project) {
    const projectElement = document.createElement('div');
    const index = getRandomInt(1, 5);  
    projectElement.classList.add('project-card', 'light-button', `color-${index}`);  // Use dynamic class
    projectElement.innerHTML = `
        <button class="bt color-${index}" onclick="showProjectInfo(${project.id})">
            <div class="light-holder color-${index}">
                <div class="dot color-${index}"></div>
                <div class="light color-${index}"></div>
            </div>
            <div class="button-holder color-${index}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img">
                    <path d="M12 0c-6.627 0-12 5.373-12 12 0 5.305 3.438 9.8 8.207 11.388.6.111.827-.261.827-.581v-2.057c-3.338.725-4.037-1.606-4.037-1.606-.544-1.382-1.333-1.749-1.333-1.749-1.089-.744.083-.729.083-.729 1.205.084 1.835 1.227 1.835 1.227 1.071 1.828 2.809 1.298 3.496.993.107-.774.418-1.298.761-1.597-2.668-.306-5.467-1.336-5.467-5.94 0-1.311.468-2.379 1.236-3.222-.124-.304-.536-1.524.117-3.18 0 0 1.014-.324 3.323 1.231a11.588 11.588 0 0 1 3.023-.405c1.027.007 2.063.14 3.023.405 2.31-1.555 3.323-1.231 3.323-1.231.653 1.656.241 2.876.117 3.18.768.843 1.236 1.911 1.236 3.222 0 4.606-2.807 5.635-5.476 5.931.43.371.81 1.103.81 2.223v3.293c0 .324.223.694.832.575C20.562 22.799 24 18.306 24 12 24 5.373 18.627 0 12 0z"/>
                </svg>
                <p>${project.name}</p>
            </div>
        </button>
    `;
    return projectElement;
}

function updateProjectsContainer(projects) {
    const projectsContainer = document.getElementById('projects-container');
    const fragment = document.createDocumentFragment();

    projects.forEach(project => {
        const projectElement = createProjectElement(project);
        fragment.appendChild(projectElement);
    });

    projectsContainer.innerHTML = ''; 
    projectsContainer.appendChild(fragment);
}

async function displayProjects() {
    const projects = await fetchProjects();
    allProjects = [...allProjects, ...projects];
    updateProjectsContainer(allProjects);

    if (projects.length < projectsPerPage) {
        document.getElementById('load-more').style.display = 'none';
    } else {
        document.getElementById('load-more').style.display = 'block';
    }
}

document.getElementById('load-more').addEventListener('click', () => {
    page++;
    displayProjects();
});

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function filterProjects(searchTerm) {
    const filteredProjects = allProjects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    updateProjectsContainer(filteredProjects);
}

document.getElementById('search-bar').addEventListener('input', debounce((event) => {
    const searchTerm = event.target.value;
    filterProjects(searchTerm);
}, 300));

async function initialize() {
    allProjects = await fetchProjects();
    updateProjectsContainer(allProjects);
}

initialize();

async function showProjectInfo(projectId) {
    const response = await fetch(`https://api.github.com/repositories/${projectId}`);
    const project = await response.json();

    const infoContainer = document.getElementById('project-info-container');
    infoContainer.innerHTML = `
        <div class="project-info">
            <h2>${project.name}</h2>
            <p><strong>Description:</strong> ${project.description || 'No description available.'}</p>
            <p><strong>Language:</strong> ${project.language || 'N/A'}</p>
            <p><strong>Created At:</strong> ${new Date(project.created_at).toLocaleDateString()}</p>
            <p><strong>Updated At:</strong> ${new Date(project.updated_at).toLocaleDateString()}</p>
            <p><strong>Stars:</strong> ${project.stargazers_count}</p>
            <p><strong>Forks:</strong> ${project.forks_count}</p>
            <a href="${project.html_url}" target="_blank" class="btn visit-btn">View on GitHub</a>
        </div>
    `;
    infoContainer.style.display = 'flex';
    infoContainer.style.flexDirection = 'column';
    infoContainer.style.alignItems = 'center';
    infoContainer.style.padding = '20px';
    infoContainer.style.marginTop = '20px';
    infoContainer.style.borderRadius = '8px';
    infoContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    infoContainer.style.backgroundColor = '#f9f9f9';
    infoContainer.style.maxWidth = '100%';  
    infoContainer.style.fontFamily = "Rubik Pixels", system-ui;
}
