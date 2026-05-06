import "./style.css"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { preloadImages } from "./scripts/utils.js"

gsap.registerPlugin(ScrollTrigger)

class HeroScroll {
    constructor() {
        this.getElements()

        if (!this.hero || !this.grid || !this.items.length) {
            return
        }

        this.groupItemsByColumn()

        this.initState()
        this.animateOnScroll()
    }

    getElements() {
        this.hero = document.querySelector(".hero-scroll")

        if (this.hero) {
            this.copy = this.hero.querySelector(".hero-copy")
            this.media = this.hero.querySelector(".hero-media")
            this.grid = this.hero.querySelector(".hero-media__grid")
            this.items = this.hero.querySelectorAll(".hero-media__item")
        }
    }

    groupItemsByColumn() {
        this.numColumns = 3
        this.columns = Array.from({ length: this.numColumns }, () => [])
        this.items.forEach((item, index) => {
            this.columns[index % this.numColumns].push(item)
        })
    }

    initState() {
        gsap.set(this.items, { opacity: 0 })
        gsap.set(this.grid, { scale: 0.86 })
    }

    initMobileState() {
        gsap.set(this.items, { opacity: 1, clearProps: "transform" })
        gsap.set(this.grid, { scale: 1, clearProps: "transform" })
    }

    gridRevealTimeline(columns = this.columns) {
        const timeline = gsap.timeline({ defaults: { duration: 1.35, ease: "none" } })
        columns.forEach((column, colIndex) => {
            const fromTop = colIndex % 2 === 0

            timeline.from(
                column,
                {
                    yPercent: fromTop ? -140 : 140,
                    opacity: 0,
                },
                "grid-reveal",
            )
        })

        return timeline
    }

    gridZoomTimeline(columns = this.columns) {
        const timeline = gsap.timeline({ defaults: { duration: 1.15, ease: "none" } })

        timeline.to(this.grid, { scale: 1.35 })
        timeline.to(columns[0], { xPercent: -18, yPercent: -8 }, "<")
        timeline.to(columns[1], { yPercent: 10 }, "<")
        timeline.to(columns[2], { xPercent: 18, yPercent: -8 }, "<")
        timeline.to(
            this.items,
            {
                opacity: (index) => (index % 2 === 0 ? 0.74 : 1),
                duration: 0.55,
                ease: "none",
            },
            "-=0.5",
        )

        return timeline
    }

    animateOnScroll() {
        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: this.hero,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.4,
            },
        })

        timeline
            .add(this.gridRevealTimeline())
            .to(this.items, { opacity: 1, duration: 0.8, ease: "none" }, "-=0.45")
            .add(this.gridZoomTimeline(), "-=0.1")
            .to(this.grid, { scale: 1.48, duration: 0.95, ease: "none" })
            .to(
                this.items,
                {
                    opacity: 0,
                    yPercent: (index) => (index < 3 ? -24 : 24),
                    duration: 1.45,
                    ease: "none",
                },
                "-=0.05",
            )
            .to(this.grid, { scale: 1.62, duration: 1.45, ease: "none" }, "<")
    }
}

function initSmoothScrolling() {
    const lenis = new Lenis({
        lerp: 0.08,
        wheelMultiplier: 1.4,
    })

    lenis.on("scroll", ScrollTrigger.update)

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)
}

function initBridgeCarousel() {
    const carousel = document.querySelector("[data-bridge-carousel]")

    if (!carousel) {
        return
    }

    const slides = Array.from(carousel.querySelectorAll(".bridge-carousel__slide"))
    const dots = Array.from(carousel.querySelectorAll(".bridge-carousel__dots button"))
    const viewport = carousel.querySelector(".bridge-carousel__viewport")
    const prevButton = carousel.querySelector(".bridge-carousel__arrow--prev")
    const nextButton = carousel.querySelector(".bridge-carousel__arrow--next")
    let currentIndex = 0
    let autoplayId

    if (!slides.length) {
        return
    }

    const setActiveSlide = (nextIndex) => {
        currentIndex = (nextIndex + slides.length) % slides.length

        slides.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === currentIndex)
        })

        dots.forEach((dot, index) => {
            const isActive = index === currentIndex
            dot.classList.toggle("is-active", isActive)
            dot.setAttribute("aria-current", isActive ? "true" : "false")
        })
    }

    const goToNextSlide = () => setActiveSlide(currentIndex + 1)
    const goToPreviousSlide = () => setActiveSlide(currentIndex - 1)
    const stopAutoplay = () => window.clearInterval(autoplayId)
    const startAutoplay = () => {
        stopAutoplay()
        autoplayId = window.setInterval(goToNextSlide, 8000)
    }

    prevButton?.addEventListener("click", () => {
        goToPreviousSlide()
        startAutoplay()
    })

    nextButton?.addEventListener("click", () => {
        goToNextSlide()
        startAutoplay()
    })

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            setActiveSlide(index)
            startAutoplay()
        })
    })

    carousel.addEventListener("mouseenter", stopAutoplay)
    carousel.addEventListener("mouseleave", startAutoplay)
    carousel.addEventListener("focusin", stopAutoplay)
    carousel.addEventListener("focusout", startAutoplay)

    viewport?.addEventListener("click", (event) => {
        if (event.target.closest(".bridge-carousel__arrow")) {
            return
        }

        stopAutoplay()
    })

    viewport?.addEventListener("touchstart", (event) => {
        if (event.target.closest(".bridge-carousel__arrow")) {
            return
        }

        stopAutoplay()
    }, { passive: true })

    setActiveSlide(0)
    startAutoplay()
}

function initBackToTop() {
    const button = document.querySelector(".back-to-top")

    if (!button) {
        return
    }

    const toggleVisibility = () => {
        button.classList.toggle("is-visible", window.scrollY > 500)
    }

    button.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    })

    window.addEventListener("scroll", toggleVisibility, { passive: true })
    toggleVisibility()
}

preloadImages().then(() => {
    document.body.classList.remove("loading")
    initSmoothScrolling()
    initBridgeCarousel()
    initBackToTop()
    new HeroScroll()
})
