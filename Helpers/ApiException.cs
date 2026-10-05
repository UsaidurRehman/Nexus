namespace Nexus.Api.Helpers;

/// <summary>Domain error carrying the HTTP status the middleware should emit.</summary>
public class ApiException : Exception
{
    public int StatusCode { get; }

    public ApiException(string message, int statusCode = StatusCodes.Status400BadRequest)
        : base(message) => StatusCode = statusCode;

    public static ApiException NotFound(string what) =>
        new($"{what} was not found.", StatusCodes.Status404NotFound);

    public static ApiException Conflict(string message) =>
        new(message, StatusCodes.Status409Conflict);

    public static ApiException BadRequest(string message) =>
        new(message, StatusCodes.Status400BadRequest);
}
