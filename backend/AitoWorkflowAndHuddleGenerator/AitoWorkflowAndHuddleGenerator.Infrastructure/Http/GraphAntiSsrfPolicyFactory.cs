using Microsoft.Security.AntiSSRF;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Http;

/// <summary>
/// Builds the single Microsoft.Security.AntiSSRF policy shared by every outbound Microsoft
/// Graph <see cref="HttpClient"/>, and hands out the resulting <see cref="AntiSSRFHandler"/> as
/// the primary <see cref="HttpMessageHandler"/> for each one.
/// </summary>
/// <remarks>
/// WI-02: all three named Graph clients (Coaching, Workflow calendar, Huddle launch mail) call
/// only the public, external "https://graph.microsoft.com/v1.0/" endpoint, so they share the
/// package's "External" preset rather than "InternalOnly". <see cref="PolicyConfigOptions.ExternalOnlyLatest"/>
/// denies loopback, link-local (including the 169.254.169.254 cloud metadata address),
/// RFC1918/RFC4193 private ranges, and the other reserved/internal address categories the
/// package tracks in its own recommended range list, while still permitting ordinary public
/// internet destinations such as Microsoft Graph. This is the package's own built-in "external
/// address HTTP client" configuration (see its README's "Private Network Protection" feature) --
/// no IP ranges are hand-maintained here.
///
/// <see cref="AntiSSRFHandler"/> is a primary <see cref="HttpMessageHandler"/> (it wraps its own
/// internal <c>SocketsHttpHandler</c>), not a <see cref="DelegatingHandler"/>, so it is wired in
/// via <c>ConfigurePrimaryHttpMessageHandler</c>, not <c>AddHttpMessageHandler</c>. Its
/// constructor is internal; the only way to obtain an instance is
/// <see cref="AntiSSRFPolicy.GetHandler"/>. The one shared, already-configured
/// <see cref="AntiSSRFPolicy"/> below is reused across calls -- only the returned
/// <see cref="AntiSSRFHandler"/> is created fresh each time <see cref="CreateHandler"/> runs, so
/// each named client gets its own handler/connection-pool instance.
/// </remarks>
public static class GraphAntiSsrfPolicyFactory
{
    private static readonly AntiSSRFPolicy GraphPolicy = new(PolicyConfigOptions.ExternalOnlyLatest);

    /// <summary>
    /// Creates a new AntiSSRF-protected primary <see cref="HttpMessageHandler"/> for a Microsoft
    /// Graph named <see cref="HttpClient"/>. Pass this as the delegate to
    /// <c>ConfigurePrimaryHttpMessageHandler</c>.
    /// </summary>
    public static HttpMessageHandler CreateHandler() => GraphPolicy.GetHandler();
}
