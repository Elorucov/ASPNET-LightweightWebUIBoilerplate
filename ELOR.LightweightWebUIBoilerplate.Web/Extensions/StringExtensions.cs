using System.Text;
using WebMarkupMin.Core;

namespace ELOR.LightweightWebUIBoilerplate.Web.Extensions
{
    internal static class StringExtensions
    {
        private static HtmlMinifier _htmlMinifier;

        public static string MinimizeHTML(this string html, HtmlMinificationSettings settings)
        {
            if (_htmlMinifier == null) _htmlMinifier = new HtmlMinifier(settings);
            MarkupMinificationResult result = _htmlMinifier.Minify(html);
            return result.MinifiedContent;
        }

        public static string ToJSVariableString(this Dictionary<string, string> dict, string variableName)
        {
            StringBuilder sb = new StringBuilder();
            sb.Append($"var {variableName} = {{");
            for (int i = 0; i < dict.Count; i++)
            {
                var loc = dict.ElementAt(i);
                sb.Append("\"");
                sb.Append(loc.Key);
                sb.Append("\":\"");
                sb.Append(loc.Value);
                sb.Append("\"");
                if (i != dict.Count - 1) sb.Append(",");
            }
            sb.Append("};");
            return sb.ToString();
        }
    }
}
