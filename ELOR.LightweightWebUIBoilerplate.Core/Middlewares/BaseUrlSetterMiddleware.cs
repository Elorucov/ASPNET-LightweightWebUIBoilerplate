using ELOR.LightweightWebUIBoilerplate.Core.Extensions;
using ELOR.LightweightWebUIBoilerplate.Core.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace ELOR.LightweightWebUIBoilerplate.Core.Middlewares
{
    public class BaseUrlSetterMiddleware
    {
        readonly RequestDelegate _next;

        public BaseUrlSetterMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var baseUrls = context.RequestServices.GetService<BaseUrls>();
            var baseUrl = context.GetBaseUrl();
            baseUrls.SetWebUrl(baseUrl);

            await _next.Invoke(context);
        }
    }
}