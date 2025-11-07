using ELOR.LightweightWebUIBoilerplate.Web.DataModels;
using System.Reflection;
using System.Text;
using System.Xml.Linq;
using System.Xml.XPath;

namespace ELOR.LightweightWebUIBoilerplate.Web.Services
{
    public class SVGEmbeddingService
    {
        private static readonly SemaphoreSlim semaphoreSlim = new SemaphoreSlim(1, 1);

        private static Dictionary<string, VectorImage> _svgImages;

        public List<string> GetSprites()
        {
            // if (_svgImages == null) await LoadAsync();

            List<string> contents = _svgImages.Select(s => s.Value.Content).ToList();
            return contents;
        }

        public string GetSVGElement(string id)
        {
            if (_svgImages?.ContainsKey(id) == true)
            {
                var image = _svgImages[id];
                return $"<svg width=\"{image.Width}\" height=\"{image.Height}\"><use xlink:href=\"#{id}\"></use></svg>";
            }
            return string.Empty;
        }

        public static async Task LoadAsync()
        {
            await semaphoreSlim.WaitAsync();

            try
            {
                _svgImages = new Dictionary<string, VectorImage>();

                var assemblyDirectory = Path.GetDirectoryName(AppContext.BaseDirectory);
                var files = Directory.GetFiles(Path.Combine(assemblyDirectory, "wwwroot", "images", "svg"));
                foreach (string filePath in files)
                {
                    string extension = Path.GetExtension(filePath);
                    if (extension != ".svg") continue;

                    try
                    {
                        var vectorImage = await GetContentFromFileAsync(filePath);
                        _svgImages.Add(vectorImage.Id, vectorImage);
                    }
                    catch (Exception)
                    {
                        // TODO: log.
                        continue;
                    }
                }
            }
            finally
            {
                semaphoreSlim.Release();
            }
        }

        private static async Task<VectorImage> GetContentFromFileAsync(string filePath)
        {
            string key = Path.GetFileNameWithoutExtension(filePath);

            StringBuilder sb = new StringBuilder();
            sb.Append(await File.ReadAllTextAsync(filePath));
            sb.Replace("<svg ", $"<symbol id=\"{key}\" ");
            sb.Replace("</svg>", "</symbol>");
            string content = sb.ToString();

            XDocument document = XDocument.Parse(content);
            XPathNavigator navigator = document.CreateNavigator();
            var node = navigator.Select("/symbol");
            string viewBox = node.Current.GetAttribute("viewBox", string.Empty);

            if (string.IsNullOrEmpty(viewBox))
            {
                node.MoveNext();
                viewBox = node.Current.GetAttribute("viewBox", string.Empty);
            }

            if (string.IsNullOrEmpty(viewBox)) return new VectorImage { Id = key, Content = string.Empty, Width = 0, Height = 0 };

            string[] values = viewBox.Split(' ');
            double width = Convert.ToDouble(values[2]);
            double height = Convert.ToDouble(values[3]);

            return new VectorImage { Id = key, Content = content, Width = width, Height = height };
        }
    }
}
