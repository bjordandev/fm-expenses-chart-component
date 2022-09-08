addEventListener('DOMContentLoaded', (domContentLoadedEvent) => {
    const barcharHeight = document.getElementById("barchar").clientHeight;
    const BAR_ANIMATION_DURATION = 200;
    const BAR_ANIMATION_DELAY = 400;
    const BARCHAR_PRICE_SELECTOR = ".barchar__price";

    async function getAmountsPerDay() {
        const response = await fetch("/data.json");
        const data = await response.json();
        
        return data; 
    }

    function animateBar(barElement, startHeight, endHeight, duration) {
        let startTimestamp = null;

        const step = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const currentHeight = Math.floor(progress * (endHeight - startHeight) + startHeight);
          
          barElement.setAttribute("style", `height:${currentHeight}px`);
          
          if (progress < 1) window.requestAnimationFrame(step);
        };

        window.requestAnimationFrame(step);
    }

    function setBarPrice(barElement, newPrice) {
        barElement.querySelector(BARCHAR_PRICE_SELECTOR).textContent = newPrice.toString(); 
    }

    function normalizeValue(min, max, value) {
        const scaleRatio = Math.round((min / max) * 100) / 100;
        return value * scaleRatio; 
    } 
      
    
    getAmountsPerDay().then(data => {
        // Get maximum amount to calculate scaleRatio

        const { amount:max } = data.reduce((max, value) => {
            if (value.amount >= max.amount) return value;
            return max; 
        });
        
        
        for (let i = 0 ; i < data.length ; i++) {
            const { day, amount } = data[i];

            const newBarCharHeight = normalizeValue(amount, max, barcharHeight);
            const barElement = document.querySelector(`.barchar__bar[data-key="${day}"]`);

            setBarPrice(barElement, amount);

            // Delayed Transitions
            const id = setTimeout(() => {
                animateBar(barElement, 0, newBarCharHeight, BAR_ANIMATION_DELAY);
                clearTimeout(id);
            }, BAR_ANIMATION_DURATION * i);
        }
    });
});
