import { useMemo } from 'react';
import Seo from '../components/common/Seo.jsx';
import AsyncBoundary from '../components/common/AsyncBoundary.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import SectionTitle from '../components/common/SectionTitle.jsx';
import { useFestInfo, useOrganisingTeam } from '../hooks/useFestData.js';
import { ROUTES, buildMonogram } from '../config.js';

function MemberCard({ member }) {
  return (
    <article className="nx-surface flex items-center gap-4 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-nexus-mint/35">
      {member.photoUrl ? (
        <img
          src={member.photoUrl}
          alt={member.fullName}
          loading="lazy"
          decoding="async"
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/12 bg-gradient-to-br from-nexus-navy to-nexus-blue font-display text-base text-white/75"
          aria-hidden="true"
        >
          {buildMonogram(member.fullName)}
        </span>
      )}

      <div className="min-w-0">
        <h3 className="truncate font-semibold text-white">{member.fullName}</h3>
        {member.role ? <p className="text-xs text-nexus-mint">{member.role}</p> : null}
        {member.linkedInUrl ? (
          <a
            href={member.linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs text-slate-400 transition-colors hover:text-nexus-mint"
          >
            LinkedIn
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function Team() {
  const teamQuery = useOrganisingTeam();
  const { data: festInfo } = useFestInfo();
  const members = teamQuery.data || [];

  // Group by department, preserving the server's display order.
  const groups = useMemo(() => {
    const map = new Map();
    members.forEach((member) => {
      const key = member.department || 'Organising Team';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(member);
    });
    return Array.from(map.entries());
  }, [members]);

  return (
    <>
      <Seo
        title="Organising Team"
        description="Meet the executive council and directorate leads behind BIIT Nexus 2026."
        path={ROUTES.TEAM}
      />

      <section className="relative overflow-hidden border-b border-white/8 pb-14 pt-32 sm:pt-36">
        <div className="nx-glow absolute inset-0 opacity-80" aria-hidden="true" />
        <div className="nx-grid-bg absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="nx-container relative">
          <span className="nx-chip">Who we are</span>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,7vw,4.75rem)] leading-[0.92] tracking-tightest">
            <span className="nx-gradient-text">Organising Team</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            The executive council and directorate leads running {festInfo?.name || 'Nexus'}.
          </p>
          {festInfo?.executiveHead ? (
            <p className="mt-4 text-sm text-slate-400">
              Led by{' '}
              <span className="font-semibold text-white">{festInfo.executiveHead}</span>, Executive
              Head.
            </p>
          ) : null}
        </div>
      </section>

      <div className="nx-container space-y-14 py-16 sm:py-20">
        <AsyncBoundary
          isLoading={teamQuery.isLoading}
          isError={teamQuery.isError}
          error={teamQuery.error}
          onRetry={teamQuery.refetch}
        >
          {members.length === 0 ? (
            <EmptyState
              title="Team not published yet"
              message="The organising team roster will appear here once it is confirmed."
            />
          ) : (
            groups.map(([department, people]) => (
              <section key={department}>
                <SectionTitle eyebrow={`${people.length} member${people.length === 1 ? '' : 's'}`} title={department} />
                <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {people.map((member) => (
                    <MemberCard key={member.memberId} member={member} />
                  ))}
                </div>
              </section>
            ))
          )}
        </AsyncBoundary>
      </div>
    </>
  );
}
