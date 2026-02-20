import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { preloadImages } from "./utils.js"

gsap.registerPlugin(ScrollTrigger)

class StickyGridScroll {
    constructor() {
        this.getElements()

        this.initContent()
        this.groupItemsByColumn()

        this.addParallaxOnScroll()
        this.animateTitleOnScroll()
    }

    /**
     * Select and store the DOM elements needed for the animation
     * @returns {void}
     */
    getElements() {
        this.block = document.querySelector(".block--main")

        if (this.block) {
            this.wrapper = this.block.querySelector(".block__wrapper")
            this.content = this.block.querySelector(".content")
            this.title = this.block.querySelector(".content__title")
            this.description = this.block.querySelector(".content__description")
            this.button = this.block.querySelector(".content__button")
            this.items = this.block.querySelectorAll(".gallery__item")
        }
    }

    /**
     * Initializes the visual state of the content before animations
     * @returns {void}
     */
    initContent() {
        if (this.description && this.button) {
            // Hide description and button
            gsap.set([this.description, this.button], { opacity: 0, pointerEvents: "none" })
        }

        if (this.content && this.title) {
            // Calculate how many pixels are needed to vertically center the title inside its container
            const dy = (this.content.offsetHeight - this.title.offsetHeight) / 2

            // Convert this pixel offset into a percentage of the container height
            this.titleOffsetY = (dy / this.content.offsetHeight) * 100

            // Apply the vertical positioning using percent-based transform
            gsap.set(this.title, { yPercent: this.titleOffsetY })
        }
    }

    /**
     * Group grid items into a fixed number of columns (default: 3)
     * @returns {void}
     */
    groupItemsByColumn() {
        this.numColumns = 3

        // Initialize an array for each column
        this.columns = Array.from({ length: this.numColumns }, () => [])

        // Distribute grid items into column buckets
        this.items.forEach((item, index) => {
            this.columns[index % this.numColumns].push(item)
        })
    }

    /**
     * Apply a parallax effect to the wrapper when scrolling
     * @returns {void}
     */
    addParallaxOnScroll() {
        if (!this.block || !this.wrapper) {
            return
        }

        // Create a scroll-driven timeline
        // Animate the wrapper vertically based on scroll position
        gsap.from(this.wrapper, {
            yPercent: -100,
            ease: "none",
            scrollTrigger: {
                trigger: this.block,
                start: "top bottom", // Start when top of block hits bottom of viewport
                end: "top top", // End when top of block hits top of viewport
                scrub: true, // Smooth animation based on scroll position
            },
        })
    }

    /**
     * Animate the title element when the block scrolls into view
     * @returns {void}
     */
    animateTitleOnScroll() {
        if (!this.block || !this.title) {
            return
        }

        // Create a scroll-driven timeline
        // Animate the title's opacity when the block reaches 57% of the viewport height
        gsap.from(this.title, {
            opacity: 0,
            duration: 0.7,
            ease: "power1.out",
            scrollTrigger: {
                trigger: this.block,
                start: "top 57%", // Start when top of block hits 57% of viewport
                toggleActions: "play none none reset", // Play on enter, reset on leave back
            },
        })
    }
}

// Initialize smooth scrolling using Lenis and synchronize it with GSAP ScrollTrigger
function initSmoothScrolling() {
    // Create a new Lenis instance for smooth scrolling
    const lenis = new Lenis({
        lerp: 0.08,
        wheelMultiplier: 1.4,
    })

    // Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
    lenis.on("scroll", ScrollTrigger.update)

    // Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
    // This ensures Lenis's smooth scroll animation updates on each GSAP tick
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000) // Convert time from seconds to milliseconds
    })

    // Disable lag smoothing in GSAP to prevent any delay in scroll animations
    gsap.ticker.lagSmoothing(0)
}

// Preload images then initialize everything
preloadImages().then(() => {
    document.body.classList.remove("loading") // Remove loading state from body
    initSmoothScrolling() // Initialize smooth scrolling
    new StickyGridScroll() // Initialize grid animation
})
