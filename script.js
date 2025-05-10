/**
 * Portfolio Website JavaScript with Autoplay Circular Audio Visualizer
 * 
 * This script handles:
 * 1. Loading animations for page elements
 * 2. Project cards expansion functionality
 * 3. Background image transition on scroll
 * 4. Interactive elements and sound effects
 * 5. Audio visualization for ambient ocean sound with autoplay
 */

// CircularAudioVisualizer
const CircularAudioVisualizer = {
    // Audio element for ocean sounds
    audio: null,
    
    // Audio context and analyzer
    audioContext: null,
    analyzer: null,
    
    // DOM elements
    visualizerCanvas: null,
    visualizerCtx: null,
    audioNotification: null,
    
    // Visualization state
    isPlaying: false,
    isMuted: false,
    frequencyData: null,
    
    // Immediately initialize on script load
    init() {
        // Add silent video tag to help with autoplay on mobile
        this.addSilentVideo();
        
        // Create new audio element with our ocean sound
        this.audio = new Audio('audio/ambient/ocean.mp3');
        this.audio.loop = true;
        this.audio.volume = 0.15;
        
        // Configure audio element
        this.audio.autoplay = true;
        this.audio.preload = 'auto';
        
        // Create canvas for visualizer - must be done immediately
        this.visualizerCanvas = document.createElement('canvas');
        this.visualizerCanvas.className = 'profile-visualizer';
        this.visualizerCanvas.width = 220; 
        this.visualizerCanvas.height = 220;
        
        // Create audio control button
        this.createAudioControl();
        
        // Create notification element (hidden by default)
        this.createNotification();
        
        // Set up audio events
        this.setupAudioEvents();
        
        // Start the audio immediately
        this.startAudioImmediately();
        
        // Add to DOM when document is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachToDom());
        } else {
            this.attachToDom();
        }
    },
    
    // Add silent video to help with autoplay on mobile
    addSilentVideo() {
        // Create a silent video element (helps with autoplay on mobile)
        const video = document.createElement('video');
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        video.setAttribute('loop', '');
        video.style.position = 'absolute';
        video.style.top = '-1px';
        video.style.left = '-1px';
        video.style.width = '1px';
        video.style.height = '1px';
        video.style.opacity = '0.01';
        
        // Add a blank video source 
        const source = document.createElement('source');
        source.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0MiByMjQ3OSBkZDc5YTYxIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAD2WIhAA3//728P4FNjuZQQAAAu5tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACGHRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAAAAAEAAAAAAZBtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAACgAAAAEAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAE7bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA+3N0YmwAAACXc3RzZAAAAAAAAAABAAAAh2F2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAgACAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAxYXZjQwFkAAr/4QAYZ2QACqzZX4iIhAAAAwAEAAADAFA8SJZYAQAGaOvjyyLAAAAAGHN0dHMAAAAAAAAAAQAAAAEAAAQAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAAsUAAAABAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU2LjQwLjEwMQ==';
        source.type = 'video/mp4';
        video.appendChild(source);
        
        // Add to document and play it
        document.body.appendChild(video);
        video.play().catch(e => console.log("Silent video play failed:", e));
    },
    
    // Create a notification element
    createNotification() {
        this.audioNotification = document.createElement('div');
        this.audioNotification.className = 'audio-notification';
        this.audioNotification.textContent = 'Ocean sounds playing...';
        document.body.appendChild(this.audioNotification);
    },
    
    // Create audio control button
    createAudioControl() {
        const audioControl = document.createElement('div');
        audioControl.className = 'audio-control';
        audioControl.innerHTML = '<i class="fas fa-volume-up"></i>';
        document.body.appendChild(audioControl);
        
        audioControl.addEventListener('click', () => {
            this.toggleMute();
            audioControl.innerHTML = this.isMuted ? 
                '<i class="fas fa-volume-mute"></i>' : 
                '<i class="fas fa-volume-up"></i>';
        });
    },
    
    // Set up audio events
    setupAudioEvents() {
        if (!this.audio) return;
        
        // Handle when audio can play
        this.audio.addEventListener('canplaythrough', () => {
            console.log("🌊 Ocean sound loaded and ready to play");
        });
        
        // Handle audio errors
        this.audio.addEventListener('error', (err) => {
            console.error("Error loading audio:", err);
            this.showNotification('Error loading ocean sound. Click here to retry.');
            
            // Make notification clickable to retry
            this.audioNotification.style.cursor = 'pointer';
            this.audioNotification.addEventListener('click', () => {
                this.audio.load();
                this.startAudioImmediately();
                this.hideNotification();
            });
        });
        
        // Handle play state
        this.audio.addEventListener('play', () => {
            console.log("Ocean sound is now playing");
            this.isPlaying = true;
            
            // Initialize audio context when play starts
            if (!this.audioContext) {
                setTimeout(() => this.initAudioAnalysis(), 100);
            }
        });
        
        // Handle pause state
        this.audio.addEventListener('pause', () => {
            console.log("Ocean sound paused");
            this.isPlaying = false;
        });
    },
    
    // Attach visualizer to DOM
    attachToDom() {
        // Find profile container and add canvas
        const profileContainer = document.querySelector('.profile-pic-container');
        if (profileContainer) {
            profileContainer.insertBefore(this.visualizerCanvas, profileContainer.firstChild);
            console.log("Visualizer canvas attached to DOM");
        } else {
            console.error("Profile container not found!");
        }
    },
    
    // Start audio immediately, with fallbacks
    startAudioImmediately() {
        // Try different methods to enable autoplay
        
        // 1. Basic play attempt
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log("Autoplay successful! 🎉");
                    this.isPlaying = true;
                })
                .catch(error => {
                    console.log("Autoplay prevented by browser:", error);
                    
                    // When autoplay is blocked, we need user interaction
                    this.showNotification('Click anywhere to enable ocean sounds');
                    
                    // Add one-time click handler to the entire document
                    const startAudioOnClick = () => {
                        // Try to restart the audio
                        this.audio.play()
                            .then(() => {
                                console.log("Audio started after user interaction");
                                this.hideNotification();
                            })
                            .catch(e => console.error("Still couldn't play audio:", e));
                        
                        // Remove the event listener after first click
                        document.removeEventListener('click', startAudioOnClick);
                    };
                    
                    document.addEventListener('click', startAudioOnClick);
                });
        }
    },
    
    // Show notification message
    showNotification(message) {
        this.audioNotification.textContent = message;
        this.audioNotification.classList.add('visible');
    },
    
    // Hide notification
    hideNotification() {
        this.audioNotification.classList.remove('visible');
    },
    
    // Toggle mute state
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.audio.pause();
            this.visualizerCanvas.style.opacity = '0.2'; // Dim but not invisible
        } else {
            this.audio.play();
            this.visualizerCanvas.style.opacity = '1';
        }
        
        // Sync mute state with UI sound manager
        if (typeof AudioManager !== 'undefined') {
            AudioManager.syncMuteState(this.isMuted);
        }
    },
    
    // Initialize Web Audio API
    initAudioAnalysis() {
        try {
            // Check if audio is actually playing
            if (this.audio.paused) {
                console.log("Audio is still paused, can't initialize analysis yet");
                return;
            }
            
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create analyzer
            this.analyzer = this.audioContext.createAnalyser();
            this.analyzer.fftSize = 256; // More detailed frequency data
            this.analyzer.smoothingTimeConstant = 0.8; // Smoother transitions
            
            // Connect audio element to analyzer
            const source = this.audioContext.createMediaElementSource(this.audio);
            source.connect(this.analyzer);
            this.analyzer.connect(this.audioContext.destination);
            
            // Create data array for frequency data
            this.frequencyData = new Uint8Array(this.analyzer.frequencyBinCount);
            
            // Start visualization
            this.visualizerCtx = this.visualizerCanvas.getContext('2d');
            this.visualizeCircular();
            
            // Add playing class for animation
            this.visualizerCanvas.classList.add('playing');
            
            console.log("Audio analysis initialized successfully");
            
        } catch (error) {
            console.error("Error initializing audio analysis:", error);
        }
    },
    
    // Draw circular visualizer
    // Updated balanced ripple visualizer with less low-end bias
    visualizeCircular() {
        if (!this.visualizerCanvas || !this.visualizerCtx) {
            console.error("Visualizer canvas or context not found!");
            return;
        }
        
        const canvas = this.visualizerCanvas;
        const ctx = this.visualizerCtx;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Array to store active ripples
        const ripples = [];
        
        // Ripple generation timing - shorter interval for more frequent ripples
        let lastRippleTime = 0;
        const rippleInterval = 200; // Shorter interval (was 300ms)
        
        // Separate timers for different frequency ranges
        let lastLowRippleTime = 0;
        let lastMidRippleTime = 0;
        let lastHighRippleTime = 0;
        
        // Frame count for passive ripples when no audio
        let frameCount = 0;
        
        const drawVisualization = (currentTime) => {
            // Create passive ripples when audio is muted
            if (!this.isPlaying || this.isMuted) {
                frameCount++;
                // Create a passive ripple every ~2 seconds
                if (frameCount % 120 === 0) {
                    // Create a gentle passive ripple
                    ripples.push({
                        radius: 50, // Starting radius
                        maxRadius: 100 + Math.random() * 20,
                        opacity: 0.5,
                        lineWidth: 1.5,
                        speed: 0.5 + Math.random() * 0.3,
                        hue: 200 + Math.random() * 20
                    });
                }
            }
            
            // Create ripples based on audio data
            if (this.isPlaying && !this.isMuted && this.analyzer) {
                try {
                    // Get frequency data
                    this.analyzer.getByteFrequencyData(this.frequencyData);
                    
                    // Calculate average amplitude in different frequency ranges
                    // Low frequencies (bass) - first 1/5 of the spectrum (narrower range)
                    const lowEnd = this.frequencyData.slice(0, Math.floor(this.frequencyData.length / 5));
                    const bassAvg = lowEnd.reduce((sum, val) => sum + val, 0) / lowEnd.length;
                    
                    // Mid frequencies - middle 3/5 of the spectrum (wider range)
                    const midRange = this.frequencyData.slice(
                        Math.floor(this.frequencyData.length / 5), 
                        Math.floor(this.frequencyData.length * 4 / 5)
                    );
                    const midAvg = midRange.reduce((sum, val) => sum + val, 0) / midRange.length;
                    
                    // High frequencies - last 1/5 of the spectrum
                    const highEnd = this.frequencyData.slice(Math.floor(this.frequencyData.length * 4 / 5));
                    const highAvg = highEnd.reduce((sum, val) => sum + val, 0) / highEnd.length;
                    
                    // Generate ripples based on frequency activity
                    // More balanced thresholds and non-exclusive ripple generation
                    
                    // Bass ripples - lower threshold
                    if (bassAvg > 70 && currentTime - lastLowRippleTime > rippleInterval) {
                        ripples.push({
                            radius: 50,
                            maxRadius: 105 + (bassAvg / 255) * 35, // Slightly less dramatic
                            opacity: 0.15 + (bassAvg / 255) * 0.4, // Lower starting opacity
                            lineWidth: 1.5 + (bassAvg / 255) * 2.5, // Thinner line
                            speed: 0.7 + (bassAvg / 255) * 0.7,
                            hue: 195 + (bassAvg / 255) * 15 // Less color variation
                        });
                        lastLowRippleTime = currentTime;
                    }
                    
                    // Mid frequency ripples - similar threshold to bass
                    if (midAvg > 60 && currentTime - lastMidRippleTime > rippleInterval * 0.7) { // More frequent
                        ripples.push({
                            radius: 50,
                            maxRadius: 90 + (midAvg / 255) * 40, // Similar size to bass
                            opacity: 0.2 + (midAvg / 255) * 0.4, // Better visibility
                            lineWidth: 1.5 + (midAvg / 255) * 2, 
                            speed: 0.9 + (midAvg / 255) * 0.7,
                            hue: 205 + (midAvg / 255) * 20 // Cyan-blue for mids
                        });
                        lastMidRippleTime = currentTime;
                    }
                    
                    // High frequency ripples - lower threshold and less randomness
                    if (highAvg > 40 && currentTime - lastHighRippleTime > rippleInterval * 0.5) { // Even more frequent
                        ripples.push({
                            radius: 50,
                            maxRadius: 80 + (highAvg / 255) * 35, // Comparable sizing
                            opacity: 0.15 + (highAvg / 255) * 0.5, // Better visibility
                            lineWidth: 1 + (highAvg / 255) * 2,
                            speed: 1.2 + (highAvg / 255) * 0.8, // Faster ripples for highs
                            hue: 210 + (highAvg / 255) * 25 // More color variation for highs
                        });
                        lastHighRippleTime = currentTime;
                    }
                    
                    // Random ripples based on overall spectrum for more varied response
                    const overallAvg = Array.from(this.frequencyData).reduce((sum, val) => sum + val, 0) / 
                                    this.frequencyData.length / 255;
                    
                    // Add random ripples for more variation and responsiveness
                    if (overallAvg > 0.15 && Math.random() > 0.85) {
                        const hue = 190 + Math.random() * 30; // Random blue hue
                        ripples.push({
                            radius: 50, 
                            maxRadius: 60 + Math.random() * 50,
                            opacity: 0.1 + Math.random() * 0.3,
                            lineWidth: 1 + Math.random() * 2,
                            speed: 0.8 + Math.random() * 1.2,
                            hue: hue
                        });
                    }
                } catch (err) {
                    console.error("Error during visualization:", err);
                }
            }
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw all active ripples
            for (let i = 0; i < ripples.length; i++) {
                const ripple = ripples[i];
                
                // Draw ripple
                ctx.beginPath();
                ctx.arc(centerX, centerY, ripple.radius, 0, Math.PI * 2);
                
                // Calculate opacity (fades as the ripple expands)
                const rippleOpacity = ripple.opacity * (1 - ripple.radius / ripple.maxRadius);
                
                // Create a color with calculated opacity
                const color = `hsla(${ripple.hue}, 90%, 60%, ${rippleOpacity})`;
                
                // Style and draw the ripple
                ctx.strokeStyle = color;
                ctx.lineWidth = ripple.lineWidth * (1 - (ripple.radius / ripple.maxRadius) * 0.5);
                ctx.shadowBlur = 10;
                ctx.shadowColor = `hsla(${ripple.hue}, 90%, 60%, 0.5)`;
                ctx.stroke();
                
                // Expand the ripple
                ripple.radius += ripple.speed;
                
                // Remove ripples that have expanded beyond their max radius
                if (ripple.radius >= ripple.maxRadius) {
                    ripples.splice(i, 1);
                    i--;
                }
            }
            
            // Draw a faint base circle (water surface) with slight pulse
            const pulseSize = Math.sin(currentTime / 1000) * 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 50 + pulseSize, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0, 170, 255, 0.2)";
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 5;
            ctx.shadowColor = "rgba(0, 170, 255, 0.3)";
            ctx.stroke();
            
            // Request next frame
            requestAnimationFrame(drawVisualization);
        };
        
        // Start visualization loop
        requestAnimationFrame(drawVisualization);
    }
};

