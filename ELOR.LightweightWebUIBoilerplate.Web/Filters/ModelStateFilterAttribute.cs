using ELOR.LightweightWebUIBoilerplate.Web.Extensions;
using Microsoft.AspNetCore.Mvc.Filters;

namespace ELOR.LightweightWebUIBoilerplate.Web.Filters
{
    internal class ModelStateFilterAttribute : ActionFilterAttribute
    {
        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (!context.ModelState.IsValid)
            {
                Dictionary<string, string> fields = new Dictionary<string, string>();
                foreach (var state in context.ModelState)
                {
                    if (state.Value.Errors.Count > 0) fields.Add(state.Key, string.Join("; ", state.Value.Errors.Select(e => e.ErrorMessage)).Trim());
                }

                context.HttpContext.SetValidationError(fields);
            }

            await next();
        }
    }
}
