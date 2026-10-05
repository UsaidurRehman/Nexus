using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Nexus.Api.Configuration;
using Nexus.Api.Data;
using Nexus.Api.Helpers;
using Nexus.Api.Models.Dtos;

namespace Nexus.Api.Services;

/// <summary>
/// Authenticates against the AdminUsers table using BCrypt password hashes
/// and issues a signed JWT used by the admin panel.
/// </summary>
public class AuthService : IAuthService
{
    private readonly NexusDbContext _db;
    private readonly JwtSettings _jwt;
    private readonly ILogger<AuthService> _log;

    public AuthService(NexusDbContext db, IOptions<JwtSettings> jwt, ILogger<AuthService> log)
    {
        _db = db;
        _jwt = jwt.Value;
        _log = log;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto dto, CancellationToken ct = default)
    {
        var username = dto.Username.Trim();

        var user = await _db.AdminUsers
            .FirstOrDefaultAsync(u => u.Username == username && u.IsActive, ct);

        // Same error for "no such user" and "wrong password" — no user enumeration.
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            _log.LogWarning("Failed login attempt for '{Username}'", username);
            throw new ApiException("Invalid username or password.", StatusCodes.Status401Unauthorized);
        }

        var expires = DateTime.UtcNow.AddMinutes(_jwt.ExpiryMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.AdminId.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, user.AdminId.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        _log.LogInformation("Admin '{Username}' signed in", user.Username);

        return new LoginResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Username = user.Username,
            Role = user.Role,
            ExpiresAt = expires,
        };
    }
}
