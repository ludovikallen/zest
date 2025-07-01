using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace ZestTests;

public class ZestIntegrationTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task PublicEndpoint_ReturnsSuccessStatusCode()
    {
        // Act
        var response = await _client.GetAsync("/api/test");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        Assert.Equal("Hello from Zest Test!", content);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutAuth_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/protected");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AuthEndpoints_RegisterAndLogin_Works()
    {
        // Arrange
        var registerModel = new
        {
            email = "test@example.com",
            password = "Password123!"
        };

        // Act - Register
        var registerResponse = await _client.PostAsJsonAsync(
            "/register",
            registerModel);

        // Assert - Registration successful
        registerResponse.EnsureSuccessStatusCode();

        // Act - Login
        var loginModel = new
        {
            email = "test@example.com",
            password = "Password123!"
        };

        var loginResponse = await _client.PostAsJsonAsync("/login?useCookies=true", loginModel);

        // Assert - Login successful
        loginResponse.EnsureSuccessStatusCode();

        // Store cookies for authenticated requests
        var cookies = loginResponse.Headers
            .Where(h => h.Key.Equals("Set-Cookie", StringComparison.OrdinalIgnoreCase))
            .SelectMany(h => h.Value);

        // Act - Check account status
        var request = new HttpRequestMessage(HttpMethod.Get, "/account/status");
        foreach (var cookie in cookies)
        {
            request.Headers.Add("Cookie", cookie);
        }

        var statusResponse = await _client.SendAsync(request);

        // Assert - Account status endpoint works
        statusResponse.EnsureSuccessStatusCode();
        var content = await statusResponse.Content.ReadAsStringAsync();
        Assert.Contains("true", content.ToLower());
    }

    [Fact]
    public async Task ProtectedEndpoint_WithAuth_ReturnsSuccess()
    {
        // Arrange - Register and login
        var registerModel = new
        {
            email = "protected@example.com",
            password = "Password123!",
        };

        await _client.PostAsJsonAsync("/register", registerModel);

        var loginModel = new
        {
            email = "protected@example.com",
            password = "Password123!"
        };

        var loginResponse = await _client.PostAsJsonAsync("/login?useCookies=true", loginModel);
        loginResponse.EnsureSuccessStatusCode();

        var cookies = loginResponse.Headers
            .Where(h => h.Key.Equals("Set-Cookie", StringComparison.OrdinalIgnoreCase))
            .SelectMany(h => h.Value);

        // Act - Access protected endpoint with auth
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/protected");
        foreach (var cookie in cookies)
        {
            request.Headers.Add("Cookie", cookie);
        }

        var protectedResponse = await _client.SendAsync(request);

        // Assert
        protectedResponse.EnsureSuccessStatusCode();
        var content = await protectedResponse.Content.ReadAsStringAsync();
        Assert.Equal("Protected data", content);
    }

    [Fact]
    public async Task LogoutEndpoint_AfterLogin_ClearsAuthentication()
    {
        // Arrange - Register and login
        var registerModel = new
        {
            email = "logout@example.com",
            password = "Password123!"
        };

        await _client.PostAsJsonAsync("/register", registerModel);

        var loginModel = new
        {
            email = "logout@example.com",
            password = "Password123!"
        };

        var loginResponse = await _client.PostAsJsonAsync("/login?useCookies=true", loginModel);
        loginResponse.EnsureSuccessStatusCode();

        var cookies = loginResponse.Headers
            .Where(h => h.Key.Equals("Set-Cookie", StringComparison.OrdinalIgnoreCase))
            .SelectMany(h => h.Value);

        // Act - Logout
        var logoutRequest = new HttpRequestMessage(HttpMethod.Post, "/logout");
        foreach (var cookie in cookies)
        {
            logoutRequest.Headers.Add("Cookie", cookie);
        }

        var logoutResponse = await _client.SendAsync(logoutRequest);

        // Assert - Logout successful
        logoutResponse.EnsureSuccessStatusCode();

        // Now try to access protected endpoint
        var protectedRequest = new HttpRequestMessage(HttpMethod.Get, "/api/protected");

        var protectedResponse = await _client.SendAsync(protectedRequest);

        // Should be unauthorized after logout
        Assert.Equal(HttpStatusCode.Unauthorized, protectedResponse.StatusCode);
    }
}