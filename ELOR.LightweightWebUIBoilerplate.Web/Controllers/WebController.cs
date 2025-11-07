using ELOR.LightweightWebUIBoilerplate.Core;
using ELOR.LightweightWebUIBoilerplate.Core.Localizations;
using ELOR.LightweightWebUIBoilerplate.Web.DataModels;
using ELOR.LightweightWebUIBoilerplate.Web.Extensions;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace ELOR.LightweightWebUIBoilerplate.Web.Controllers
{
    public class WebController : Controller
    {
        public WebController() { }

        protected async Task<IActionResult> ViewOrBoxAsync(string viewPath, object model = null)
        {
            if (HttpContext.IsAjaxRequest())
            {
                string html = await this.RenderViewToStringAsync(viewPath, model);

                var items = HttpContext.Items;
                AjaxResponse response = AjaxResponse.CreateBox((string)items["BoxId"], (string)items["BoxTitle"], html, (bool)items["BoxScrollable"], (double?)items["BoxWidth"], (string)items["BoxAux"]);
                var resp = new List<AjaxResponse> { response };

                if (items.ContainsKey("AjaxJSCommand")) resp.Add(AjaxResponse.CreateJSCommand((string)items["AjaxJSCommand"]));

                return Json(resp);
            }
            else
            {
                return View(viewPath);
            }
        }

        protected async Task<IActionResult> ViewOrFormBoxAsync(string viewPath, object model = null)
        {
            if (HttpContext.IsAjaxRequest())
            {
                string html = await this.RenderViewToStringAsync(viewPath, model);

                var items = HttpContext.Items;
                AjaxResponse response = AjaxResponse.CreateFormBox((string)items["BoxTitle"], html, (string)items["BoxButton"], (string)items["BoxAction"], (double?)items["BoxWidth"]);
                var resp = new List<AjaxResponse> { response };

                if (items.ContainsKey("AjaxJSCommand")) resp.Add(AjaxResponse.CreateJSCommand((string)items["AjaxJSCommand"]));

                return Json(resp);
            }
            else
            {
                return View(viewPath);
            }
        }

        protected IActionResult AjaxCompatibleRedirect(string url)
        {
            if (HttpContext.IsAjaxRequest())
            {
                AjaxResponse response = AjaxResponse.CreateRedirect(url);
                HttpContext.Response.ContentType = "application/json";
                return Json(new AjaxResponse[] { response });
            }
            else
            {
                return Redirect(url);
            }
        }

        protected IActionResult AjaxMessageBox(string title, string message, string button = null)
        {
            if (!HttpContext.IsAjaxRequest()) return BadRequest();

            AjaxResponse response = AjaxResponse.CreateMessageBox(title, message, button);
            return Json(new AjaxResponse[] { response });
        }

        protected IActionResult AjaxSnackbar(string message)
        {
            if (!HttpContext.IsAjaxRequest()) return BadRequest();

            AjaxResponse response = AjaxResponse.CreateSnackbar(message);
            return Json(new AjaxResponse[] { response });
        }

        protected IActionResult Message(string title, string message)
        {
            if (HttpContext.IsAjaxRequest())
            {
                AjaxResponse response = AjaxResponse.CreateMessageBox(title, message, WebLoc.Close);
                HttpContext.Response.ContentType = "application/json";
                return Json(new AjaxResponse[] { response });
            }
            else
            {
                return View("~/Views/Pages/Message.cshtml", (title, message));
            }
        }

        protected IActionResult Error(ushort errorCode, string customMessage = null)
        {
            string title = "Error";
            string message = customMessage ?? WebLoc.ResourceManager.GetString($"Err_{errorCode}");
            if (!Errors.HttpStatusCodes.TryGetValue(errorCode, out int httpStatus)) httpStatus = 200;
            HttpContext.Response.StatusCode = httpStatus;
            return Message(title, message);
        }

        // The page defined in viewPath must have code below for non-ajax:
        // @if (ViewData.ContainsKey("InfoMessage"))
        // {
        //     @Html.Raw(ViewData["InfoMessage"].ToString())
        // }
        //
        // and code below for ajax:
        //
        // <div id="info_message_root"></div>
        //
        protected IActionResult InfoMessage(string viewPath, string message, string title = null, InfoMessageType type = InfoMessageType.Default, object model = null)
        {
            var html = CustomHtmlHelpers.InfoMessage(HttpContext, message, title, type).Value;

            if (HttpContext.IsAjaxRequest())
            {
                AjaxResponse response = AjaxResponse.CreateForContentInsert("info_message_root", html);
                var resp = new List<AjaxResponse> { response };
                HttpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                return Json(resp);
            }
            else
            {
                ViewData[Constants.INFO_MESSAGE] = html;
                return View(viewPath, model);
            }
        }

        protected IActionResult InfoMessageError(string viewPath, ushort errorCode, string customMessage = null, object model = null)
        {
            string title = WebLoc.Error;
            string message = customMessage ?? WebLoc.ResourceManager.GetString($"Err_{errorCode}");
            if (!Errors.HttpStatusCodes.TryGetValue(errorCode, out int httpStatus)) httpStatus = 200;
            HttpContext.Response.StatusCode = httpStatus;
            return InfoMessage(viewPath, message, WebLoc.Error, InfoMessageType.Error, model);
        }
    }
}
