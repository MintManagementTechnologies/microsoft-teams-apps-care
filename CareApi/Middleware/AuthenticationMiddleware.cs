using CareApi.Models;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace CareApi.Middleware
{
    public class AuthenticationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly Settings _settings;
        private readonly string[] _excludedPaths = new[] { "/api/messages", "/api/notify" };
        public AuthenticationMiddleware(RequestDelegate next,
            Settings settings)
        {
            _settings = settings;
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            var path = context.Request.Path.Value;
            bool excluded = false;
            foreach (var excludedPath in _excludedPaths)
            {
                if (path.Contains(excludedPath))
                {
                    excluded = true; break;
                }
            }
            if (excluded || context.Request.Method == "OPTIONS")
            {
                await _next(context);
                return;
            };

            string authHeader = context.Request.Headers["Authorization"];
            if (authHeader == null || !_settings.APIKeys.Contains(authHeader))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return;
            }
            //Pass to the next middleware
            await _next(context);
        }
    }
}