// Audio System with cycling UI sounds (click, hover sounds)
const AudioManager = {
    sounds: {
        hover: [
            new Audio('audio/ui/hover1.wav'),
            new Audio('audio/ui/hover2.wav'),
            new Audio('audio/ui/hover3.wav')
        ],
        click: [
            new Audio('audio/ui/click1.wav'),
            new Audio('audio/ui/click2.wav'),
            new Audio('audio/ui/click3.wav')
        ],
        expand: new Audio('audio/ui/mechanical.wav')
    },
    
    isMuted: false,
    hoverSoundIndex: 0,
    clickSoundIndex: 0,
    currentSound: null,
    
    // Initialize the UI sound manager
    init() {
        console.log("Initializing UI sound manager...");
        
        // Set up UI sounds volumes
        this.sounds.hover.forEach(sound => sound.volume = 0.1);
        this.sounds.click.forEach(sound => sound.volume = 0.1);
        this.sounds.expand.volume = 0.1;
    },
    
    // Play UI sound effects
    playSound(soundType) {
        if (this.isMuted) return;
        
        // Stop any currently playing sound
        if (this.currentSound) {
            this.currentSound.pause();
            this.currentSound.currentTime = 0;
        }
        
        let sound;
        
        // Handle cycling through arrays of sounds for hover and click
        if (soundType === 'hover') {
            sound = this.sounds.hover[this.hoverSoundIndex].cloneNode();
            // Cycle to next hover sound
            this.hoverSoundIndex = (this.hoverSoundIndex + 1) % this.sounds.hover.length;
        } 
        else if (soundType === 'click') {
            sound = this.sounds.click[this.clickSoundIndex].cloneNode();
            // Cycle to next click sound
            this.clickSoundIndex = (this.clickSoundIndex + 1) % this.sounds.click.length;
        }
        else {
            // For other sounds like 'expand'
            sound = this.sounds[soundType].cloneNode();
        }
        
        // Set this as the current sound
        this.currentSound = sound;
        
        // Play the sound
        sound.play().catch(error => {
            console.log(`Sound play prevented (${soundType}):`, error);
        });
        
        // Clean up after playing
        sound.addEventListener('ended', () => {
            if (this.currentSound === sound) {
                this.currentSound = null;
            }
        });
    },
    
    // Connect the mute toggle from CircularAudioVisualizer
    syncMuteState(isMuted) {
        this.isMuted = isMuted;
    }
};

