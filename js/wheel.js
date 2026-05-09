document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const spinBtn = document.getElementById('spinBtn');
    const resultDisplay = document.getElementById('resultDisplay');

    let books = [];
    
    // Load books from localStorage
    function loadBooks() {
        const dbString = localStorage.getItem('myBooksDB');
        if (dbString) {
            const db = JSON.parse(dbString);
            // Combine upcoming and someday (wishlist) for the wheel
            books = [...(db.someday || []), ...(db.upcoming || [])].map(b => b.title);
        }
        
        // Remove duplicates and blanks
        books = [...new Set(books.filter(b => b.trim() !== ''))];
        
        if (books.length === 0) {
            books = ['Add books', 'to wishlist', 'to spin!'];
        }
    }

    loadBooks();

    const numSegments = books.length;
    const arc = Math.PI / (numSegments / 2);
    let startAngle = 0;
    
    // Physics variables
    let spinVelocity = 0;
    let isSpinning = false;
    let friction = 0.98; // Deceleration rate

    // Colors for the wheel
    const colors = ['#f4a261', '#e76f51', '#2a9d8f', '#e9c46a', '#264653', '#8ab17d', '#e07a5f', '#3d5a80', '#98c1d9'];

    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 2;

        for (let i = 0; i < numSegments; i++) {
            const angle = startAngle + i * arc;
            
            ctx.beginPath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
            ctx.fill();
            ctx.save();
            
            // Add borders
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Text
            ctx.translate(centerX + Math.cos(angle + arc / 2) * (radius * 0.55), 
                          centerY + Math.sin(angle + arc / 2) * (radius * 0.55));
            ctx.rotate(angle + arc / 2);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            
            // Truncate long titles
            let text = books[i];
            if(text.length > 20) text = text.substring(0, 17) + '...';
            
            ctx.fillText(text, 0, 0);
            ctx.restore();
        }
    }

    function animate() {
        if (spinVelocity > 0.001) {
            startAngle += spinVelocity;
            spinVelocity *= friction; // apply friction
            
            // Add a tiny bit of random variation to friction for realism
            if (spinVelocity < 0.1) {
                friction = 0.97 + Math.random() * 0.01;
            }

            drawWheel();
            requestAnimationFrame(animate);
        } else if (isSpinning) {
            // Spin stopped
            isSpinning = false;
            spinVelocity = 0;
            
            // Determine result
            // The pointer is at the top (which is -PI/2 relative to standard angles)
            // Normalize startAngle
            const normalizedStart = startAngle % (2 * Math.PI);
            
            // Pointer angle is effectively 0 at the top, but our drawing is standard Math.PI/2 offset.
            // Let's calculate which segment is exactly at the top. Top is at angle 3*PI/2
            let pointerAngle = (3 * Math.PI / 2 - normalizedStart) % (2 * Math.PI);
            if (pointerAngle < 0) {
                pointerAngle += 2 * Math.PI;
            }
            
            const winningIndex = Math.floor(pointerAngle / arc);
            
            resultDisplay.innerHTML = `You should read:<br><span style="color:#e74c3c">${books[winningIndex]}</span>! 📖`;
            drawWheel(); // final frame
        }
    }

    spinBtn.addEventListener('click', () => {
        if (isSpinning) return;
        if (books.length <= 1 && books[0] === 'Add books') {
            resultDisplay.innerText = "Please add books to your wishlist first!";
            return;
        }

        resultDisplay.innerText = "Spinning...";
        isSpinning = true;
        // Random initial velocity between 0.3 and 0.6
        spinVelocity = 0.3 + Math.random() * 0.3; 
        friction = 0.98; // reset friction
        animate();
    });

    // Initial draw
    drawWheel();
});
