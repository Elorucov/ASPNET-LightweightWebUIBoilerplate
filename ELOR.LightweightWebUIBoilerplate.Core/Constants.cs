namespace ELOR.LightweightWebUIBoilerplate.Core
{
    public static class Constants
    {
        // First value (0) is a default language for server.
        public static readonly IReadOnlyDictionary<byte, string> SupportedCultures = new Dictionary<byte, string> {
            { 0, "en-US" },
            { 1, "ru-RU" }
        };

        // Web — HttpContext keys
        public const string FAILED_FIELDS = "FailedFields";

        // Web — view/temp data keys
        public const string INFO_MESSAGE = "InfoMessage";
        public const string INVITE_LINK_INFO = "InviteLinkInfo";
    }
}
