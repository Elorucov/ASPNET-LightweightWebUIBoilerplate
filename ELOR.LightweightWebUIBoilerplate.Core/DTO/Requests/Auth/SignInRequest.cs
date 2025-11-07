using System.ComponentModel.DataAnnotations;

namespace ELOR.LightweightWebUIBoilerplate.Core.DTO.Requests.Auth
{
    public class SignInRequest
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        public bool RememberMe { get; set; }
    }
}