// Initialize audio visualizer immediately
CircularAudioVisualizer.init();

// Initialize everything else when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Initialize the UI sound manager
    AudioManager.init();
    
    //===========================================================================
    // ELEMENT REFERENCES
    //===========================================================================
    // Main page elements
    const profilePic = document.querySelector(".profile-pic-container");
    const name = document.getElementById("name");
    const bioSection = document.querySelector(".bio");
    const footer = document.querySelector("footer");
    const projectsSection = document.querySelector(".projects-section");
    
    // Social media links
    const contactLinks = document.querySelectorAll('.contact-link');
    
    // Add click sounds to contact links (Facebook, Email, etc.)
    contactLinks.forEach(link => {
        link.addEventListener('click', () => {
            AudioManager.playSound('click');
        });
    });
    
    //===========================================================================
    // PROJECTS SETUP
    //===========================================================================
    const projectCards = Array.from(document.querySelectorAll(".project-card"));
    
    // Enhanced project cards with expandable details
    projectCards.forEach((card, index) => {
        // Create a hidden details section for each card
        const detailsSection = document.createElement('div');
        detailsSection.className = 'project-details';
        detailsSection.innerHTML = `
            <p>This project showcases my skills in design and development.</p>
            <div class="project-tech">
                <span class="tech-tag">HTML</span>
                <span class="tech-tag">CSS</span>
                <span class="tech-tag">JavaScript</span>
            </div>
            <a href="#" class="project-link">View Project <i class="fas fa-arrow-right"></i></a>
        `;
        detailsSection.style.display = 'none';
        card.appendChild(detailsSection);
        
        // Add hover sound effect to each card
        card.addEventListener('mouseenter', () => {
            AudioManager.playSound('hover');
        });
        
        // Simplified toggle details on click
        card.addEventListener('click', function(e) {
            // Don't toggle if clicking on a link
            if (e.target.closest('a')) return;
            
            AudioManager.playSound('expand');
            
            const details = this.querySelector('.project-details');
            const isExpanding = details.style.display === 'none' || !details.style.display;
            
            // If expanding this card, collapse any others first
            if (isExpanding) {
                document.querySelectorAll('.project-card.expanded').forEach(expandedCard => {
                    if (expandedCard !== this) {
                        expandedCard.classList.remove('expanded');
                        expandedCard.querySelector('.project-details').style.display = 'none';
                    }
                });
            }
            
            // Toggle this card
            details.style.display = isExpanding ? 'block' : 'none';
            this.classList.toggle('expanded', isExpanding);
        });
    });

    //===========================================================================
    // BACKGROUND TRANSITION ON SCROLL
    //===========================================================================
    function handleBackgroundTransition() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const transitionPoint = windowHeight * 0.3;
        
        if (scrollPosition > transitionPoint) {
            const opacity = Math.min((scrollPosition - transitionPoint) / (windowHeight * 0.3), 1);
            document.body.style.setProperty('--second-bg-opacity', opacity);
            document.documentElement.style.setProperty('--first-bg-opacity', 1 - opacity);
            document.body.classList.add('scrolled');
        } else {
            document.body.style.setProperty('--second-bg-opacity', 0);
            document.documentElement.style.setProperty('--first-bg-opacity', 1);
            document.body.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleBackgroundTransition);
    
    //===========================================================================
    // ELEMENT ENTRANCE ANIMATIONS
    //===========================================================================
    // Staggered animations for page elements as they load
    
    // Profile picture appears first
    setTimeout(() => {
        profilePic.style.opacity = "1";
        profilePic.style.transform = "translateY(0)";
    }, 300);

    // Name appears second
    setTimeout(() => {
        name.style.opacity = "1";
        name.style.transform = "translateY(0)";
    }, 800);

    // Bio appears third
    setTimeout(() => {
        bioSection.style.opacity = "1";
        bioSection.style.transform = "translateY(0)";
    }, 1300);
    
    // Projects section appears fourth
    setTimeout(() => {
        projectsSection.style.opacity = "1";
        projectsSection.style.transform = "translateY(0)";
    }, 1600);

    // Footer appears last
    setTimeout(() => {
        footer.style.opacity = "1";
        footer.style.transform = "translateY(0)";
    }, 1900);
    
    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.contact-link, .bio .quote');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            AudioManager.playSound('hover');
        });
    });

    // Create floating particles in the background
    createParticles();
});

