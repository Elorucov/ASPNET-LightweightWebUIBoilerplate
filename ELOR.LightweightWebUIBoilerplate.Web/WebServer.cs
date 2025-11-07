using ELOR.LightweightWebUIBoilerplate.Core.Middlewares;
using ELOR.LightweightWebUIBoilerplate.Web.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using WebMarkupMin.AspNetCoreLatest;
using WebMarkupMin.Core;

namespace ELOR.LightweightWebUIBoilerplate.Web
{
    public class WebServer
    {
        public static void Run(WebApplicationBuilder builder, Action<IServiceProvider> afterSetupCallback = null)
        {
            builder.Services.AddControllersWithViews()
                .AddApplicationPart(typeof(WebServer).Assembly)
                .AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix)
                .AddJsonOptions(opt =>
                {
                    var enumConverter = new JsonStringEnumConverter();
                    opt.JsonSerializerOptions.Converters.Add(enumConverter);
                    opt.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                    opt.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                });

            builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(opt =>
            {
                opt.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                opt.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            });

            builder.Services.AddAntiforgery(o => o.HeaderName = "XSRF");

            builder.Services.AddCors(options =>
            {
                options.AddPolicy(name: "cors", policy => { policy.AllowAnyOrigin(); });
            });

            builder.Services.AddWebMarkupMin(opt =>
            {
                opt.AllowMinificationInDevelopmentEnvironment = true;
            }).AddHtmlMinification(opt =>
            {
                opt.MinificationSettings.AttributeQuotesRemovalMode = HtmlAttributeQuotesRemovalMode.KeepQuotes;
                opt.MinificationSettings.CollapseBooleanAttributes = true;
                opt.MinificationSettings.MinifyEmbeddedJsCode = true;
            });
            builder.Services.AddSingleton<SVGEmbeddingService>();
            builder.Services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
            builder.Services.AddScoped<ClientBrowserService>();

            builder.WebHost.UseUrls("http://localhost:7575");

            // Preloading some stuff
            Task.Factory.StartNew(SVGEmbeddingService.LoadAsync);

            var app = builder.Build();

            app.UseForwardedHeaders();
            app.UseMiddleware<BaseUrlSetterMiddleware>();

            var locOptions = app.Services.GetService<IOptions<RequestLocalizationOptions>>();
            app.UseRequestLocalization(locOptions.Value);

            // get the project wwwroot directory
            var assemblyDirectory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            var wwwRootDirectory = Path.Combine(assemblyDirectory, "wwwroot");

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(wwwRootDirectory)
            });
            app.UseWebMarkupMin();

            app.UseCors("cors");

            app.UseExceptionHandler(c => c.Run(async context =>
            {
                var exception = context.Features.Get<IExceptionHandlerPathFeature>().Error;
                context.Response.ContentType = "text/html";
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await context.Response.WriteAsync($"<!DOCTYPE html><html><head><title>Internal server error</title></head><body><h1>Internal server error</h1><p>{exception.Message}</p><p>{exception.StackTrace}</p></body></html>");
            }));

            app.MapControllers();

            afterSetupCallback?.Invoke(app.Services);
            app.Run();
        }
    }
}
