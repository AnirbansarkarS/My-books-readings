document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const spinBtn = document.getElementById('spinBtn');
    const resultDisplay = document.getElementById('resultDisplay');
    const configList = document.getElementById('bookConfigList');

    let wheelData = []; // Array of { title: 'Book Name', weight: 50 }
    const defaultWeight = 50;
    
    // Load books from localStorage
    function loadBooks() {
        const dbString = localStorage.getItem('myBooksDB');
        let wishlistTitles = [];
        
        if (dbString) {
            const db = JSON.parse(dbString);
            // ONLY from someday (wishlist)
            wishlistTitles = (db.someday || []).map(b => b.title).filter(b => b.trim() !== '');
        }

        const savedWheelStr = localStorage.getItem('wheelData');
        let savedWheel = savedWheelStr ? JSON.parse(savedWheelStr) : [];
        
        // Merge saved wheel data with current wishlist
        wheelData = [];
        wishlistTitles.forEach(title => {
            const existing = savedWheel.find(w => w.title === title);
            if (existing) {
                wheelData.push(existing);
            } else {
                wheelData.push({ title: title, weight: defaultWeight });
            }
        });

        if (wheelData.length === 0) {
            wheelData = [
                { title: 'Add wishlist books', weight: 100 }
            ];
        }

        renderCustomizer();
    }

    function saveWheelData() {
        localStorage.setItem('wheelData', JSON.stringify(wheelData));
        drawWheel(); // redraw immediately on change
    }

    function renderCustomizer() {
        if(!configList) return;
        configList.innerHTML = '';
        if (wheelData.length === 1 && wheelData[0].title === 'Add wishlist books') {
            configList.innerHTML = '<p style="text-align:center; color:#e74c3c;">Your wishlist is empty! Go back and add some books.</p>';
            return;
        }

        wheelData.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'book-config-item';
            
            div.innerHTML = `
                <div class="book-config-title" title="${item.title}">${item.title}</div>
                <div class="prob-input-group">
                    <input type="number" min="1" max="100" value="${item.weight}" data-index="${index}" class="weight-input">
                    <span>% / 100</span>
                </div>
                <button class="btn-delete" data-index="${index}" title="Remove from wheel">🗑️</button>
            `;
            configList.appendChild(div);
        });

        // Add event listeners for inputs
        document.querySelectorAll('.weight-input').forEach(input => {
            input.addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val <= 0) val = 1;
                if (val > 100) val = 100;
                e.target.value = val;
                
                const idx = parseInt(e.target.getAttribute('data-index'));
                wheelData[idx].weight = val;
                saveWheelData();
            });
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                wheelData.splice(idx, 1);
                if (wheelData.length === 0) {
                    wheelData = [{ title: 'Add wishlist books', weight: 100 }];
                }
                saveWheelData();
                renderCustomizer();
            });
        });
    }

    loadBooks();

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

        const totalWeight = wheelData.reduce((sum, item) => sum + item.weight, 0);

        let currentAngle = startAngle;

        for (let i = 0; i < wheelData.length; i++) {
            const item = wheelData[i];
            const arcAngle = (item.weight / totalWeight) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + arcAngle, false);
            ctx.fill();
            ctx.save();
            
            // Add borders
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Text
            const textAngle = currentAngle + arcAngle / 2;
            ctx.translate(centerX + Math.cos(textAngle) * (radius * 0.55), 
                          centerY + Math.sin(textAngle) * (radius * 0.55));
            ctx.rotate(textAngle);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            
            // Truncate long titles
            let text = item.title;
            if(text.length > 20) text = text.substring(0, 17) + '...';
            
            ctx.fillText(text, 0, 0);
            ctx.restore();
            
            currentAngle += arcAngle;
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
            // Pointer is at the top, which is 3*PI/2 angle
            const normalizedStart = startAngle % (2 * Math.PI);
            let pointerAngle = (3 * Math.PI / 2 - normalizedStart) % (2 * Math.PI);
            if (pointerAngle < 0) {
                pointerAngle += 2 * Math.PI;
            }
            
            const totalWeight = wheelData.reduce((sum, item) => sum + item.weight, 0);
            
            let currentAngleCheck = 0;
            let winningIndex = 0;
            for (let i = 0; i < wheelData.length; i++) {
                const arcAngle = (wheelData[i].weight / totalWeight) * 2 * Math.PI;
                if (pointerAngle >= currentAngleCheck && pointerAngle < currentAngleCheck + arcAngle) {
                    winningIndex = i;
                    break;
                }
                currentAngleCheck += arcAngle;
            }
            
            resultDisplay.innerHTML = `You should read:<br><span style="color:#e0d0b8">${wheelData[winningIndex].title}</span>! 📖`;
            drawWheel(); // final frame
        }
    }

    spinBtn.addEventListener('click', () => {
        if (isSpinning) return;
        if (wheelData.length <= 1 && wheelData[0].title === 'Add wishlist books') {
            resultDisplay.innerText = "Please add books to your wishlist first!";
            return;
        }

        resultDisplay.innerHTML = "Spinning...<br>&nbsp;";
        isSpinning = true;
        // Random initial velocity
        spinVelocity = 0.3 + Math.random() * 0.3; 
        friction = 0.98; // reset friction
        animate();
    });

    // Initial draw
    drawWheel();
});
