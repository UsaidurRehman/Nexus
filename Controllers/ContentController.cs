using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Nexus.Api.Models.Dtos;
using Nexus.Api.Services;

namespace Nexus.Api.Controllers;

/// <summary>Fest-level content: FestInfo, FAQs, organising team, contact form.</summary>
[ApiController]
[Route("api/v1")]
[Produces("application/json")]
public class ContentController : ControllerBase
{
    private readonly IContentService _service;
    public ContentController(IContentService service) => _service = service;

    /// <summary>Fest info for the hero, countdown, SEO tags and footer.</summary>
    [HttpGet("fest"), AllowAnonymous]
    [ProducesResponseType(typeof(FestInfoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FestInfoDto>> GetFest(CancellationToken ct)
    {
        var fest = await _service.GetFestInfoAsync(ct);
        return fest is null ? NotFound() : Ok(fest);
    }

    [HttpGet("faqs"), AllowAnonymous]
    [ProducesResponseType(typeof(List<FaqDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<FaqDto>>> GetFaqs(CancellationToken ct)
        => Ok(await _service.GetFaqsAsync(ct));

    [HttpGet("team"), AllowAnonymous]
    [ProducesResponseType(typeof(List<TeamMemberDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TeamMemberDto>>> GetTeam(CancellationToken ct)
        => Ok(await _service.GetTeamAsync(ct));

    /// <summary>Submit a contact message. Rate limited and honeypot protected.</summary>
    [HttpPost("contact"), AllowAnonymous, EnableRateLimiting("contact")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitContact(
        [FromBody] ContactMessageCreateDto dto, CancellationToken ct)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _service.SubmitContactMessageAsync(dto, ip, ct);
        return Accepted(new { message = "Thank you. Your message has been received." });
    }

    /// <summary>Liveness probe for uptime monitoring during the festival.</summary>
    [HttpGet("health"), AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Health() => Ok(new
    {
        status = "Healthy",
        utc = DateTime.UtcNow,
        service = "Nexus.Api",
        version = "1.0.0",
    });
}
