using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexus.Api.Models.Dtos;
using Nexus.Api.Services;

namespace Nexus.Api.Controllers;

[ApiController]
[Route("api/v1/tiers")]
[Produces("application/json")]
public class TiersController : ControllerBase
{
    private readonly ITierService _service;
    public TiersController(ITierService service) => _service = service;

    /// <summary>All tiers with their active event counts.</summary>
    [HttpGet, AllowAnonymous]
    [ProducesResponseType(typeof(List<TierDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TierDto>>> GetAll(CancellationToken ct)
        => Ok(await _service.GetAllAsync(ct));

    [HttpGet("{id:int}"), AllowAnonymous]
    [ProducesResponseType(typeof(TierDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TierDto>> GetById(int id, CancellationToken ct)
        => Ok(await _service.GetByIdAsync(id, ct));

    [HttpPost, Authorize]
    [ProducesResponseType(typeof(TierDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<TierDto>> Create([FromBody] TierSaveDto dto, CancellationToken ct)
    {
        var created = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.TierId }, created);
    }

    [HttpPut("{id:int}"), Authorize]
    [ProducesResponseType(typeof(TierDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TierDto>> Update(int id, [FromBody] TierSaveDto dto, CancellationToken ct)
        => Ok(await _service.UpdateAsync(id, dto, ct));

    /// <summary>Blocked with 409 while any event still references the tier.</summary>
    [HttpDelete("{id:int}"), Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
