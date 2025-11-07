using ELOR.LightweightWebUIBoilerplate.Core;
using Microsoft.AspNetCore.Http;

namespace ELOR.LightweightWebUIBoilerplate.Web.Extensions
{
    internal static class HttpContextExtensions
    {
        public static bool IsAjaxRequest(this HttpContext context)
        {
            bool ajax = context.Request.Query.ContainsKey("_ajax") || (context.Request.HasFormContentType && context.Request.Form.ContainsKey("_ajax"));
            return ajax;
        }

        public static void SetupAjaxBox(this HttpContext context, string id, string title, bool scrollable = false, double? width = null, string aux = null)
        {
            context.Items.Add("BoxId", id);
            context.Items.Add("BoxTitle", title);
            context.Items.Add("BoxScrollable", scrollable);
            context.Items.Add("BoxWidth", width);
            context.Items.Add("BoxAux", aux);
        }

        public static void SetupAjaxFormBox(this HttpContext context, string title, string button, string actionUrl, double? width = null)
        {
            context.Items.Add("BoxTitle", title);
            context.Items.Add("BoxButton", button);
            context.Items.Add("BoxAction", actionUrl);
            context.Items.Add("BoxWidth", width);
        }

        public static void AddJSCommandForAjax(this HttpContext context, string code)
        {
            context.Items.Add("AjaxJSCommand", code);
        }

        public static void SetValidationError(this HttpContext context, Dictionary<string, string> fields)
        {
            context.Items.Add(Constants.FAILED_FIELDS, fields);
        }
    }
}
