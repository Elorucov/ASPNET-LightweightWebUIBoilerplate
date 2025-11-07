using ELOR.LightweightWebUIBoilerplate.Core.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.DependencyInjection;

namespace ELOR.LightweightWebUIBoilerplate.Core.Extensions
{
    public static class ServiceCollectionExtensions
    {
        static readonly BaseUrls _baseUrls = new BaseUrls();

        public static void AddCoreServices(this IServiceCollection services)
        {
            services.AddSingleton<BaseUrls>((o) => _baseUrls);

            services.AddLocalization();
            services.Configure<RequestLocalizationOptions>(options =>
            {
                options.RequestCultureProviders.Clear();
                options.RequestCultureProviders.Add(new QueryStringRequestCultureProvider());
                options.RequestCultureProviders.Add(new CookieRequestCultureProvider());
                options.RequestCultureProviders.Add(new AcceptLanguageHeaderRequestCultureProvider());

                var supportedCultures = Constants.SupportedCultures;
                options.SetDefaultCulture(supportedCultures[0])
                    .AddSupportedCultures(supportedCultures.Values.ToArray())
                    .AddSupportedUICultures(supportedCultures.Values.ToArray());
            });
        }
    }
}
