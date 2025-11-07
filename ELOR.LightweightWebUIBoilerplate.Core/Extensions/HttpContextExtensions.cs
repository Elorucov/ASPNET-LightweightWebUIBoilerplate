using Microsoft.AspNetCore.Http;

namespace ELOR.LightweightWebUIBoilerplate.Core.Extensions
{
    public static class HttpContextExtensions
    {
        public static string GetBaseUrl(this HttpContext context)
        {
            var request = context.Request;
            var host = request.Host.ToUriComponent();
            var pathBase = request.PathBase.ToUriComponent();
            return $"{request.Scheme}://{host}{pathBase}";
        }
    }
}
