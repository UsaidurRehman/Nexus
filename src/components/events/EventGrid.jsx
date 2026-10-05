import EventCard from './EventCard.jsx';
import RevealOnScroll from '../common/RevealOnScroll.jsx';

const COLUMNS = {
  large: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  medium: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
  compact: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export default function EventGrid({ events, variant = 'medium' }) {
  return (
    <div className={`grid gap-6 ${COLUMNS[variant] || COLUMNS.medium}`}>
      {events.map((event, index) => (
        <RevealOnScroll key={event.eventId || event.slug} delay={Math.min(index, 6) * 70} className="h-full">
          <EventCard event={event} variant={variant} />
        </RevealOnScroll>
      ))}
    </div>
  );
}
