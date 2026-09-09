using System.Net;
using System.Net.Sockets;
using System.Text;

namespace AitoWorkflowAndHuddleGenerator.IntegrationTests.Http;

/// <summary>
/// Minimal local-only HTTP/1.1 stub server used by <see cref="AntiSsrfProtectionTests"/> as a
/// "trusted" redirect origin and as an explicitly-allowed positive control.
/// </summary>
/// <remarks>
/// Deliberately built on a raw <see cref="TcpListener"/> rather than <see cref="HttpListener"/>:
/// <see cref="HttpListener"/> requires a URL-ACL reservation (or admin rights) to bind even a
/// loopback prefix on Windows, which would make these tests fail on an unprivileged dev machine
/// or build agent for reasons that have nothing to do with WI-02. A bare TCP accept loop plus a
/// hand-written status line has no such requirement, never leaves 127.0.0.1, and needs no new
/// package dependency.
/// </remarks>
internal abstract class StubServerBase : IDisposable
{
    private readonly TcpListener _listener;
    private readonly CancellationTokenSource _cts = new();
    private Task? _acceptLoop;

    protected StubServerBase()
    {
        _listener = new TcpListener(IPAddress.Loopback, 0);
        _listener.Start();
        var endpoint = (IPEndPoint)_listener.LocalEndpoint;
        LoopbackAddress = endpoint.Address.ToString();
        BaseUri = new Uri($"http://{LoopbackAddress}:{endpoint.Port}/");
    }

    /// <summary>The loopback address (always 127.0.0.1) this server is bound to.</summary>
    public string LoopbackAddress { get; }

    /// <summary>The URI clients should request.</summary>
    public Uri BaseUri { get; }

    /// <summary>The full HTTP/1.1 response (status line, headers, blank line) sent for every request.</summary>
    protected abstract string BuildResponse();

    /// <summary>
    /// Starts accepting connections. Called by each derived type's factory method only after its
    /// own fields (e.g. the redirect Location) are fully initialized, so <see cref="BuildResponse"/>
    /// never runs against a partially-constructed instance.
    /// </summary>
    protected void Start()
    {
        _acceptLoop = Task.Run(AcceptLoopAsync);
    }

    private async Task AcceptLoopAsync()
    {
        try
        {
            while (!_cts.IsCancellationRequested)
            {
                using TcpClient client = await _listener.AcceptTcpClientAsync(_cts.Token);
                await using NetworkStream stream = client.GetStream();

                // The request itself is intentionally never read -- these stub servers answer
                // every connection identically regardless of the request line, which is all the
                // redirect/allow tests need.
                byte[] bytes = Encoding.ASCII.GetBytes(BuildResponse());
                await stream.WriteAsync(bytes, _cts.Token);
                await stream.FlushAsync(_cts.Token);
            }
        }
        catch (OperationCanceledException)
        {
            // Shutdown -- expected.
        }
        catch (ObjectDisposedException)
        {
            // Listener disposed during shutdown -- expected.
        }
    }

    public void Dispose()
    {
        _cts.Cancel();
        _listener.Stop();
    }
}

/// <summary>Always responds 302 to a fixed Location header, to test redirect-bypass protection.</summary>
internal sealed class RedirectStubServer : StubServerBase
{
    private readonly string _location;

    private RedirectStubServer(string location) => _location = location;

    public static Task<RedirectStubServer> StartAsync(string location)
    {
        var server = new RedirectStubServer(location);
        server.Start();
        return Task.FromResult(server);
    }

    protected override string BuildResponse() =>
        "HTTP/1.1 302 Found\r\n" +
        $"Location: {_location}\r\n" +
        "Content-Length: 0\r\n" +
        "Connection: close\r\n\r\n";
}

/// <summary>Always responds 200 OK, used as an explicitly-allowed positive control.</summary>
internal sealed class OkStubServer : StubServerBase
{
    public static Task<OkStubServer> StartAsync()
    {
        var server = new OkStubServer();
        server.Start();
        return Task.FromResult(server);
    }

    protected override string BuildResponse() =>
        "HTTP/1.1 200 OK\r\n" +
        "Content-Length: 0\r\n" +
        "Connection: close\r\n\r\n";
}
