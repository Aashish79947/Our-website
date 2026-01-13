let currentPlayingVideo = null;
let wasMusicPlayingBeforeVideo = false;
let isUserSelection = false;

function createFallingHearts() {
    const container = document.getElementById('heart-container');
    const heartSymbols = ['❤️', '💖', '💗', '💓', '💕'];

    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'falling-heart';
        heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];

        // Random horizontal position
        heart.style.left = Math.random() * 100 + 'vw';

        // Random size
        const size = Math.random() * (25 - 10) + 10;
        heart.style.fontSize = size + 'px';

        // Random duration between 3 and 7 seconds
        const duration = Math.random() * (7 - 3) + 3;
        heart.style.animationDuration = duration + 's';

        // Random opacity
        heart.style.opacity = Math.random() * (0.8 - 0.3) + 0.3;

        container.appendChild(heart);

        // Remove heart after it falls
        setTimeout(() => {
            heart.remove();
        }, duration * 1000);
    }, 300);
}

document.addEventListener('DOMContentLoaded', function () {
    const musicTracks = [
        { name: "Perfect - Ed Sheeran", path: "./photos/musics/perfect.mp3" },
        { name: "I Wanna Be Yours - Arctic Monkeys", path: "./photos/musics/wannabeyours.mp3" },
        { name: "I Think They Call This Love - Elliot James Reay", path: "./photos/musics/I_Think_They_Call_This_Love_Cover.mp3" }
    ];

    const audio = document.getElementById('bg-music');
    const toggleBtn = document.getElementById('music-toggle');
    const prevBtn = document.getElementById('prev-track');
    const nextBtn = document.getElementById('next-track');
    const nowPlaying = document.getElementById('now-playing');
    const trackSelector = document.getElementById('track-selector');
    const visualizer = document.getElementById('music-visualizer');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');

    let currentTrack = 0;

    function initMusicPlayer() {
        audio.volume = 0.5;
        loadTrack(0);

        toggleBtn.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', prevTrack);
        nextBtn.addEventListener('click', nextTrack);

        trackSelector.addEventListener('change', function () {
            currentTrack = parseInt(this.value);
            loadTrack(currentTrack);
            playAudio();
        });

        audio.addEventListener('ended', nextTrack);
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = formatTime(audio.duration);
        });

        progressBar.addEventListener('input', () => {
            const seekTime = (progressBar.value / 100) * audio.duration;
            audio.currentTime = seekTime;
        });

        setupVideoIntegration();
    }

    function setupVideoIntegration() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.addEventListener('play', () => {
                if (!audio.paused) {
                    wasMusicPlayingBeforeVideo = true;
                    pauseAudio();
                }
                videos.forEach(v => { if (v !== video) v.pause(); });
                currentPlayingVideo = video;
            });

            const handleVideoPause = () => {
                if (wasMusicPlayingBeforeVideo && audio.paused) {
                    playAudio();
                }
                wasMusicPlayingBeforeVideo = false;
                currentPlayingVideo = null;
            };

            video.addEventListener('pause', () => { if (video === currentPlayingVideo) handleVideoPause(); });
            video.addEventListener('ended', handleVideoPause);
        });
    }

    function loadTrack(index) {
        currentTrack = index;
        const track = musicTracks[index];
        trackSelector.value = index;
        audio.src = track.path;
        nowPlaying.textContent = track.name;
        progressBar.value = 0;
        currentTimeEl.textContent = "0:00";
    }

    function playAudio() {
        if (currentPlayingVideo) {
            currentPlayingVideo.pause();
            currentPlayingVideo = null;
        }
        audio.play().then(() => {
            toggleBtn.textContent = "❚❚";
            visualizer.classList.add('playing');
        }).catch(console.error);
    }

    function pauseAudio() {
        audio.pause();
        toggleBtn.textContent = "▶";
        visualizer.classList.remove('playing');
    }

    function togglePlay() {
        audio.paused ? playAudio() : pauseAudio();
    }

    function nextTrack() {
        currentTrack = (currentTrack + 1) % musicTracks.length;
        loadTrack(currentTrack);
        playAudio();
    }

    function prevTrack() {
        currentTrack = (currentTrack - 1 + musicTracks.length) % musicTracks.length;
        loadTrack(currentTrack);
        playAudio();
    }

    function updateProgress() {
        if (!audio.duration) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.value = percent;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    initMusicPlayer();
    createFallingHearts();

    // Navigation and Gallery Logic
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active-section'));
            this.classList.add('active');
            const sectionId = this.getAttribute('href');
            const targetSection = document.querySelector(sectionId);
            if (targetSection) {
                targetSection.classList.add('active-section');
                targetSection.scrollIntoView({ behavior: 'smooth' });
                // Trigger re-observation after scroll
                setTimeout(observeRevealElements, 600);
            }
        });
    });

    const yearButtons = document.querySelectorAll('.year-btn');
    const yearGalleries = document.querySelectorAll('.year-gallery');

    yearButtons.forEach(button => {
        button.addEventListener('click', function () {
            yearButtons.forEach(btn => btn.classList.remove('active'));
            yearGalleries.forEach(gallery => gallery.classList.remove('active-gallery'));
            this.classList.add('active');
            const year = this.getAttribute('data-year');
            document.getElementById(`${year}-gallery`).classList.add('active-gallery');
            if (document.getElementById(`${year}-gallery`).children.length === 0) {
                loadPhotos(year);
            }
        });
    });

    loadPhotos('2024');

    function openModal(imgSrc, caption, note) {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-image');
        const captionText = document.querySelector('.modal .caption');
        const noteText = document.querySelector('.modal .note');
        modal.style.display = "block";
        modalImg.src = imgSrc;
        captionText.textContent = caption;
        noteText.textContent = note;
    }

    const modal = document.getElementById('image-modal');
    const closeModal = document.querySelector('.close');
    if (closeModal) {
        closeModal.addEventListener('click', () => modal.style.display = "none");
    }
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = "none"; });

    // Scroll Reveal Initial Observation
    observeRevealElements();

});


