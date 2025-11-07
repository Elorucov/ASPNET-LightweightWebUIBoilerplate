using ELOR.LightweightWebUIBoilerplate.Web.DataModels;
using ELOR.LightweightWebUIBoilerplate.Web.Services;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Encodings.Web;

namespace ELOR.LightweightWebUIBoilerplate.Web.Extensions
{
    internal static class CustomHtmlHelpers
    {
        public static HtmlString CheckBoxLabeled(this IHtmlHelper html, string name, string label, bool isChecked = false, string tooltipText = null, bool dontSend = false)
        {
            if (string.IsNullOrEmpty(name)) throw new ArgumentNullException(nameof(name));

            string checkedStr = isChecked ? " checked" : "";
            string inputName = dontSend ? "" : $" name=\"{name}\"";
            string tooltip = string.IsNullOrEmpty(tooltipText) ? "" : $" title=\"{tooltipText}\"";
            string result = $"<input type=\"checkbox\" id=\"{name}\"{inputName} value=\"true\"{checkedStr}/><label for=\"{name}\"{tooltip}>{label}</label><input{inputName} type=\"hidden\" value=\"false\"/>";

            return new HtmlString(result);
        }

        public static HtmlString CheckBoxForm(this IHtmlHelper html, string name, string label, bool isChecked = false, string tooltipText = null, bool dontSend = false)
        {
            return new HtmlString($"<span>{html.CheckBoxLabeled(name, label, isChecked, tooltipText, dontSend)}</span>");
        }

        public static HtmlString RadioButtonLabeled(this IHtmlHelper html, string name, string value, string label, bool isChecked = false)
        {
            if (string.IsNullOrEmpty(name)) throw new ArgumentNullException(nameof(name));
            if (string.IsNullOrEmpty(value)) throw new ArgumentNullException(nameof(value));

            string checkedStr = isChecked ? " checked" : "";
            string result = $"<input type=\"radio\" id=\"{name}\" name=\"{name}\" value=\"{value}\"{checkedStr}/><label for=\"{name}\">{label}</label>";

            return new HtmlString(result);
        }

        public static HtmlString RadioButtonForm(this IHtmlHelper html, string name, string value, string label, bool isChecked = false)
        {
            return new HtmlString($"<span>{html.RadioButtonLabeled(name, value, label, isChecked)}</span>");
        }

        public static HtmlString InfoMessage(HttpContext context, string message, string title = null, InfoMessageType type = InfoMessageType.Default, Dictionary<string, string> attributes = null)
        {
            TagBuilder root = new TagBuilder("info-message");
            ClientBrowserService browser = context.RequestServices.GetService<ClientBrowserService>();

            if (type != InfoMessageType.Default)
            {
                root.Attributes.Add("class", type.ToString().ToLower());

                if (!browser.IsMobile())
                {
                    SVGEmbeddingService svg = context.RequestServices.GetService<SVGEmbeddingService>();

                    switch (type)
                    {
                        case InfoMessageType.Success:
                            root.InnerHtml.AppendHtml(svg.GetSVGElement("spec_ok_32"));
                            break;
                        case InfoMessageType.Error:
                            root.InnerHtml.AppendHtml(svg.GetSVGElement("spec_error_32"));
                            break;
                    }
                }
            }

            TagBuilder content = new TagBuilder("content");

            if (!string.IsNullOrEmpty(title))
            {
                TagBuilder bold = new TagBuilder("b");
                bold.InnerHtml.AppendHtml(title);
                content.InnerHtml.AppendHtml(bold);
                content.InnerHtml.AppendHtml("<br/>");
            }
            content.InnerHtml.AppendHtml(message);
            root.InnerHtml.AppendHtml(content);

            if (attributes != null)
            {
                foreach (var attribute in attributes) root.Attributes.Add(attribute.Key, attribute.Value);
            }

            using var writer = new StringWriter();
            root.WriteTo(writer, HtmlEncoder.Default);
            return new HtmlString(writer.ToString());
        }

        public static HtmlString InfoMessage(this IHtmlHelper html, string message, string title = null, InfoMessageType type = InfoMessageType.Default, Dictionary<string, string> attributes = null)
        {
            return InfoMessage(html.ViewContext.HttpContext, message, title, type, attributes);
        }
    }
}
