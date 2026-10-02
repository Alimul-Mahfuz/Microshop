namespace Microshop.IdentityApi.Models;

public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName
);

public record LoginRequest(
    string Email,
    string Password
);

public record AuthResponse(
    bool Success,
    string Token,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto? User,
    IEnumerable<string>? Errors = null
);

public record UserDto(
    string Id,
    string Email,
    string FirstName,
    string LastName,
    IList<string> Roles
);
