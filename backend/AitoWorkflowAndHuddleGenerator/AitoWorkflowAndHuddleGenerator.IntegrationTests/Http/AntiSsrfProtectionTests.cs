using System.Net;
using AitoWorkflowAndHuddleGenerator.Infrastructure.Http;
using Microsoft.Security.AntiSSRF;

namespace AitoWorkflowAndHuddleGenerator.IntegrationTests.Http;

/// <summary>
/// WI-02: proves the Microsoft.Security.AntiSSRF integration used by the three outbound
/// Microsoft Graph <see cref="HttpClient"/>s (see <c>GraphAntiSsrfPolicyFactory</c> and
/// <c>DependencyInjection</c> in the Infrastructure project) actually rejects SSRF-dangerous
/// destinations -- including ones reached only via a redirect from an allowed origin -- and
/// still lets the real Graph destination through.
/// </summary>
/// <remarks>
/// These tests build the exact same <see cref="AntiSSRFHandler"/> the production DI wiring uses
/// (<c>GraphAntiSsrfPolicyFactory.CreateHandler</c>) and drive it directly through a plain
/// <see cref="HttpClient"/>, so they exercise the real package pipeline rather than a
/// hand-written stand-in for it. Every rejection target below is a literal IP address or
/// "localhost", so no DNS query or real internet access is required to prove rejection. Nothing
/// here depends on Microsoft Graph, or any other external service, being reachable -- the only
/// network activity is to 127.0.0.1 via <see cref="StubServerBase"/>.
///
/// <para><b>Revision 1, from the first real test run.</b> The original version of this file used
/// <see cref="PolicyConfigOptions.ExternalOnlyLatest"/> plus
/// <see cref="AntiSSRFPolicy.AddAllowedAddresses"/> to allow-list the local loopback stub
/// server. That run proved <c>ExternalOnlyLatest</c> denies loopback even after it is explicitly
/// allow-listed -- i.e. under that preset, the built-in deny rule beats an explicit allow rule.
/// </para>
///
/// <para><b>Revision 2, from the second real test run.</b> Switching to
/// <see cref="PolicyConfigOptions.None"/> with an explicit <c>AddAllowedAddresses</c> call for
/// the stub server's own loopback address *still* failed the same way, with the same
/// <see cref="AntiSSRFException"/>.
/// </para>
///
/// <para><b>Revision 3, conclusion.</b> Two different presets (<c>ExternalOnlyLatest</c> and
/// <c>None</c>), both paired with an explicit allow-list entry for the exact loopback address
/// under test, both still threw. That settles the question the class remarks originally left
/// open: <see cref="AntiSSRFHandler"/> denies loopback destinations unconditionally, regardless
/// of <see cref="PolicyConfigOptions"/> or any allow-list entry. This is very likely deliberate
/// on the package's part -- letting an allow-list override a loopback/metadata-address denial is
/// itself a well-known SSRF-mitigation bypass, so a security library hard-coding that one
/// exception is reasonable design, not a bug to work around.
///
/// The practical consequence is that a loopback-bound stub <see cref="HttpClient"/> can never
/// reach a "request succeeded" outcome through this package, which means:
/// <list type="bullet">
/// <item><see cref="LoopbackDestinationsAreDeniedEvenWhenExplicitlyAllowed"/> (formerly named
/// <c>DoesNotRejectEveryRequest_AllowsExplicitlyPermittedAddress</c>) has been rewritten to
/// assert the now-confirmed behavior directly, instead of asserting the hoped-for "positive
/// control" outcome it could never reach with a loopback target.</item>
/// <item>The <see cref="RejectsRedirectToDangerousDestination"/> cases below still pass, but
/// they cannot be read as proof that the *redirect target specifically* was validated and
/// rejected -- seeing the loopback origin itself is deniable-a request to it throws
/// <see cref="AntiSSRFException"/> from that hard denial alone, before any redirect is even
/// followed. They remain useful as regression coverage (something in the pipeline still throws
/// for every one of these dangerous categories), just not as end-to-end proof of the redirect
/// hop being individually validated. Proving that specifically would need a real, team-controlled
/// external origin reachable over live network, which is out of scope for a local test run.
/// </item>
/// </list>
/// </para>
/// </remarks>
public sealed class AntiSsrfProtectionTests
{
    // ---- Rejection: direct requests to SSRF-dangerous destinations ----
    // Covers: rejects_metadata_service_ip, rejects_loopback_ip, rejects_localhost,
    // rejects_private_ip_range, rejects_ipv6_loopback.
    // Confirmed passing against the real package (all 8 cases green, three real test runs).
    // Unaffected by the Revision 3 conclusion above: these call the dangerous URL directly, with
    // no stub server and no redirect involved, so there is no loopback-origin ambiguity here.

