using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Nexus.Api.Helpers;

namespace Nexus.Api.Middleware;

/// <summary>
/// Converts every unhandled exception into an RFC 7807 ProblemDetails
/// response. Internal details are never leaked outside Development.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _log;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> log,
        IHostEnvironment env)
    {
        _next = next;
        _log = log;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ApiException ex)
        {
            await WriteProblem(context, ex.StatusCode, ex.Message, null);
        }
        catch (DbUpdateExceptionWrapper ex)
        {
            await WriteProblem(context, StatusCodes.Status409Conflict, ex.Message, null);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Unhandled exception on {Method} {Path}",
                context.Request.Method, context.Request.Path);

            await WriteProblem(
                context,
                StatusCodes.Status500InternalServerError,
                "An unexpected error occurred while processing your request.",
                _env.IsDevelopment() ? ex.ToString() : null);
        }
    }

    private static async Task WriteProblem(HttpContext ctx, int status, string title, string? detail)
    {
        if (ctx.Response.HasStarted) return;

        ctx.Response.Clear();
        ctx.Response.StatusCode = status;
        ctx.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = detail,
            Instance = ctx.Request.Path,
        };
        problem.Extensions["traceId"] = ctx.TraceIdentifier;

        await ctx.Response.WriteAsync(JsonSerializer.Serialize(problem,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}

/// <summary>Marker used to surface FK/unique violations as 409s.</summary>
public class DbUpdateExceptionWrapper : Exception
{
    public DbUpdateExceptionWrapper(string message) : base(message) { }
}
