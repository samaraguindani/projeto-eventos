using System.Diagnostics;
using System.Text;
using ProjetoEventosAuth.Data;
using System.Security.Claims;

namespace ProjetoEventosAuth.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ApplicationDbContext dbContext)
    {
        var stopwatch = Stopwatch.StartNew();
        var originalBodyStream = context.Response.Body;

        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        string? requestBody = null;
        if (context.Request.ContentLength > 0 && context.Request.ContentLength < 10000)
        {
            context.Request.EnableBuffering();
            var buffer = new byte[context.Request.ContentLength ?? 0];
            await context.Request.Body.ReadAsync(buffer, 0, buffer.Length);
            requestBody = Encoding.UTF8.GetString(buffer);
            context.Request.Body.Position = 0;
        }

        await _next(context);

        stopwatch.Stop();

        var responseBodyContent = await GetResponseBodyAsync(responseBody);
        await responseBody.CopyToAsync(originalBodyStream);

        // Obter userId do token JWT se disponível
        int? userId = null;
        var userIdClaim = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int parsedUserId))
        {
            userId = parsedUserId;
        }

        // Registrar log no banco de dados de forma assíncrona
        _ = Task.Run(async () =>
        {
            try
            {
                var log = new ProjetoEventosAuth.Models.Log
                {
                    Timestamp = DateTime.UtcNow,
                    Metodo = context.Request.Method,
                    Url = context.Request.Path + context.Request.QueryString,
                    Ip = context.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = context.Request.Headers["User-Agent"].ToString(),
                    StatusCode = context.Response.StatusCode,
                    UserId = userId,
                    ResponseTime = (int)stopwatch.ElapsedMilliseconds,
                    RequestBody = requestBody,
                    ResponseBody = responseBodyContent?.Length > 10000 ? "Response too large" : responseBodyContent
                };

                dbContext.Logs.Add(log);
                await dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao registrar log");
            }
        });
    }

    private async Task<string?> GetResponseBodyAsync(MemoryStream responseBody)
    {
        responseBody.Seek(0, SeekOrigin.Begin);
        var text = await new StreamReader(responseBody).ReadToEndAsync();
        responseBody.Seek(0, SeekOrigin.Begin);
        return text;
    }
}

