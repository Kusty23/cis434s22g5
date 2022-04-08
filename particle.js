class Particle {
    constructor(x, y, radius, color) {
        this.radius = radius;
        this.color = color;
        this.x = x;
        this.y = y;

        this.div = document.createElement('div');
        this.div.className = 'circle';

        this.div.style.position = 'absolute';
        this.div.style.borderRadius = '50%';

        this.div.style.left = x + 'px';
        this.div.style.top = y + 'px';

        this.div.style.backgroundColor = this.color;
        this.div.style.width = (radius * 2) + 'px';
        this.div.style.height = (radius * 2) + 'px';
        document.body.appendChild(this.div);
    }

    explode(scale) {
        let newRadius = (Math.random() * scale) * this.radius + this.radius;
        let newX = Math.random() * 40 - 20 + this.x;
        let newY = Math.random() * 40 - 20 + this.y;

        $(this.div).animate({
            width: newRadius * 2 + 'px',
            height: newRadius * 2 + 'px',
            left: newX + 'px',
            top: newY + 'px'
        }, 300);

        $(this.div).animate({
            opacity: 0,
        }, 1000);
    }
}

function explosion(x, y, r, n, d) {
    let particles = [];

    for (let i = 0; i < n; i++) {
        let delx = Math.random() * d;
        let dely = Math.random() * d;
        let rad = Math.random() * r + r;

        let c = parseInt(Math.random() * 70 + 100);
        let color = 'rgb(' + c + ',' + c + ',' + c + ')';

        particles.push(new Particle(x + delx, y + dely, rad, color));
    }

    for (let i = 0; i < n; i++) {
        particles[i].explode(.2);
    }
}
