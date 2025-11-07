using System.Text.Json.Serialization;

namespace ELOR.LightweightWebUIBoilerplate.Web.DataModels
{
    internal enum AjaxResponseType
    {
        [JsonStringEnumMemberName("redirect")] Redirect,
        [JsonStringEnumMemberName("eval")] JSCommand,
        [JsonStringEnumMemberName("box")] Box,
        [JsonStringEnumMemberName("message_box")] MessageBox,
        [JsonStringEnumMemberName("form_box")] FormBox,
        [JsonStringEnumMemberName("snackbar")] Snackbar,
        [JsonStringEnumMemberName("insert")] Insert,
    }

    internal class AjaxResponse
    {
        public AjaxResponseType Type { get; private set; }
        public string ElementId { get; private set; }
        public string BoxId { get; private set; }
        public string Title { get; private set; }
        public string Content { get; private set; }
        public bool? Scrollable { get; private set; }
        public string BoxAux { get; private set; }
        public string BoxButton { get; private set; }
        public double? BoxWidth { get; private set; }
        public string Action { get; private set; }
        public string Uri { get; private set; }
        public string Code { get; private set; }

        private AjaxResponse() { }

        internal static AjaxResponse CreateRedirect(string uri)
        {
            return new AjaxResponse
            {
                Type = AjaxResponseType.Redirect,
                Uri = uri
            };
        }

        internal static AjaxResponse CreateJSCommand(string code)
        {
            return new AjaxResponse
            {
                Type = AjaxResponseType.JSCommand,
                Code = code
            };
        }

        internal static AjaxResponse CreateBox(string id, string title, string content, bool? scrollable = null, double? width = null, string aux = null)
        {
            return new AjaxResponse
            {
                Type = AjaxResponseType.Box,
                BoxId = id,
                Title = title,
                Content = content,
                Scrollable = scrollable,
                BoxWidth = width,
                BoxAux = aux
            };
        }

        internal static AjaxResponse CreateMessageBox(string title, string content, string button = null)
        {
            return new AjaxResponse
            {
                Type = AjaxResponseType.MessageBox,
                Title = title,
                Content = content,
                BoxButton = button
            };
        }

        internal static AjaxResponse CreateFormBox(string title, string content, string button, string actionUri, double? width = null)
        {
            return new AjaxResponse
            {
                Type = AjaxResponseType.FormBox,
                Title = title,
                Content = content,
                BoxButton = button,
                Action = actionUri,
                BoxWidth = width
            };
        }

        internal static AjaxResponse CreateSnackbar(string content)
        {
            return new AjaxResponse
            {
                Type = AjaxResponseType.Snackbar,
                Content = content
            };
        }

        internal static AjaxResponse CreateForContentInsert(string elementId, string content)
        {
            return new AjaxResponse
            {
                Type = AjaxResponseType.Insert,
                ElementId = elementId,
                Content = content
            };
        }
    }
}
