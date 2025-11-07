namespace ELOR.LightweightWebUIBoilerplate.Core.Services
{
    public class BaseUrls
    {
        public string WebBaseUrl { get; private set; }

        public void SetWebUrl(string url)
        {
            if (WebBaseUrl == null) WebBaseUrl = url;
        }
    }
}
