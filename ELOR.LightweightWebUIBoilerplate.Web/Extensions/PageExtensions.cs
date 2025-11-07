using ELOR.LightweightWebUIBoilerplate.Core.Localizations;
using Microsoft.AspNetCore.Mvc.Razor;
using System.Globalization;
using System.Resources;

namespace ELOR.LightweightWebUIBoilerplate.Web.Extensions
{
    internal static class PageExtensions
    {
        public static Dictionary<string, string> GetLocalizationStrings<T>(this RazorPage<T> page)
        {
            if (!page.ViewData.ContainsKey("L")) page.ViewData["L"] = new Dictionary<string, string> { { "_lang", CultureInfo.CurrentCulture.Name } };
            return page.ViewData["L"] as Dictionary<string, string>;
        }

        private static void AddLocalizationStrings<T>(ResourceManager resourceManager, RazorPage<T> page, IEnumerable<string> keys)
        {
            var dict = page.GetLocalizationStrings();
            foreach (var key in keys) dict.Add(key, resourceManager.GetString(key));
        }

        public static void AddWebLocalizationStrings<T>(this RazorPage<T> page, IEnumerable<string> keys)
        {
            AddLocalizationStrings(WebLoc.ResourceManager, page, keys);
        }

        public static void AddCommonLocalizationStringsForJSLibs<T>(this RazorPage<T> page)
        {
            string[] keys = ["Cancel", "Close", "Delete", "Error", "NetworkError", "No", "Yes"];
            AddLocalizationStrings(WebLoc.ResourceManager, page, keys);
        }
    }
}
