using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexus.Api.Models.Dtos;
using Nexus.Api.Services;

namespace Nexus.Api.Controllers;

/// <summary>
/// Events: public read endpoints plus protected write endpoints used by the
/// admin panel. All reads are anonymous; every mutation requires a JWT.
/// </summary>
[ApiController]
[Route("api/v1/events")]
[Produces("application/json")]
public class EventsController : ControllerBase
{
    private readonly IEventService _service;
    public EventsController(IEventService service) => _service = service;

    /// <summary>
    /// Search, filter, sort and page the event catalog.
    /// Supports: tier (1|2|3), categoryId, category (slug), search, featured,
    /// minFee, maxFee, teamSize, isActive, sortBy, desc, page, pageSize.
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResult<EventListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<EventListDto>>> GetAll(
        [FromQuery] EventQueryParameters query, CancellationToken ct)
        => Ok(await _service.GetEventsAsync(query, ct));

    /// <summary>Full detail by numeric id (rules, coordinators, tier, category, venue, slots).</summary>
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EventDetailDto>> GetById(int id, CancellationToken ct)
        => Ok(await _service.GetByIdAsync(id, ct));

    /// <summary>Full detail by URL slug. Falls back to a numeric id.</summary>
    [HttpGet("slug/{slug}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EventDetailDto>> GetBySlug(string slug, CancellationToken ct)
        => Ok(await _service.GetBySlugAsync(slug, ct));

    /// <summary>Aggregate counts for the admin dashboard.</summary>
    [HttpGet("stats")]
    [Authorize]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardStatsDto>> GetStats(CancellationToken ct)
        => Ok(await _service.GetDashboardStatsAsync(ct));

    /// <summary>Create an event. Slug is generated from Title when omitted.</summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<EventDetailDto>> Create(
        [FromBody] EventSaveDto dto, CancellationToken ct)
    {
        var created = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.EventId }, created);
    }

    /// <summary>Update an event. Supplying Rules replaces the entire rule list.</summary>
    [HttpPut("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EventDetailDto>> Update(
        int id, [FromBody] EventSaveDto dto, CancellationToken ct)
        => Ok(await _service.UpdateAsync(id, dto, ct));

    /// <summary>
    /// Deactivates the event (IsActive = 0). Pass ?hard=true to permanently
    /// delete it and cascade to rules, coordinators and schedule slots.
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool hard = false, CancellationToken ct = default)
    {
        await _service.DeleteAsync(id, hard, ct);
        return NoContent();
    }
}
