namespace Nexus.Api.Configuration;

public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "NexusApi";
    public string Audience { get; set; } = "NexusWeb";
    public int ExpiryMinutes { get; set; } = 480;
}

public class CorsSettings
{
    public const string SectionName = "Cors";
    public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
}
