
const items = document.querySelectorAll(".carousel-item");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const lightbox = document.getElementById("lightbox");
const lightboxContent = document.getElementById("lightboxContent");
const closeBtn = document.getElementById("closeBtn");
const prevLightboxBtn = document.getElementById("prevLightboxBtn");
const nextLightboxBtn = document.getElementById("nextLightboxBtn");
const prevThumbnail = document.getElementById("prevThumbnail");
const currentThumbnail = document.getElementById("currentThumbnail");
const nextThumbnail = document.getElementById("nextThumbnail");

let positions = ["left-3", "left-2", "left-1", "center", "right-1", "right-2", "right-3"];
let currentIndex = 3; // Start at the center item (index 3)

// Handle keyboard input for carousel navigation
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        rotateLeft(); // Navigate left
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        rotateRight(); // Navigate right
    }
});

//tiktok/reels type swipe effect
let isLightboxDragging = false;
let startY = 0;
let currentYTranslate = 0;
let prevYTranslate = 0;
let lightboxThreshold = 50; // Minimum swipe distance to trigger a change

// Add touch event listeners to the lightbox content
lightboxContent.addEventListener("touchstart", startLightboxSwipe);
lightboxContent.addEventListener("touchmove", lightboxSwipe);
lightboxContent.addEventListener("touchend", endLightboxSwipe);

// Add mouse event listeners (optional, if you want mouse swipe support)
lightboxContent.addEventListener("mousedown", startLightboxSwipe);
lightboxContent.addEventListener("mousemove", lightboxSwipe);
lightboxContent.addEventListener("mouseup", endLightboxSwipe);
lightboxContent.addEventListener("mouseleave", endLightboxSwipe);

function startLightboxSwipe(event) {
    isLightboxDragging = true;
    startY = getPositionY(event);
    prevYTranslate = currentYTranslate;
    lightboxContent.style.cursor = "grabbing";
}

function lightboxSwipe(event) {
    if (!isLightboxDragging) return;

    const currentPositionY = getPositionY(event);
    currentYTranslate = prevYTranslate + (currentPositionY - startY);
    // Optionally, you can add a visual feedback (e.g., translateY of lightboxContent)
}

function endLightboxSwipe(event) {
    if (!isLightboxDragging) return;
    isLightboxDragging = false;
    lightboxContent.style.cursor = "grab";

    const movedBy = currentYTranslate - prevYTranslate;

    // Swipe up (move down)
    if (movedBy < -lightboxThreshold) {
        rotateRight(); // Move to the next video
        openLightbox(currentIndex);
    }

    // Swipe down (move up)
    if (movedBy > lightboxThreshold) {
        rotateLeft(); // Move to the previous video
        openLightbox(currentIndex);
    }
}

// Helper to get Y position from touch or mouse events
function getPositionY(event) {
    return event.type.includes("touch") ? event.touches[0].clientY : event.clientY;
}


//tiktok/reels type swipe effect


let isDragging = false;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;
let dragThreshold = 100; // Adjusted to require a stronger swipe
let startTime = 0;
const minVelocity = 0.3; // Ensures a quick swipe is needed

const carousel = document.querySelector(".carousel");

// Mouse Events
carousel.addEventListener("mousedown", startDrag);
carousel.addEventListener("mousemove", drag);
carousel.addEventListener("mouseup", endDrag);
carousel.addEventListener("mouseleave", endDrag);

// Touch Events
carousel.addEventListener("touchstart", startDrag);
carousel.addEventListener("touchmove", drag);
carousel.addEventListener("touchend", endDrag);

function startDrag(event) {
    isDragging = true;
    startX = getPositionX(event);
    prevTranslate = currentTranslate;
    startTime = new Date().getTime();
    carousel.style.cursor = "grabbing";
}

function drag(event) {
    if (!isDragging) return;

    const currentPosition = getPositionX(event);
    currentTranslate = prevTranslate + (currentPosition - startX);
}

function endDrag(event) {
    if (!isDragging) return;
    isDragging = false;
    carousel.style.cursor = "grab";

    const movedBy = currentTranslate - prevTranslate;
    const endTime = new Date().getTime();
    const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
    const velocity = Math.abs(movedBy / timeTaken); // Calculate velocity

    if (velocity > minVelocity) {
        // Check movement direction and velocity
        if (movedBy > dragThreshold) {
            rotateLeft();
        } else if (movedBy < -dragThreshold) {
            rotateRight();
        }
    }
}

function getPositionX(event) {
    return event.type.includes("touch") ? event.touches[0].clientX : event.clientX;
}




async function generateThumbnail(videoElement) {
    return new Promise((resolve, reject) => {
        console.log("Generating thumbnail for video:", videoElement);

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const tempVideo = document.createElement("video");

        tempVideo.src = videoElement.querySelector("source").src;
        tempVideo.crossOrigin = "anonymous"; // Prevent CORS issues
        tempVideo.muted = true; // Allow autoplay
        tempVideo.playsInline = true;

        tempVideo.addEventListener("loadeddata", () => {
            console.log("Video loaded, setting currentTime...");
            tempVideo.currentTime = 1; // Capture frame at 1s
        });

        tempVideo.addEventListener("seeked", () => {
            console.log("Video seeked, capturing frame...");
            canvas.width = 50;
            canvas.height = 50;
            context.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
            const thumbnail = canvas.toDataURL("image/png");
            console.log("Thumbnail generated:", thumbnail);
            resolve(thumbnail);
        });

        tempVideo.addEventListener("error", (err) => {
            console.error("Error loading video:", err);
            reject(err);
        });

        tempVideo.load();
    });
}





