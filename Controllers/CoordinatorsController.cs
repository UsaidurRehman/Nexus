using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexus.Api.Models.Dtos;
using Nexus.Api.Services;

namespace Nexus.Api.Controllers;

[ApiController]
[Route("api/v1/coordinators")]
[Produces("application/json")]
public class CoordinatorsController : ControllerBase
{
    private readonly ICoordinatorService _service;
    public CoordinatorsController(ICoordinatorService service) => _service = service;

    /// <summary>All coordinators, optionally filtered to one event.</summary>
    [HttpGet, AllowAnonymous]
    [ProducesResponseType(typeof(List<CoordinatorDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CoordinatorDto>>> GetAll(
        [FromQuery] int? eventId, CancellationToken ct)
        => Ok(await _service.GetAllAsync(eventId, ct));

    [HttpGet("{id:int}"), AllowAnonymous]
    [ProducesResponseType(typeof(CoordinatorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CoordinatorDto>> GetById(int id, CancellationToken ct)
        => Ok(await _service.GetByIdAsync(id, ct));

    /// <summary>Assign a coordinator to an event. Rejects duplicates with 409.</summary>
    [HttpPost, Authorize]
    [ProducesResponseType(typeof(CoordinatorDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CoordinatorDto>> Create(
        [FromBody] CoordinatorSaveDto dto, CancellationToken ct)
    {
        var created = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.CoordinatorId }, created);
    }

    [HttpPut("{id:int}"), Authorize]
    [ProducesResponseType(typeof(CoordinatorDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CoordinatorDto>> Update(
        int id, [FromBody] CoordinatorSaveDto dto, CancellationToken ct)
        => Ok(await _service.UpdateAsync(id, dto, ct));

    [HttpDelete("{id:int}"), Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
