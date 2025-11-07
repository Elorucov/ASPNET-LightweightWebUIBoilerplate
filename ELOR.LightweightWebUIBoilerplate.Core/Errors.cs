using System.Collections.ObjectModel;
using System.Net;

namespace ELOR.LightweightWebUIBoilerplate.Core
{
    public class Errors
    {
        public const ushort INTERNAL_SERVER = 1;
        public const ushort INVALID_PARAMETER = 2;

        public static ReadOnlyDictionary<ushort, int> HttpStatusCodes = new Dictionary<ushort, int> {
            { INTERNAL_SERVER, (int)HttpStatusCode.InternalServerError },
            { INVALID_PARAMETER, (int)HttpStatusCode.BadRequest }
        }.AsReadOnly();
    }
}