// Update the carousel
async function updateCarousel() {
    items.forEach((item) => {
        const video = item.querySelector("video");
        if (video) {
            video.pause();
            video.muted = true;
            video.removeAttribute("controls");
        }
    });

    items.forEach((item, index) => {
        item.className = "carousel-item " + positions[index];
    });

    const centerItem = document.querySelector(".carousel-item.center");
    const centerVideo = centerItem.querySelector("video");
    if (centerVideo) {
        centerVideo.play().catch((error) => console.error("Autoplay failed:", error));
    }

    await updateThumbnails(); // Ensure thumbnails are generated on carousel update
}


// Update the thumbnails for lightbox
async function updateThumbnails() {
    console.log("Updating thumbnails...");

    const prevItem = items[(currentIndex - 1 + items.length) % items.length];
    const currentItem = items[currentIndex];
    const nextItem = items[(currentIndex + 1) % items.length];

    const prevMedia = prevItem.querySelector("img, video");
    const currentMedia = currentItem.querySelector("img, video");
    const nextMedia = nextItem.querySelector("img, video");

    if (!prevMedia || !currentMedia || !nextMedia) {
        console.warn("Missing media elements, skipping thumbnail update.");
        return;
    }

    prevThumbnail.src = prevMedia.tagName === "IMG" ? prevMedia.src : await generateThumbnail(prevMedia);
    currentThumbnail.src = currentMedia.tagName === "IMG" ? currentMedia.src : await generateThumbnail(currentMedia);
    nextThumbnail.src = nextMedia.tagName === "IMG" ? nextMedia.src : await generateThumbnail(nextMedia);

    console.log("Thumbnails updated:", {
        prev: prevThumbnail.src,
        current: currentThumbnail.src,
        next: nextThumbnail.src
    });

    prevThumbnail.classList.remove("active");
    currentThumbnail.classList.add("active");
    nextThumbnail.classList.remove("active");
}


function switchVideo(newVideoSrc) {
    const lightboxVideo = document.querySelector("#lightbox-video");

    if (!lightboxVideo) {
        console.error("Lightbox video element not found!");
        return;
    }

    // Pause and clear the current video
    lightboxVideo.pause();
    lightboxVideo.src = "";
    lightboxVideo.load(); // Reset the player

    // Create a temporary video element to preload the new video
    const tempVideo = document.createElement("video");
    tempVideo.src = newVideoSrc;
    tempVideo.preload = "auto";

    tempVideo.oncanplay = () => {
        // Once the new video is ready, swap it
        lightboxVideo.src = newVideoSrc;
        lightboxVideo.load();
        lightboxVideo.play().catch(err => console.warn("Autoplay prevented:", err));

        // Fade video back in
        lightboxVideo.style.opacity = "1";
    };

    // Hide the video while switching
    lightboxVideo.style.opacity = "0";
}



// Rotate left in the carousel
function rotateLeft() {
    positions.push(positions.shift());
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateCarousel();
}

// Rotate right in the carousel
function rotateRight() {
    positions.unshift(positions.pop());
    currentIndex = (currentIndex + 1) % items.length;
    updateCarousel();
}

// Open lightbox for a specific index

function openLightbox(index) {
    const item = items[index];
    const media = item.querySelector("img, video");

    if (media) {
        lightbox.style.display = "flex";

        if (media.tagName === "IMG") {
            lightboxContent.innerHTML = `<img src="${media.src}" alt="Lightbox Image">`;
        } else if (media.tagName === "VIDEO") {
            const videoSrc = media.querySelector("source").src;
            lightboxContent.innerHTML = `
                    <video controls autoplay>
                        <source src="${videoSrc}" type="video/mp4">
                    </video>
                `;
            const lightboxVideo = lightboxContent.querySelector("video");
            lightboxVideo.muted = false;

            lightboxVideo.removeAttribute("controls");//hide controls for video in all devics

            setupLightboxVideoListener();
        }

        updateThumbnails(); // Ensure thumbnails update correctly when opening the lightbox
    }
}


// Close the lightbox
closeBtn.addEventListener("click", () => {
    lightbox.style.display = "none";
    const lightboxVideo = lightboxContent.querySelector("video");
    if (lightboxVideo) {
        lightboxVideo.pause(); // Pause the video when closing the lightbox
        lightboxVideo.removeEventListener("ended", rotateRight); // Remove the listener to avoid duplicates
    }
});

// Automatically move to the next video in the lightbox when it ends
function setupLightboxVideoListener() {
    const lightboxVideo = lightboxContent.querySelector("video");
    if (lightboxVideo) {
        lightboxVideo.addEventListener("ended", () => {
            rotateRight();
            openLightbox(currentIndex);
        });
    }
}

// Navigate in the lightbox
prevLightboxBtn.addEventListener("click", () => {
    rotateLeft();
    openLightbox(currentIndex);
});

nextLightboxBtn.addEventListener("click", () => {
    rotateRight();
    openLightbox(currentIndex);
});

// Navigate the carousel
prevBtn.addEventListener("click", rotateLeft);
nextBtn.addEventListener("click", rotateRight);

// Open the lightbox when clicking on a carousel item
items.forEach((item, index) => {
    item.addEventListener("click", () => {
        openLightbox(index);
    });
});

// Open the lightbox when clicking on a thumbnail
prevThumbnail.addEventListener("click", () => {
    rotateLeft();
    openLightbox(currentIndex);
});

currentThumbnail.addEventListener("click", () => {
    openLightbox(currentIndex);
});

nextThumbnail.addEventListener("click", () => {
    rotateRight();
    openLightbox(currentIndex);
});

// Automatically move to the next carousel item when a video ends
items.forEach((item) => {
    const video = item.querySelector("video");
    if (video) {
        video.addEventListener("ended", rotateRight);
    }
});

// Initialize the carousel
updateCarousel();
