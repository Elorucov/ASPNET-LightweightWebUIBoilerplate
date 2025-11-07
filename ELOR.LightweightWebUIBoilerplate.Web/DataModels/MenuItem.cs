namespace ELOR.LightweightWebUIBoilerplate.Web.DataModels
{
    public class MenuItem
    {
        public string Id { get; private set; }
        public string Label { get; private set; }
        public string IconId { get; private set; }
        public string ControllerName { get; private set; }
        public string ActionName { get; private set; }
        public string RawPath { get; private set; }

        public MenuItem(string id, string label, string iconId, string controllerName, string actionName)
        {
            Id = id;
            Label = label;
            IconId = iconId;
            ControllerName = controllerName;
            ActionName = actionName;
        }

        public MenuItem(string id, string label, string rawPath)
        {
            Id = id;
            Label = label;
            RawPath = rawPath;
        }
    }
}