// Replace the loadPhotos function with this version
function loadPhotos(year) {
    const gallery = document.getElementById(`${year}-gallery`);
    if (!gallery) return;
    gallery.innerHTML = '';

    // Photo data with captions - customize these!
    const photoData = {
        '2024': [
            { filename: 'IMG_0863.jpg', caption: 'Sweet Beginnings', note: 'Every moment with you feels like a dream come true.' },
            { filename: 'IMG_1300.jpg', caption: 'Your Beautiful Smile', note: 'The way you look at me makes my heart skip a beat.' },
            { filename: 'IMG_1526.jpg', caption: 'Together Always', note: 'I found my home in your heart.' },
            { filename: 'IMG_1719.jpg', caption: 'Golden Hour Love', note: 'You shine brighter than any sunset.' },
            { filename: 'IMG_1744.jpg', caption: 'Wrapped in Love', note: 'The safest place in the world is in your arms.' },
            { filename: 'IMG_1760.jpg', caption: 'Simply Us', note: 'Life is better when we are together.' },
            { filename: 'IMG_1809.jpg', caption: 'My Favorite Person', note: 'Thank you for being you.' },
            { filename: 'IMG_2049.jpg', caption: 'Pure Happiness', note: 'You are the reason behind my biggest smiles.' },
            { filename: 'IMG_2173.jpg', caption: 'Little Adventures', note: 'Exploring the world, one step at a time, with you.' },
            { filename: 'IMG_2860.jpg', caption: 'Magic in the Air', note: 'Every day is an adventure with my love.' },
            { filename: 'IMG_2953.jpg', caption: 'Sweetest Soul', note: 'You have the kindest heart I have ever known.' },
            { filename: 'IMG_3004.jpg', caption: 'Under the Stars', note: 'My universe revolves around you.' },
            { filename: 'IMG_4046.jpg', caption: 'Love Language', note: 'Sometimes, words aren\'t enough to say how much I love you.' },
            { filename: 'IMG_4158.jpg', caption: 'Perfect Match', note: 'We fit together like two pieces of a puzzle.' },
            { filename: 'IMG_4195.jpg', caption: 'Forever & Always', note: 'I choose you, every single day.' },
            { filename: 'IMG_4241.jpg', caption: 'Dreamy Days', note: 'Lost in our own little world.' },
            { filename: 'IMG_4255.jpg', caption: 'Heart to Heart', note: 'Connected in ways I can\'t even explain.' },
            { filename: 'IMG_4685.jpg', caption: 'So Much Love', note: 'My heart is so full because of you.' },
            { filename: 'IMG_5184.jpg', caption: 'Beautiful Day', note: 'Making the ordinary extraordinary.' },
            { filename: 'IMG_5733.jpg', caption: 'Giggles & Joy', note: 'Thank you for the endless laughter.' },
            { filename: 'IMG_5782.jpg', caption: 'Stay Close', note: 'I never want to let you go.' },
            { filename: 'IMG_5797.jpg', caption: 'Last Memory of 2024', note: 'Can\'t wait for another year of US!' }
        ],
        '2025': [
            { filename: 'IMG_0475.jpg', caption: 'Hello 2025!', note: 'Starting the year with my favorite human.' },
            { filename: 'IMG_0580.jpg', caption: 'Winter Warmth', note: 'You keep my heart warm even on the coldest days.' },
            { filename: 'IMG_0662.jpg', caption: 'Soft Moments', note: 'The peace I find with you is incomparable.' },
            { filename: 'IMG_0719.jpg', caption: 'Thinking of You', note: 'You are always on my mind and in my heart.' },
            { filename: 'IMG_0753.jpg', caption: 'Date Night', note: 'Every date with you is special.' },
            { filename: 'IMG_0817.jpg', caption: 'Your Light', note: 'You brighten up my darkest days.' },
            { filename: 'IMG_0831.jpg', caption: 'Cute Clicks', note: 'Capturing our love, one frame at a time.' },
            { filename: 'IMG_1244.jpg', caption: 'Spring Vibes', note: 'Watching our love bloom beautifully.' },
            { filename: 'IMG_2229.jpg', caption: 'Soulmate', note: 'Meeting you was fate, becoming your friend was a choice, but falling in love with you was beyond my control.' },
            { filename: 'IMG_2600.jpg', caption: 'Hold My Hand', note: 'I\'ll never walk alone as long as you\'re with me.' },
            { filename: 'IMG_6026.jpg', caption: 'Laughter is Love', note: 'You make my soul happy.' },
            { filename: 'IMG_6030.jpg', caption: 'Sun-kissed', note: 'Beautiful memories under the sun.' },
            { filename: 'IMG_6034.jpg', caption: 'Everything!', note: 'You are my everything.' },
            { filename: 'IMG_6046.jpg', caption: 'Quiet Love', note: 'Sometimes the silence speaks louder than words.' },
            { filename: 'IMG_6249.jpg', caption: 'Summer Bliss', note: 'Cooling down with my favorite person.' },
            { filename: 'IMG_7219.jpg', caption: 'Infinite Love', note: 'To the moon and back, forever.' },
            { filename: 'IMG_7451.jpg', caption: 'True Joy', note: 'You bring so much color into my life.' },
            { filename: 'IMG_9222.jpg', caption: 'Cozy Times', note: 'Snuggled up and feeling so loved.' },
            { filename: 'IMG_9224.jpg', caption: 'My Treasure', note: 'You are more precious than anything.' },
            { filename: 'IMG_9252.jpg', caption: 'Best Friend', note: 'So glad I get to spend my life with my best friend.' },
            { filename: 'IMG_9481.jpg', caption: 'Sweet Dreams', note: 'Dreaming of a beautiful future with you.' },
            { filename: 'IMG_9512.jpg', caption: 'Eternal Bond', note: 'Hand in hand, heart to heart.' }
        ]
    };

    photoData[year].forEach(photo => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        const imgContainer = document.createElement('div');
        imgContainer.className = 'img-container';
        const img = document.createElement('img');
        img.src = `photos/${year}/${photo.filename}`;
        img.alt = `Our memory from ${year}`;
        const caption = document.createElement('div');
        caption.className = 'photo-caption';
        caption.textContent = photo.caption;
        imgContainer.appendChild(img);
        galleryItem.appendChild(imgContainer);
        galleryItem.appendChild(caption);
        galleryItem.addEventListener('click', () => {
            // Assuming openModal is accessible or define it correctly
            const modal = document.getElementById('image-modal');
            const modalImg = document.getElementById('modal-image');
            const captionText = document.querySelector('.modal .caption');
            const noteText = document.querySelector('.modal .note');
            if (modal) {
                modal.style.display = "block";
                modalImg.src = img.src;
                captionText.textContent = photo.caption;
                noteText.textContent = photo.note;
            }
        });
        galleryItem.classList.add('reveal');
        gallery.appendChild(galleryItem);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
            }
        });
    }, { threshold: 0.1 });

    gallery.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function updateCounter() {
    const anniversaryDate = new Date('2024-01-14T00:00:00');
    const now = new Date();
    const diff = now - anniversaryDate;
    if (diff < 0) return;

    let years = now.getFullYear() - anniversaryDate.getFullYear();
    let months = now.getMonth() - anniversaryDate.getMonth();
    let days = now.getDate() - anniversaryDate.getDate();
    let hours = now.getHours() - anniversaryDate.getHours();
    let minutes = now.getMinutes() - anniversaryDate.getMinutes();
    let seconds = now.getSeconds() - anniversaryDate.getSeconds();

    if (seconds < 0) { minutes--; seconds += 60; }
    if (minutes < 0) { hours--; minutes += 60; }
    if (hours < 0) { days--; hours += 24; }
    if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) { years--; months += 12; }

    const elements = { 'years': years, 'months': months, 'days': days, 'Hours': hours, 'minutes': minutes, 'seconds': seconds };
    for (const [id, value] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
}

updateCounter();
setInterval(updateCounter, 1000);

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('reveal-active');
    });
}, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

function observeRevealElements() {
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

let lastX = 0, lastY = 0;
const minDistance = 15;
window.addEventListener('mousemove', (e) => {
    const x = e.clientX, y = e.clientY;
    const dist = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
    if (dist > minDistance) {
        createSparkle(x, y);
        lastX = x; lastY = y;
    }
});

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'cursor-sparkle';
    const tx = (Math.random() - 0.5) * 50;
    const ty = (Math.random() - 0.5) * 50;
    sparkle.style.setProperty('--tx', `${tx}px`);
    sparkle.style.setProperty('--ty', `${ty}px`);
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
}