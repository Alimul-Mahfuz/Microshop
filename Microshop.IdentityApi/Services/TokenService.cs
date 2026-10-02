using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microshop.IdentityApi.Models;

namespace Microshop.IdentityApi.Services;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(ApplicationUser user, IList<string> roles);
}

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string Token, DateTime ExpiresAt) GenerateToken(ApplicationUser user, IList<string> roles)
    {
        var secretKey = _configuration["Jwt:SecretKey"] ?? "SuperSecretKeyForMicroshopIdentityApiJwtSigningMustBe32BytesOrLonger!";
        var issuer = _configuration["Jwt:Issuer"] ?? "Microshop.IdentityApi";
        var audience = _configuration["Jwt:Audience"] ?? "Microshop.Clients";
        var expiryInMinutes = int.TryParse(_configuration["Jwt:ExpiryInMinutes"], out var min) ? min : 120;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("given_name", user.FirstName),
            new("family_name", user.LastName)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var expiresAt = DateTime.UtcNow.AddMinutes(expiryInMinutes);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return (tokenHandler.WriteToken(token), expiresAt);
    }
}
