import {
    useEffect,
    useRef,
    useState
} from "react";

import { Link } from "react-router-dom";

const placeholderTitle = (title) => {
    const words = String(title || "")
        .trim()
        .split(/\s+/);

    if (words.length < 4) {
        return encodeURIComponent(
            title || "Movie"
        );
    }

    const middle =
        Math.ceil(words.length / 2);

    return encodeURIComponent(
        words
            .slice(0, middle)
            .join(" ") +
            "\n" +
        words
            .slice(middle)
            .join(" ")
    );
};

export default function Hero({ shows = [] }) {
    const [slides, setSlides] =
        useState([]);

    const [current, setCurrent] =
        useState(0);

    const timerRef =
        useRef(null);

    const touchStartX =
        useRef(0);

    const touchEndX =
        useRef(0);

    const isSwiping =
        useRef(false);

    /*
     * Select random 5 movies
     */
    useEffect(() => {
        if (!shows || !shows.length) {
            setSlides([]);
            return;
        }

        const randomShows =
            [...shows]
                .sort(
                    () =>
                        Math.random() -
                        0.5
                )
                .slice(0, 5);

        setSlides(randomShows);
        setCurrent(0);

    }, [shows]);

    /*
     * Start / restart automatic slider
     */
    const startAutoSlide = () => {
        clearInterval(
            timerRef.current
        );

        if (slides.length <= 1) {
            return;
        }

        timerRef.current =
            setInterval(() => {
                setCurrent(
                    (previous) =>
                        (
                            previous + 1
                        ) %
                        slides.length
                );
            }, 5000);
    };

    /*
     * Start slider when slides change
     */
    useEffect(() => {
        if (slides.length <= 1) {
            return;
        }

        startAutoSlide();

        return () => {
            clearInterval(
                timerRef.current
            );
        };
    }, [slides]);

    /*
     * Next slide
     */
    const nextSlide = () => {
        if (!slides.length) {
            return;
        }

        setCurrent(
            (previous) =>
                (
                    previous + 1
                ) %
                slides.length
        );

        startAutoSlide();
    };

    /*
     * Previous slide
     */
    const prevSlide = () => {
        if (!slides.length) {
            return;
        }

        setCurrent(
            (previous) =>
                (
                    previous -
                    1 +
                    slides.length
                ) %
                slides.length
        );

        startAutoSlide();
    };

    /*
     * Touch start
     */
    const handleTouchStart = (event) => {
        isSwiping.current = false;

        touchStartX.current =
            event.touches[0].clientX;

        touchEndX.current =
            event.touches[0].clientX;
    };

    /*
     * Touch move
     */
    const handleTouchMove = (event) => {
        touchEndX.current =
            event.touches[0].clientX;

        if (
            Math.abs(
                touchStartX.current -
                    touchEndX.current
            ) > 20
        ) {
            isSwiping.current = true;
        }
    };

    /*
     * Touch end
     */
    const handleTouchEnd = () => {
        if (!isSwiping.current) {
            return;
        }

        const difference =
            touchStartX.current -
            touchEndX.current;

        if (Math.abs(difference) < 50) {
            return;
        }

        if (difference > 0) {
            nextSlide();
        } else {
            prevSlide();
        }

        touchStartX.current = 0;
        touchEndX.current = 0;
        isSwiping.current = false;
    };

    /*
     * Nothing to display
     */
    if (!slides.length) {
        return null;
    }

    const show =
        slides[current];

    if (!show) {
        return null;
    }

    const movieName =
        show["Movie Name"] ||
        "Unknown Movie";

    const imdbId =
        show["IMDB ID"];

    const poster =
        show.Poster;

    const year =
        show.Year;

    const description =
        show.Description ||
        "Watch this movie in HD quality.";

    return (
        <div
            className="hero-slider"

            onTouchStart={
                handleTouchStart
            }

            onTouchMove={
                handleTouchMove
            }

            onTouchEnd={
                handleTouchEnd
            }
        >

            {/* Background */}
            <img
                key={
                    poster ||
                    movieName
                }

                src={poster}

                alt={movieName}

                className="hero-background"

                onError={(event) => {
                    event.currentTarget.onerror =
                        null;

                    event.currentTarget.src =
                        `https://placehold.co/1200x700/222/fff?font=arial&text=${placeholderTitle(
                            movieName
                        )}`;
                }}
            />

            {/* Dark overlay */}
            <div className="hero-overlay" />

            {/* Content */}
            <div className="hero-content">

                <h1>
                    {movieName}
                </h1>

                <div className="hero-meta">

                    <span>
                        {year}
                    </span>

                    <span>
                        •
                    </span>

                    <span>
                        HD
                    </span>

                </div>

                <p>
                    {description}
                </p>

                {imdbId && (
                    <Link
                        to={`/watch/${imdbId}`}
                        onClick={() => {
                            sessionStorage.setItem(
                                "home_scroll_position",
                                String(window.scrollY)
                            );
                        }}
                        className="hero-watch-btn"
                    >
                        ▶ Watch Now
                    </Link>
                )}

            </div>

            {/* Previous */}
            {slides.length > 1 && (
                <button
                    type="button"
                    className="
                        hero-arrow
                        hero-arrow-left
                    "
                    onClick={prevSlide}
                    aria-label="Previous"
                >
                    ❮
                </button>
            )}

            {/* Next */}
            {slides.length > 1 && (
                <button
                    type="button"
                    className="
                        hero-arrow
                        hero-arrow-right
                    "
                    onClick={nextSlide}
                    aria-label="Next"
                >
                    ❯
                </button>
            )}

            {/* Indicators */}
            {slides.length > 1 && (
                <div className="hero-indicators">

                    {slides.map(
                        (_, index) => (
                            <button
                                key={index}
                                type="button"

                                className={`
                                    hero-indicator
                                    ${
                                        current ===
                                        index
                                            ? "active"
                                            : ""
                                    }
                                `}

                                onClick={() => {
                                    setCurrent(
                                        index
                                    );

                                    startAutoSlide();
                                }}

                                aria-label={`Go to slide ${
                                    index + 1
                                }`}
                            />
                        )
                    )}

                </div>
            )}

        </div>
    );
}
