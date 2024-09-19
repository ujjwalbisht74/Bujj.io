import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

document.addEventListener("DOMContentLoaded", () => {
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("scene-container").appendChild(renderer.domElement);

    // Add a light
    const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
    scene.add(ambientLight);

    // Add spooky spotlights
    const redSpotlight = new THREE.SpotLight(
        0xff0000,
        3.5,
        50,
        Math.PI / 6,
        0.1,
        0.5
    );
    redSpotlight.position.set(5, 5, 10);
    scene.add(redSpotlight);

    const blueSpotlight = new THREE.SpotLight(
        0x0000ff,
        1.5,
        50,
        Math.PI / 6,
        0.1,
        0.5
    );
    blueSpotlight.position.set(-5, 5, 10);
    scene.add(blueSpotlight);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 800;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20;
    }

    particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.01,
        transparent: true,
        opacity: 1,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Set up OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Load GLTF model
    const loader = new GLTFLoader();

    loader.load(
        "../assistant_model/head.glb",
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(4, 4, 4); // Adjust the scale
            model.rotation.set(0, 0, 0); // Adjust the rotation if needed
            scene.add(model);

            // Optionally add animations
            if (gltf.animations && gltf.animations.length) {
                const mixer = new THREE.AnimationMixer(model);
                gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
                function animate() {
                    requestAnimationFrame(animate);
                    mixer.update(0.01);
                    renderer.render(scene, camera);
                }
                animate();
            }
            const clock = new THREE.Clock();
            function animate() {
                requestAnimationFrame(animate);
                const time = clock.getElapsedTime();

                // Animate spotlights
                redSpotlight.position.x = 5 * Math.cos(time * 0.5);
                redSpotlight.position.z = 10 + 2 * Math.sin(time * 0.5);

                blueSpotlight.position.x = -5 * Math.cos(time * 0.5);
                blueSpotlight.position.z = 10 + 2 * Math.sin(time * 0.5);

                // Animate particles
                particleSystem.rotation.y = time * 0.1;

                // Camera movement
                camera.position.x = 7 * Math.sin(time * 0.2);
                camera.position.z = 7 * Math.cos(time * 0.2);
                camera.lookAt(model.position);

                // Make the model always face the camera
                model.lookAt(camera.position);

                renderer.render(scene, camera);
            }
            animate();
        },
        undefined,
        (error) => {
            console.error("An error occurred while loading the model:", error);
        }
    );

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const textToSpeechForm = document.getElementById('text-to-speech-form');
    const userTextInput = document.getElementById('user-text');
    const askButton = document.getElementById('ask-button');
    const chatContainer = document.getElementById('chat-container');

    // Function to type out text character by character
    function typeText(text, element, callback) {
        let index = 0;
        const typingSpeed = 50;

        function type() {
            if (index < text.length) {
                element.innerHTML += text.charAt(index);
                index++;
                setTimeout(type, typingSpeed);
            } else if (callback) {
                callback();
            }
        }

        type();
    }

    // Function to clear text with a fade-out effect
    function clearText(element) {
        element.style.transition = 'opacity 1s';
        element.style.opacity = 0;
        setTimeout(() => {
            element.innerHTML = '';
            element.style.opacity = 1;
        }, 1000);
    }

    // Function to play audio from a given URL
    function playAudio(audioUrl) {
        const audioElement = new Audio(audioUrl);
        audioElement.play().catch(error => {
            console.error('Error playing audio:', error);
            alert('Audio playback failed. Please try again.');
        });
    }

    // Function to say "Good morning" on page load
    function sayGoodMorning() {
        const message = 'Good morning!';
        chatContainer.innerHTML = '';
        typeText(message, chatContainer, () => {
            setTimeout(() => clearText(chatContainer), 5000);
        });

        // Optionally use speech synthesis as fallback
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    }

    sayGoodMorning();

    textToSpeechForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userText = userTextInput.value.trim();
        if (!userText) return alert('Please enter text');

        askButton.disabled = true;
        userTextInput.placeholder = "Processing your request...";

        console.log("sending request");
        try {
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userText }),
            });
            console.log("response received.");
            
            const data = await response.json(); 
            console.log(response);
            console.log("Front end response:", data);
            
            console.log("working for audio.")
            if (!response.ok) {
                    throw new Error('Network response was not ok.');
            }
            if (data.audio) {
                const audioUrl = data.audio + '?t=' + new Date().getTime();
                playAudio(audioUrl);
                
                chatContainer.innerHTML = '';
                typeText(data.message, chatContainer, () => {
                    setTimeout(() => clearText(chatContainer), 5000);
                });
            } 
            if (data.message) {
                chatContainer.innerHTML = '';
                typeText(data.message, chatContainer, () => {
                    setTimeout(() => clearText(chatContainer), 5000);
                });
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            askButton.disabled = false;
            userTextInput.value = '';
            userTextInput.placeholder = "What do you want to know, human...";
        }
    });

});
