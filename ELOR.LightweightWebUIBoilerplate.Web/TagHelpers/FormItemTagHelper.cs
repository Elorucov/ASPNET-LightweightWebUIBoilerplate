using Microsoft.AspNetCore.Mvc.TagHelpers;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;

namespace ELOR.LightweightWebUIBoilerplate.Web.TagHelpers
{
    public class FormItemTagHelper : TagHelper
    {
        private bool IsInput(string content, out string inputId)
        {
            inputId = string.Empty;
            if (content.Length == 0) return false;
            var tagsReg = new Regex(@"(<input[A-Za-z0-9._\/\s\S]+type=""(text|email|password)""|<textarea|<select|<token-input)", RegexOptions.Compiled);

            content = content.Trim();
            if (tagsReg.IsMatch(content))
            {
                // Get "id" attribute for "for" attr in label
                Regex idReg = new Regex(@"id=""(\w*)""", RegexOptions.Compiled);
                var matches = idReg.Matches(content);

                if (matches.Count == 1 && matches[0].Groups.Count == 2) inputId = matches[0].Groups[1].Value;
                return true;
            }
            return false;
        }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            string label = context.AllAttributes.ContainsName("label") ? context.AllAttributes["label"].Value.ToString() : string.Empty;
            string labelClass = string.Empty;

            var content = await output.GetChildContentAsync();
            var contentStr = content.GetContent();

            output.TagName = "div";
            output.Attributes.RemoveAll("label");
            output.AddClass("form_item", HtmlEncoder.Default);
            if (IsInput(contentStr, out string inputId)) output.AddClass("for_text_input", HtmlEncoder.Default);

            string forAttr = string.IsNullOrEmpty(inputId) ? string.Empty : $" for=\"{inputId}\"";
            output.PreContent.SetHtmlContent($"<label{forAttr}>{label}</label><div class=\"form_item_value\">");
            output.PostContent.SetHtmlContent($"</div>");
        }
    }
}