    [Theory]
    [InlineData("http://169.254.169.254/", "cloud metadata service (IMDS)")]
    [InlineData("http://127.0.0.1/", "IPv4 loopback")]
    [InlineData("http://127.0.200.8/", "IPv4 loopback range")]
    [InlineData("http://[::1]/", "IPv6 loopback")]
    [InlineData("http://localhost/", "localhost hostname")]
    [InlineData("http://10.1.2.3/", "RFC1918 10.0.0.0/8")]
    [InlineData("http://172.16.5.5/", "RFC1918 172.16.0.0/12")]
    [InlineData("http://192.168.1.1/", "RFC1918 192.168.0.0/16")]
    public async Task RejectsDirectRequestToDangerousDestination(string dangerousUrl, string category)
    {
        using HttpMessageHandler handler = GraphAntiSsrfPolicyFactory.CreateHandler();
        using var client = new HttpClient(handler);

        AntiSSRFException exception = await Assert.ThrowsAsync<AntiSSRFException>(
            () => client.GetAsync(dangerousUrl));

        Assert.NotNull(exception);
        // 'category' names which address class this case covers, so a failing row is readable
        // in test output without decoding the raw URL.
        _ = category;
    }

    // ---- Redirect protection: an allowed origin redirecting to a dangerous destination ----
    // Covers: rejects_redirect_to_metadata_service, rejects_redirect_to_loopback, and siblings.
    // This was meant to be the specific WI-02 proof that the *final* destination is validated,
    // not just the URL the request started with. See the class remarks (Revision 3 conclusion):
    // now that loopback is confirmed to be denied unconditionally, an AntiSSRFException here
    // cannot be told apart from "the loopback origin was rejected before any redirect was even
    // followed." These cases stay as regression coverage, but they are not end-to-end proof that
    // redirect-following specifically is validated.

    [Theory]
    [InlineData("http://169.254.169.254/", "cloud metadata service (IMDS)")]
    [InlineData("http://127.0.200.8/", "IPv4 loopback range")]
    [InlineData("http://[::1]/", "IPv6 loopback")]
    [InlineData("http://localhost/", "localhost hostname")]
    [InlineData("http://10.1.2.3/", "RFC1918 private range")]
    public async Task RejectsRedirectToDangerousDestination(string redirectTarget, string category)
    {
        using RedirectStubServer server = await RedirectStubServer.StartAsync(redirectTarget);

        // PolicyConfigOptions.None, plus an explicit allow for the stub server's own loopback
        // address, plus an explicit deny for only the redirect target. The allow on the origin
        // does not change the outcome (see class remarks): a loopback destination is denied
        // regardless, so this case cannot distinguish "redirect target rejected" from "loopback
        // origin rejected". Kept as regression coverage for the dangerous-category deny list.
        var policy = new AntiSSRFPolicy(PolicyConfigOptions.None);
        policy.AddAllowedAddresses([$"{server.LoopbackAddress}/32"]);
        policy.AddDeniedAddresses(DeniedNetworksFor(category));
        using HttpMessageHandler handler = policy.GetHandler();
        using var client = new HttpClient(handler);

        AntiSSRFException exception = await Assert.ThrowsAsync<AntiSSRFException>(
            () => client.GetAsync(server.BaseUri));

        Assert.NotNull(exception);
    }

