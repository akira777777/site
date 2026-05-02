import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Users, Wine } from 'lucide-react';

const events = [
  {
    title: 'Roulette Night',
    desc: 'High stakes, low light, zero pretense.',
    image: '/images/roulette_wheel.jpg',
    tags: ['Table Games', 'VIP'],
    icon: Calendar,
  },
  {
    title: 'Poker Room',
    desc: 'Quiet tables. Loud outcomes.',
    image: '/images/cards_portrait.jpg',
    tags: ['Private', 'Cash Games'],
    icon: Users,
  },
  {
    title: 'Late Lounge',
    desc: 'After midnight, the rules change.',
    image: '/images/bar_drinks.jpg',
    tags: ['Cocktails', 'Live DJ'],
    icon: Wine,
  },
];

export default function PreviewSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current;
    const marquee = marqueeRef.current;
    if (!section || !heading || !cards || !marquee) return;

    // Heading fade up
    gsap.fromTo(
      heading,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Cards stagger reveal
    const cardElements = cards.querySelectorAll('.event-card');
    gsap.fromTo(
      cardElements,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cards,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Marquee entrance
    gsap.fromTo(
      marquee,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === section || st.vars.trigger === cards) st.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="events"
      className="relative w-full bg-casino-ink py-[8vh]"
      style={{ zIndex: 90 }}
    >
      {/* Heading */}
      <h2
        ref={headingRef}
        className="text-center font-serif text-4xl md:text-5xl lg:text-6xl text-casino-ivory uppercase mb-16"
      >
        Upcoming Evenings
      </h2>

      {/* Cards grid */}
      <div
        ref={cardsRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-[6vw] mb-20"
      >
        {events.map((event) => {
          const Icon = event.icon;
          return (
            <div
              key={event.title}
              className="event-card group bg-casino-charcoal rounded-xl overflow-hidden shadow-card hover:shadow-glow transition-all duration-500"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-casino-charcoal to-transparent" />
                <Icon className="absolute top-4 right-4 w-5 h-5 text-casino-ember" />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-2xl text-casino-ivory mb-2">
                  {event.title}
                </h3>
                <p className="text-casino-muted text-sm mb-4 leading-relaxed">
                  {event.desc}
                </p>
                <div className="flex gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs px-3 py-1 bg-casino-ink text-casino-muted rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Marquee bar */}
      <div className="overflow-hidden py-8 border-y border-casino-ivory/10">
        <div
          ref={marqueeRef}
          className="flex whitespace-nowrap animate-marquee"
        >
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="font-serif text-3xl md:text-4xl text-casino-ivory/20 mx-8 shrink-0"
            >
              Upcoming Evenings — Upcoming Evenings — Upcoming Evenings — Upcoming Evenings —
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