// Interactive quote changer
document.addEventListener('DOMContentLoaded', () => {
    const bioQuote = document.querySelector('.bio .quote');
    if (!bioQuote) return;
    
    const quotes = [
        '"Two in harmony surpasses one in perfection."',
        '"Code is poetry written for machines to execute and humans to read."',
        '"Creativity is intelligence having fun."',
        '"Success is not final, failure is not fatal: It is the courage to continue that counts."'
    ];
    
    let currentQuoteIndex = 0;
    
    bioQuote.addEventListener('click', () => {
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playSound('click');
        }
        
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
        
        // Add fade-out animation
        bioQuote.style.opacity = '0';
        bioQuote.style.transform = 'translateY(-10px)';
        
        // Change quote and fade back in
        setTimeout(() => {
            bioQuote.textContent = quotes[currentQuoteIndex];
            bioQuote.style.opacity = '1';
            bioQuote.style.transform = 'translateY(0)';
        }, 300);
    });
    
    // Add a hint to show it's clickable
    bioQuote.style.cursor = 'pointer';
    bioQuote.setAttribute('title', 'Click for another quote');
});

// Create floating particles in the background
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position and size
        const size = Math.random() * 5 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        
        // Random animation duration and delay
        const duration = Math.random() * 30 + 10;
        const delay = Math.random() * 10;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.7 + 0.3;
        
        particlesContainer.appendChild(particle);
    }
}