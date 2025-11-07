using System.Globalization;

namespace ELOR.LightweightWebUIBoilerplate.Core.DTO
{
    public class ServiceResponse<T>
    {
        public T Data { get; private set; }
        public int HttpStatusCode { get; private set; }
        public ushort ErrorCode { get; private set; }
        public string ErrorMessage { get; private set; }
        public string AdditionalErrorMessage { get; private set; }
        public Tuple<string, string> ParameterErrorReason { get; private set; }

        public ServiceResponse(T data)
        {
            Data = data;
        }

        public static ServiceResponse<T> Error(ushort errorCode, string additionalErrorMessage = null)
        {
            var lang = CultureInfo.CurrentCulture;
            return new ServiceResponse<T>(default)
            {
                ErrorCode = errorCode,
                HttpStatusCode = Errors.HttpStatusCodes.TryGetValue(errorCode, out int value) ? value : 200,
                ErrorMessage = $"Error #{errorCode}",
                AdditionalErrorMessage = additionalErrorMessage
            };
        }

        public static ServiceResponse<T> RequestValidationError(string parameter, string reason)
        {
            ushort errorCode = Errors.INVALID_PARAMETER;
            return new ServiceResponse<T>(default)
            {
                ErrorCode = errorCode,
                HttpStatusCode = Errors.HttpStatusCodes[errorCode],
                ErrorMessage = $"Error #{errorCode}",
                ParameterErrorReason = new Tuple<string, string>(parameter, reason)
            };
        }
    }
}
