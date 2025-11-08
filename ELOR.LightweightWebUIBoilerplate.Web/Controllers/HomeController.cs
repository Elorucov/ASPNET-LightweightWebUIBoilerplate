using ELOR.LightweightWebUIBoilerplate.Core;
using Microsoft.AspNetCore.Mvc;

namespace ELOR.LightweightWebUIBoilerplate.Web.Controllers
{
    public class HomeController : WebController
    {
        [Route("/")]
        [HttpGet]
        public IActionResult Index()
        {
            return View("~/Views/Pages/Index.cshtml");
        }

        [Route("/confirm")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ConfirmTest()
        {
            return AjaxSnackbar("Success!");
        }

        [Route("/ajax_test")]
        [HttpGet]
        public async Task<IActionResult> AjaxTest()
        {
            return await ViewOrBoxAsync("~/Views/Pages/AjaxTest.cshtml");
        }

        [Route("/ajax_message_box_test")]
        [HttpGet]
        public IActionResult AjaxMessageBoxTest()
        {
            return AjaxMessageBox("Hello!", "This is message from server", "OK");
        }

        [Route("/error_test")]
        [HttpGet]
        public IActionResult ErrorTest()
        {
            return Error(Errors.INTERNAL_SERVER);
        }

        [Route("/form_test")]
        [HttpGet]
        public async Task<IActionResult> FormTest()
        {
            return await ViewOrFormBoxAsync("~/Views/Pages/FormTest.cshtml");
        }

        [Route("/form_test")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult FormTestPost(string a, string b, bool c, bool d, string e)
        {
            if (a == "err")
            {
                return InfoMessageError("~/Views/Pages/FormTest.cshtml", Errors.INVALID_PARAMETER, "Custom error");
            }
            return Message("Form values", $"{a}<br/>{b}<br/>{c}<br/>{d}<br/>{e}");
        }
    }
}