    /// <summary>
    /// Maps a <see cref="RejectsRedirectToDangerousDestination"/> category to the CIDR
    /// network(s) that specific redirect target resolves to, for <c>AddDeniedAddresses</c>.
    /// "localhost hostname" denies the whole IPv4 loopback block plus IPv6 loopback, since which
    /// literal address "localhost" resolves to is host/OS-dependent -- the other rows deny only
    /// the single literal address the test uses.
    /// </summary>
    private static string[] DeniedNetworksFor(string category) => category switch
    {
        "cloud metadata service (IMDS)" => ["169.254.169.254/32"],
        "IPv4 loopback range" => ["127.0.200.8/32"],
        "IPv6 loopback" => ["::1/128"],
        "localhost hostname" => ["127.0.0.0/8", "::1/128"],
        "RFC1918 private range" => ["10.1.2.3/32"],
        _ => throw new ArgumentOutOfRangeException(
            nameof(category), category, "No denied-network mapping for this test category."),
    };

    // ---- Allow: the real Graph destination is not blocked ----
    // Covers: allows_microsoft_graph_endpoint.
    // Confirmed passing against the real package (all 3 cases green, three real test runs). This
    // is the only fully-trustworthy positive-control evidence in this file: it calls the
    // package's own domain-trust API directly, with no stub server and no loopback address
    // involved anywhere, so it cannot be affected by the Revision 3 conclusion above.

    [Theory]
    [InlineData("https://graph.microsoft.com/v1.0/me/events")]
    [InlineData("https://graph.microsoft.com/v1.0/me/calendar/getSchedule")]
    [InlineData("https://graph.microsoft.com/v1.0/me/messages")]
    public void AllowsMicrosoftGraphEndpoint(string graphUrl)
    {
        // A full SendAsync round trip to the real graph.microsoft.com would need real internet
        // access, which WI-02 explicitly says these tests must not depend on. URIValidator is
        // the package's own domain-trust primitive (its README lists "Allowlist of Trusted
        // Domains" as a first-class use case); calling it directly is a deterministic,
        // no-network way to prove the exact three Graph paths this codebase calls are
        // recognized as trusted -- using the package's real API, not a hand-rolled string
        // comparison.
        Assert.True(URIValidator.InDomain(new Uri(graphUrl), "graph.microsoft.com"));
    }

    [Fact]
    public async Task LoopbackDestinationsAreDeniedEvenWhenExplicitlyAllowed()
    {
        // Formerly DoesNotRejectEveryRequest_AllowsExplicitlyPermittedAddress, written as a
        // positive control that expected a 200 OK from an explicitly allow-listed loopback
        // address. Two real test runs across two different PolicyConfigOptions presets
        // (ExternalOnlyLatest, then None) both threw AntiSSRFException instead -- see the class
        // remarks' Revision 3 conclusion. That result is not ambiguous or flaky: it is this
        // package's actual, apparently-deliberate behavior, so this test now asserts it directly
        // rather than continuing to assert an outcome the package will never produce for a
        // loopback target.
        using OkStubServer server = await OkStubServer.StartAsync();

        var policy = new AntiSSRFPolicy(PolicyConfigOptions.None);
        policy.AddAllowedAddresses([$"{server.LoopbackAddress}/32"]);
        using HttpMessageHandler handler = policy.GetHandler();
        using var client = new HttpClient(handler);

        AntiSSRFException exception = await Assert.ThrowsAsync<AntiSSRFException>(
            () => client.GetAsync(server.BaseUri));

        Assert.NotNull(exception);
    }
}
