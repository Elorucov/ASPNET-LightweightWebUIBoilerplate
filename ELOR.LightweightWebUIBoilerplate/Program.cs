using ELOR.LightweightWebUIBoilerplate.Core.Extensions;
using ELOR.LightweightWebUIBoilerplate.Web;
using Microsoft.AspNetCore.HttpOverrides;

namespace ELOR.LightweightWebUIBoilerplate
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Start web listener
            Task webTask = Task.Factory.StartNew(() =>
            {
                var builder = WebApplication.CreateBuilder(args);
                AddRequiredServices(builder);
                WebServer.Run(builder);
            });

            Task.WaitAll(webTask);
        }

        private static void AddRequiredServices(WebApplicationBuilder builder)
        {
            builder.Services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders =
                    ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedPrefix;
            });

            builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            builder.Services.AddCoreServices();
        }
    }
}